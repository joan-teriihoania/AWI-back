/**
 * This is the main module initializing the process and overseeing the execution.
 * It manages the HTTP and WebSocket connections and dispatch them to their proper controllers.
 * It also loads in the routing logic as well as managing the rendering process
 * @module server
 */

/*
    Création de personnages
    Blog/Forum par serveur (premium)
    Copie d'un serveur vers un autre (premium)
    Economie
    Inventaire
    Modération

    Panneau de contrôle serveur
    Minecraft voice

    Page facturation
*/

const express = require('express')
const server = express()
const http = require('http').Server(server);

const fs = require('fs');
const fm = require('./modules/fileManager');
const cookieParser = require('cookie-parser'); // module for parsing cookies
const { encrypt, decrypt } = require('./modules/crypto');
const db = require('./modules/db')
const auth = require('./modules/auth')
const dotenv = require('dotenv');
dotenv.config();

const useragent = require('express-useragent');
const ejs = require('ejs');
var compression = require('compression');

var routes = {}

/*
  Read the router.json file to retrieve data about the routes
  and path for the website to load their views
*/

server.use(compression()); //use compression 
server.set('view engine', 'ejs')
server.use(cookieParser());
server.use(express.static('public'));
server.use("/docs", express.static('ressources/docs'));
server.use(express.json());       // to support JSON-encoded bodies
server.use(express.urlencoded()); // to support URL-encoded bodies
server.use(useragent.express());
server.enable('trust proxy')

var favicon = require('serve-favicon');

var loggerRequest = {}
setInterval(function(){
    loggerRequest = {}
}, 1000)

const { getLastPatchnote } = require('./modules/patchnotes');
const { patch } = require('request');
const request = require('request');
const logger = require('./modules/logger');
const { getUserInfo } = require('./modules/users');
const {msToTime} = require("./modules/time");

/**
 * Server HTTP connections entry point
 */
server.all('*', function(req, res, next){
    if(process.env.OUTAGE === "true"){
        request('https://polygenda.betteruptime.com/').pipe(res);
        return
    }

    if(req.protocol + "://" + req.headers.host !== process.env.BASE_URL){
        return res.redirect(process.env.BASE_URL + req.originalUrl);
    }
    
    res.ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress

    if(!loggerRequest[res.ip] || isNaN(loggerRequest[res.ip])){ loggerRequest[res.ip] = 0 }
    loggerRequest[res.ip] = loggerRequest[res.ip] + 1

    if(loggerRequest[res.ip] > process.env.MAX_REQUEST_PER_SECOND){
        res.status(429)
        res.send("Too many requests")
        return
    }

    if (req.url !== "" && req.url !== "/" && req.url.endsWith('/')) {
        res.redirect(req.url.substr(0, req.url.length - 1))
        return
    }

    next()
})

server.get('*', function(req, res, next){
    req.startedAt = new Date()
    // if(res.user.is_auth && req.path.split('/')[1] != "ajax" && req.path.split('/')[1] != "api"){ logger.log("[MONITOR] ("+res.user.username+"@"+res.user.user_id+"-"+res.ip+") >> " + req.path) }
    next()
})

/**
 * Open the HTTP server to connections on the given PORT and starts 
 * setting up the database structure given in database_template.json
 */
