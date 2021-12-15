const fs = require('fs')
const formidable = require('formidable')
const db = require('../modules/db')
const bcrypt = require('bcrypt')
const { generateAuthKey } = require('../server');
const { sendMail } = require('../modules/mail');
const { assign_groups, load_ical, refreshIcalStatus, getUserIcalStatus, synchronizeUserEvents } = require('../modules/load_icals');
const { uncacheUser, checkPassword } = require('../modules/users');
const { getEventsCreatedBy, uncacheEvent } = require('../modules/events');

function endsWithAny(suffixes, string) {
    return suffixes.some(function (suffix) {
        return string.endsWith(suffix);
    });
}


module.exports = {
    exec: function(req, res){
        var errors = []
        var response = {}

        var mv_file = function (oldpath, newpath, filename, callback){
            fs.copyFile(oldpath, newpath, function(err){
                if (err) {
                    console.log(err)
                    errors.push("Erreur (" + err.code + "-1) : Une erreur technique s'est produite.")
                } else {
                    db.run("UPDATE users SET img_profile = ? WHERE user_id = " + res.user.user_id, ["/assets/img/avatars/"+filename])
                    response["img_profile"] = "/assets/img/avatars/" + filename;
                }
                callback()
            })
        }

        var load_file = function(formData, callback){
            var oldpath = formData.img_profile.path;
            var extension = formData.img_profile.name.split('.')[formData.img_profile.name.split('.').length-1].toLowerCase()
            var filename = res.user.user_id + "." + extension
            var newpath = './public/assets/img/avatars/' + filename;

            if(!['jpg', "jpeg", "png", "svg", "gif"].includes(extension)){
                errors.push("Extension de fichier <b>"+extension+"</b> inconnue (jpg, jpeg, png, svg, gif)")
                callback()
                return
            }
            
            fs.stat(newpath, function(err, stats){
                if (err) {
                    if(err.code == "ENOENT"){
                        mv_file(oldpath, newpath, filename, callback)
                    } else {
                        console.log(err)
                        errors.push("Erreur (" + err.code + "-2) : Une erreur technique s'est produite.")
                        callback()
                    }
                } else {
                    if(stats.isFile()){
                        fs.unlink(newpath, function(err){
                            if (err) {
                                console.log(err)
                                errors.push("Erreur (" + err.code + "-3) : Une erreur technique s'est produite.")
                                callback()
                            } else {
                                mv_file(oldpath, newpath, filename, callback)
                            }
                        })
                    } else {
                        callback()
                    }
                }
            })
        }

        var form = new formidable.IncomingForm();
        var uneditableFields = ["blocked", "password", "current_password", "new_password_confirm", "user_id", "auth_key"]
        var fieldRequire = {
            "username": {
                "regex": /[`!@$%^&*()+\=\[\]{};':"\\|,<>\/?~]/,
                "nullable": false,
                "type": "string"
            },
            "email": {
                "regex": /[ `!#$%^&*()+\\=\[\]{};':"\\|,<>\/?~]/,
                "endsWith": process.env.AUTHORIZED_EMAIL_END_WITH.split(','),
                "nullable": true,
                "type": "string"
            }
        }

        form.parse(req, function (err, fields, formData) {
            var img_profile = false
            var updatePromises = []
            var new_email = undefined
            var new_password = undefined
            
            for(var field in fields){
                if(!(uneditableFields.includes(field))){
                    if(fieldRequire[field]){
                        if(!fieldRequire[field]['nullable'] && (fields[field].replace(/ /gi, "") == "" || fields[field] == undefined)){
                            errors.push("Le champ '"+field+"' doit être obligatoirement remplis")
                            break
                        }
                        
                        if(fields[field].includes('@') && fieldRequire[field]['endsWith'] && !endsWithAny(fieldRequire[field]['endsWith'], fields[field])){
                            errors.push("Votre adresse électronique possède un domaine non-reconnu")
                            break
                        }

                        if(fieldRequire[field]['regex'].test(fields[field])){
                            errors.push("Le champ '"+field+"' contient des caractères interdits.")
                            break
                        }
                        
                        if(typeof(fields[field]) != fieldRequire[field]['type']){
                            errors.push("Le champ '"+field+"' n'est pas de type '"+fieldRequire[field]['type']+"'")
                            break
                        }
                    }

                    if(field == "username" && fields[field] != res.user.username){
                        if(res.user.created_by_script){
                            errors.push("Votre nom d'utilisateur a été verrouillé par le système.")
                            break
                        }
                    }
                    
                    if (field == "email" && res.user.created_by_script){
                        if(!fields[field].includes('@')){
                            errors.push("Vous devez mettre à jour votre adresse mail avec une adresse valide avant de pouvoir modifier vos paramètres.")
                            break
                        }

                        if(res.user.email.includes('@') && fields[field] != res.user.email) {
                            errors.push("Votre adresse électronique a été verrouillée par le système.")
                            break
                        }
                    }

                    if(field == "ical"){
                        if(fields[field] != "" && !fields[field].startsWith("https://proseconsult.umontpellier.fr/jsp/custom/modules/plannings/direct_cal.jsp?data=")){
                            errors.push("Votre lien iCal n'a pas été reconnu ou est invalide")
                            break
                        }
                        updatePromises.push(new Promise(async (resolve, reject) => {
                            if(fields["ical"] != res.user.ical){
                                await db.run("UPDATE users SET ical = ? WHERE user_id = " + res.user.user_id, [fields["ical"]])
                                await refreshIcalStatus()
                                await synchronizeUserEvents(res.user.user_id)
                            }
                            resolve()
                        }))
                        continue
                    }

                    if(field == "email"){
                        updatePromises.push(new Promise((resolve, reject) => {
                            db.run("UPDATE users SET email = ? WHERE user_id = " + res.user.user_id, [fields["email"]]).then(() => {
                                if(res.user.email != fields["email"]){
                                    db.run("DELETE FROM action_links WHERE type = 'email' AND user_id = " + res.user.user_id)
                                    db.insert("action_links", [
                                        {
                                            "link": generateAuthKey(128),
                                            "user_id": res.user.user_id,
                                            "type": "email"
                                        }
                                    ]).then((linkId) => {
                                        db.select("SELECT * FROM action_links WHERE type = 'email' AND action_link_id = " + linkId, function(activationLink){
                                            if(activationLink && activationLink.length > 0){
                                                sendMail(
                                                    fields["email"],
                                                    "Activation de votre compte Polygenda",
                                                    fs.readFileSync('./api/register/email_activation_link.html', {encoding: 'utf-8'})
                                                    .replace(/{{ username }}/gi, res.user.username)
                                                    .replace(/{{ website }}/gi, process.env.BASE_URL)
                                                    .replace(/{{ action_link }}/gi, process.env.BASE_URL + "/account/login?al=" + activationLink[0].link)
                                                ).then((info) => {
                                                    new_email = fields["email"]
                                                    response["email"] = fields["email"]
                                                    res.cookie("JZ-Translation-auth", "")
                                                    resolve()
                                                }).catch((error) => {
                                                    errors.push(error)
                                                    resolve()
                                                })
                                            } else {
                                                errors.push("Nous rencontrons des difficultés à récupérer les informations de votre compte")
                                                resolve()
                                            }
                                        })
                                    }).catch((error) => {
                                        if(error) console.log(error)
                                        errors.push("Nous rencontrons des difficultés à récupérer les informations de votre compte")
                                        resolve()
                                    })
                                } else {
                                    resolve()
                                }
                            })
                        }).catch(() => {
                            errors.push("Nous rencontrons des difficultés à modifier votre adresse électronique")
                            resolve()
                        }))
                        continue
                    }

                    if(field == "new_password"){
                        updatePromises.push(new Promise((resolve) => {
                            if(fields[field] == "" && fields[field] == ""){resolve()}
                            if(fields["new_password_confirm"] != undefined && fields["new_password_confirm"] != ""){
                                db.select('SELECT * FROM users WHERE user_id = ?', [res.user.user_id], function(rows){
                                    if(rows && rows.length > 0){
                                        if(fields["current_password"] != undefined && bcrypt.compareSync(fields["current_password"], rows[0].password)){
                                            if(fields['new_password'] == fields['new_password_confirm']){
                                                checkPassword(fields['new_password']).then(() => {
                                                    updatePromises.push(db.run("UPDATE users SET password = ? WHERE user_id = " + res.user.user_id, [bcrypt.hashSync(fields["new_password"], 10)]))
                                                    new_password = fields[field]
                                                    response[field] = fields[field]
                                                    resolve()
                                                }).catch((reason) => {
                                                    errors.push(reason)
                                                    resolve()
                                                })
                                            } else {
                                                errors.push("Le nouveau mot de passe ne correspond pas à la confirmation")
                                                resolve()
                                            }
                                        } else {
                                            errors.push("Le mot de passe que vous avez fourni est incorrecte")
                                            resolve()
                                        }
                                    } else {
                                        errors.push("Une erreur s'est produite lors de la vérification de votre mot de passe")
                                        resolve()
                                    }
                                })
                            } else {
                                resolve()
                            }
                        }))
                        continue
                    }

                    if((field == "discord_token" || field == "messenger_token" || field == "twitter_token") && fields[field] == ""){
                        updatePromises.push(db.run("UPDATE users SET "+field+" = null WHERE user_id = " + res.user.user_id))
                        response[field] = fields[field]    
                        continue
                    }
                    
                    updatePromises.push(db.run("UPDATE users SET "+field+" = ? WHERE user_id = " + res.user.user_id, fields[field]))
                    response[field] = fields[field]
                }
            }

            if(formData['img_profile'] != undefined){img_profile = true}

            Promise.all(updatePromises).then(function(){
                var finalize_edit = function(){
                    if(errors.length > 0){
                        res.status(500)
                        res.send(errors[0])
                    } else {
                        uncacheUser(res.user.user_id)
                        res.status(200)
                        res.send(response)
                    }
                }

                if(img_profile){
                    load_file(formData, finalize_edit)
                } else {
                    finalize_edit()
                }
            }).catch(function(){
                res.status(401)
                res.send(errors[0])
            })
        })
    }
}