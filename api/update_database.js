const fs = require('fs')
const formidable = require('formidable')
const db = require('../modules/db')
const bcrypt = require('bcrypt')
const { generateAuthKey } = require('../server');
const { sendMail } = require('../modules/mail');
const { assign_groups, load_ical, refreshIcalStatus, getUserIcalStatus, synchronizeUserEvents } = require('../modules/load_icals');
const { uncacheUser } = require('../modules/users');

module.exports = {
    exec: function(req, res){
        var errors = []
        var response = {}

        var mv_file = function (oldpath, newpath, filename, callback){
            fs.copyFile(oldpath, newpath, function(err){
                if (err) {
                    console.log(err)
                    errors.push("Erreur (" + err.code + "-1) : Une erreur technique s'est produite.")
                }
                callback()
            })
        }

        var load_file = function(formData, callback){
            var oldpath = formData.database_file.path;
            var extension = formData.database_file.name.split('.')[formData.database_file.name.split('.').length-1].toLowerCase()
            var filename = res.user.user_id + "." + extension
            var newpath = './.data/database.sqlite3';

            if(!["sqlite3"].includes(extension)){
                errors.push("Extension de fichier <b>"+extension+"</b> inconnue (sqlite3)")
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
                        mv_file(oldpath, newpath, filename, callback)
                    } else {
                        callback()
                    }
                }
            })
        }

        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, formData) {
            var finalize_edit = function(){
                if(errors.length > 0){
                    res.status(500)
                    res.send(errors[0])
                } else {
                    res.status(200)
                    res.send(response)
                    db.reload()
                }
            }

            if(formData['database_file'] != undefined){
                load_file(formData, finalize_edit)
            } else {
                res.status(400)
                res.send("Vous n'avez pas fourni de fichier")
            }
        })
    }
}