http.listen(process.env.PORT, function(){
    logger.log("[EXPRESS] Server listening on port " + process.env.PORT)
    fs.readFile("./database_template.json", function(err, database_template){
        database_template = JSON.parse(database_template.toString())
        db.backup(false)

        for (const [tablename, rows] of Object.entries(database_template)) {
            db.createTable(tablename, rows).then(() => {
                db.select("SELECT COUNT(*) AS nb FROM " + tablename, function(d){
                  logger.log("[DB-CONFIG] Table " + tablename + " configured with " + d[0].nb + " rows")
                })

                db.select("PRAGMA table_info("+tablename+");", function(columns){
                    if(!columns){
                        logger.log("[DB-CONFIG] Could not resolve columns info for " + tablename)
                        return
                    }
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        if(row.primary) continue

                        let row_type_splitted = row.type.split(' ')
                        let row_type = row_type_splitted[0]
                        let default_value = "(0)"

                        if(row.type.includes("DEFAULT")){
                            default_value = row_type_splitted.slice(-(row_type_splitted.length-2))
                        }

                        if(!columns.map((e) => {return e.name}).includes(row.name)){
                            logger.log(`[DB-CONFIG] INFO: Column ${row.name} added in table ${tablename}`)
                            db.run(`DROP TABLE IF EXISTS old_${tablename}`).then(() => {
                                db.run(`ALTER TABLE ${tablename} RENAME TO old_${tablename}`).then(() => {
                                    db.createTable(tablename, rows).then(() => {
                                        db.run(`INSERT INTO ${tablename}(${rows.map((e) => {return e.name}).filter(e => e !== row.name).join(', ')}) SELECT ${rows.map((e) => {return e.name}).filter(e => e != row.name).join(', ')} FROM old_${tablename}`).then(() => {
                                            db.run(`DROP TABLE old_${tablename}`)
                                        })
                                    })
                                })
                            })
                            // db.run(`ALTER TABLE ${tablename} ADD ${row.name} ${row_type} ${row.not_null ? "NOT NULL" : "NULL"} CONSTRAINT const_${row.name}_default DEFAULT ${default_value}`)
                        }
                    }

                    for (let i = 0; i < columns.length; i++) {
                        const column = columns[i];
                        if(!rows.map((e) => {return e.name}).includes(column.name)){
                            logger.log(`[DB-CONFIG] INFO: Column ${column.name} removed in table ${tablename}`)
                            db.run(`DROP TABLE IF EXISTS old_${tablename}`).then(() => {
                                db.run(`ALTER TABLE ${tablename} RENAME TO old_${tablename}`).then(() => {
                                    db.createTable(tablename, rows).then(() => {
                                        db.run(`INSERT INTO ${tablename}(${rows.map((e) => {return e.name}).join(', ')}) SELECT ${rows.map((e) => {return e.name}).join(', ')} FROM old_${tablename}`).then(() => {
                                            db.run(`DROP TABLE old_${tablename}`)
                                        })
                                    })
                                })
                            })
                        }
                    }
                })
            })
        }
    })
})

// LOAD ROUTING PATH
fs.readFile("./router.json", function(err, routerContent){
    routes = JSON.parse(routerContent)
    for (const [method, paths] of Object.entries(routes['api'])) {
      for (const [path, api_info] of Object.entries(paths)) {
        logger.log("[ROUTER] API '" + api_info['filename'] + "' linked to <"+method+"> '" + process.env.API_PATH_PREF + path + "'")

        server.all(process.env.API_PATH_PREF + path, function(req, res, next) {
            update_auth(req, res).then(() => {
                next()
            })
        })

        server.all(process.env.API_PATH_PREF + path, function(req, res, next) {
            if(req.method !== method) return next()

            if(!res.user.is_auth && api_info.login){
                res.status(401)
                res.end("Echec d'authentification : Vous devez être connecté pour accéder à cette page ou faire cette action.")
                return
            }

            if(api_info.admin && (!res.user.is_auth || !res.user.isAdmin)){
                res.status(403)
                res.end("Access to " + req.method + " "+req.url+" restricted to admin only")
                return
            }

            var temp = require("./api/" + api_info['filename'])
            temp.exec(req, res, next, api_info)
        });
      }
    }
    
    server.all(process.env.API_PATH_PREF + "/*", function(req, res, next) {
        res.status(404)
        res.end("Cannot link " + req.method + " "+req.url+" to any API path")
    })

    server.get("*", function(req, res, next) {
        res.status(404)
        res.end("Cannot link " + req.method + " "+req.url+" to any API path")
    })
})


// FUNCTIONS
/**
 * User authentification update function. It will modify the "res" object by adding a "user" property with the user
 * informations from the database depending if the given request object contains valid user authentification informations.
 * This returns a {@link Promise} that will always resolve, whether the user has been authentificated or not as it is not its main
 * objective. However, it is possible to know if the user has been authentificated by checking the res.user.is_auth property.
 * @param {express.Request} req - The request object given by express
 * @param {express.Response} res - The response object given by express
 * @returns {Promise}
 */
function update_auth(req, res){
    return new Promise(function(resolve, reject){
        var auth_ = req.cookies["JZ-Translation-auth"]
        if (!auth_ || auth_ == "undefined"){
            var auth_ = encrypt("{}")
            res.cookie("JZ-Translation-auth", auth_)
        }

        var user = JSON.parse(decrypt(auth_))
        res.user = {
            is_auth: false
        }
        
        auth.is_auth(user, req, async function(auth_method, info, useAuthKey){
            if(info){
                getUserInfo(info.user_id).then((user) => {
                    res.user = user
                    res.user.is_auth = auth_method != false ? true : false
                    res.user.auth_method = auth_method
                    res.user.useAuthKey = useAuthKey
                    resolve()
                }).catch((err) => {
                    resolve()
                })
            } else {
                resolve()
            }
        })
    })
}


/**
 * Page rendering function. It will load the required model and ressource base files, call the controller, render
 * the template file and send the resulting view to the user (if it wasn't sent out by a higher function or the controller).
 * @param {ViewInfo} view - The view informations to render
 * @param {express.Request} req - The request object given by express
 * @param {express.Response} res - The response object given by express
 * @param {boolean} use_framework - Whether the page rendered will use the framework base (useful for loading ajax pages).
 * The framework base file contains the sidebar, navbar, header and footer elements as well as all the scripts and styles files
 * needed when loading the page for the first time. To save ressources, when changing only the page content, you should use
 * this parameter.
 * @param {Object} replaceValues - An object containing pairs of <Key, Value>.
 * The elements contained in this object will be used to replace values in the model as : {{ Key }} -> Value.
 * The values will also be passed to the EJS rendering engine, this allows passing data from the low level to high level rendering functions.
 * @param {Function} callback - A function that will be called after the view is rendered.
 * If set, the view will NOT be sent to the user.
 * @returns {Promise}
 */
function render_page(view, req, res, use_framework = true, replaceValues = {}, callback = undefined){
    if(view.js){res.header('Scripts', view.js.join(','))}
    if(view.forcereload){res.header('ForceReload', 'true')}

    res.header("Title", view.title)
    fm.readFile("./views/framework.ejs", function(err, framework){
        if(use_framework){
            framework = framework.toString()
        } else {
            framework = "{{ page }}"
        }

        fm.readFile("./views/pages/" + view['filename'] + ".ejs", function(err, page){
            if(err) page = "<b></b>"
            var promise
            try {
                var pageController = require('./views/controllers/' + view['filename'] + '.js')
                promise = new Promise(function(resolve, reject){
                    var ressourceFolder = './views/pages/' + view['filename'] + '/'
                    var ressourceFilesPromise = []
                    var ressourceFiles = {}
                    if(fs.existsSync(ressourceFolder)){
                        ressourceFilesPromise.push(new Promise(function(resolve, reject){
                            fs.readdir(ressourceFolder, (err, ressourceFilesNames) => {
                                fm.readFiles(ressourceFolder, ressourceFilesNames, function(_ressourceFiles){
                                    ressourceFiles = _ressourceFiles
                                    resolve()
                                })
                            })
                        }))
                    }

                    Promise.all(ressourceFilesPromise).then(() => {
                        pageController.format(page.toString(), req, res, ressourceFiles, function(page, s){
                            if(view.filename != "login" && res.statusCode == 401){
                                res.redirect("/account/login")
                                return
                            }
                            if(view.filename != "404" && res.statusCode == 404){
                                render_page({"filename": "404", "title": "Page introuvable"}, req, res)
                                return
                            }
                            
                            if(view.filename != "403" && res.statusCode == 403){
                                render_page({"filename": "403", "title": "Accès refusé"}, req, res)
                                return
                            }
                            
                            if(view.filename != "500" && res.statusCode == 500){
                                render_page({"filename": "error", "title": "Erreur interne"}, req, res, use_framework, {
                                    "status": 500,
                                    "title": "Une erreur interne s'est produite",
                                    "message": s.message ? s.message : ""
                                })
                                return
                            }
                            
                            if(s == undefined) s = {}
                            for(var [keyword, replace] of Object.entries(s)){
                            page = page.replace(new RegExp("{{ "+keyword+" }}","gi"), replace);
                            }
                            
                            resolve([page, s])
                        })
                    })
                })
            } catch(err) {
                var template_string = "Error: Cannot find module './views/controllers/"+view['filename']+".js'"
                if(err.toString().includes(template_string)){
                    promise = new Promise(function(resolve, reject){
                        resolve([page.toString(), {}])
                    })
                } else {
                    promise = new Promise(function(resolve, reject){
                        resolve([err.toString(), {}])
                    })
                }
            }
            
            promise.then(function([page, params]){
                if(page == false){return}
                var elementsFolder = "./views/elements/"
                framework = replaceAll(framework, '{{ page }}', page)

                fs.readdir(elementsFolder, (err, elementsFiles) => {
                    fm.readFiles(elementsFolder, elementsFiles, function(dataElementFiles){
                        let loadElements = []

                        for (const [filename, content] of Object.entries(dataElementFiles)) {
                            var _filename = elementsFolder + filename
                            if(_filename.substring(_filename.length - 3) == ".js"){
                                var elementController = require(_filename)
                                
                                var filenameAlone = _filename.split("/")
                                filenameAlone = filenameAlone[filenameAlone.length-1]
                                loadElements.push(new Promise(function(resolve, reject){
                                    var keyword = filenameAlone.substring(0, filenameAlone.length - 3)
                                    elementController.format(dataElementFiles[filename.substring(0, filename.length - 2) + "ejs"], req, res, function(elementContentGene){
                                        framework = replaceAll(framework, '{{ '+keyword+' }}', elementContentGene)
                                        resolve()
                                    })
                                }))
                            }
                        }
            
                        Promise.all(loadElements)
                            .then(async () => { // all done!
                            for (const [key, value] of Object.entries(res.user)) {
                                framework = replaceAll(framework, '{{ data:user.'+key+' }}', res.user[key])
                                if(res.user[key] instanceof Array){framework = replaceAll(framework, '{{ data:user.'+key+'.length }}', res.user[key].length)}
                                if(res.user[key] instanceof Object){framework = replaceAll(framework, '{{ data:user.'+key+'.length }}', Object.keys(res.user[key]).length)}
                            }
                            
                            if(res.user.is_auth){
                                await getLastPatchnote().then((patchnote) => {
                                    if(res.user.last_viewed_patchnote !== patchnote.version){
                                        replaceValues['patchnote'] = patchnote
                                        db.run("UPDATE users SET last_viewed_patchnote = '"+patchnote.version+"' WHERE user_id = " + res.user.user_id)
                                    } else {
                                        replaceValues['patchnote'] = undefined
                                    }
                                })
                            } else {
                                replaceValues['patchnote'] = undefined
                            }

                            replaceValues['res'] = res
                            replaceValues['req'] = req
                            replaceValues['process'] = process
                            replaceValues['user'] = res.user
                            replaceValues['forceComputerView'] = view['forceComputerView']
                            replaceValues['page_title'] = view['title']
                            if(!("breadcrumb" in params)){
                                params['breadcrumb'] = []
                            }

                            replaceValues['breadcrumb-element'] = `
                                <div>
                                    <nav aria-label="breadcrumb">
                                        <ol class="breadcrumb">`
                            for(b of params['breadcrumb']){
                                replaceValues['breadcrumb-element'] += `<li class="breadcrumb-item"><a href="${b.link}">${b.title}</a></li>`
                            }
                            replaceValues['breadcrumb-element'] += `
                                            <li class="breadcrumb-item active" aria-current="page">${view['title']}</li>
                                        </ol>
                                    </nav>
                                </div>`
                            

                            for (const [key, value] of Object.entries(replaceValues)) {
                                framework = replaceAll(framework, '{{ '+key+' }}', replaceValues[key])
                                params[key] = replaceValues[key]
                            }

                            var js_scripts_embed = ""
                            
                            if(view['js']){
                                for(var js_script of view['js']){
                                    js_scripts_embed += '<script class="script-private" src="/assets/js/specific/'+js_script+'"></script>\n'
                                }
                            }

                            framework = replaceAll(framework, '{{ js_script }}', js_scripts_embed)
                            if(!res.headersSent){
                                try {
                                    setTimeout(() => {
                                        if(!res.headersSent){
                                            var cache = [];
                                            res.status(500)
                                            render_page({
                                                "filename": "fatal",
                                                "title": "Erreur fatale",
                                                "css": [],
                                                "js": [],
                                                "login": false,
                                                "autorefresh": false
                                            }, req, res, false, {
                                                "status": 500,
                                                "title": "Erreur fatale",
                                                "message": escapeHtml(JSON.stringify({
                                                    "error": "Page rendering took too long",
                                                    "view": view
                                                })),
                                            })
                                        }
                                    }, 5000)
                                    
                                    // params['slowResponse'] = (new Date().getTime() - req.startedAt.getTime() > 5*1000)
                                } catch (error) {
                                    res.status(500)
                                    render_page({
                                        "filename": "error",
                                        "title": "Erreur interne",
                                        "css": [],
                                        "js": [],
                                        "login": false,
                                        "autorefresh": false
                                    }, req, res, use_framework, {
                                        "status": 500,
                                        "title": "Une erreur interne s'est produite",
                                        "message": escapeHtml(error.toString()),
                                    })
                                }
                            }
                        })
                    })
                });
            })
        })
    })
}

/**
 * Replaces all occurences of replaceWhat in str to replaceTo
 * @param {String} str - The string which will be modified
 * @param {String} replaceWhat - The string that will be replaced
 * @param {String} replaceTo - The string to which replaceWhat will be replaced to
 * @returns {String}
 */
function replaceAll(str,replaceWhat,replaceTo){
    var re = new RegExp(replaceWhat, 'g');
    return str.replace(re,replaceTo);
}
/**
 * Generate an random authentification key of specified length.
 * @param {Integer} length - The length of the authentification key
 * @param {String} characters - The characters that the authentification key will be composed of
 * @returns {String} 
 */
function generateAuthKey(length, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    var result           = '';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replace(/\n/g, "<br>");
 }

/**
 * Schedules a process reboot at the specified time to launch a new instance of load_icals loop
 * @param {Integer} rebootHour - The hour at which the reboot will be scheduled
 * @param {Integer} rebootMinute - The minute at which the reboot will be scheduled
 */
function autoreboot(rebootHour = 5, rebootMinute = 0) {
    var now = new Date();
    var night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(), // the next day, ...
        rebootHour, rebootMinute, 0 // ...at 00:00:00 hours
    );
    var msToMidnight = night.getTime() - now.getTime();
    if(msToMidnight < 0){
      night = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1, // the next day, ...
          rebootHour, rebootMinute, 0 // ...at 00:00:00 hours
      );
    }
    msToMidnight = night.getTime() - now.getTime();
    
    logger.log("[SERVER] Autoreboot scheduled in " + msToTime(msToMidnight))
    
    setTimeout(function() {
        logger.log("[SERVER] Rebooting...")
        setTimeout(() => {
            process.exit(1)
        }, 1000);
    }, msToMidnight);
}

autoreboot()


module.exports = {
    replaceAll,
    generateAuthKey,
    render_page
}