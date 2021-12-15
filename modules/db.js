/**
 * Shows how to use chaining rather than the `serialize` method.
 */
"use strict";

const fs = require('fs');
if(!fs.existsSync(".data")){
    fs.mkdirSync(".data")
}

const sqlite3 = require('sqlite3');
var database = new sqlite3.Database('.data/database.sqlite3')
const logger = require('./logger');
const {toFRDatetimeString} = require("./time");

function cleanBackups(){
    module.exports.getBackups((backups) => {
        backups.sort((a, b) => {
            return parseInt(b.filename.replace('backup_', '').replace('.sqlite3', '')) - parseInt(a.filename.replace('backup_', '').replace('.sqlite3', ''))
        })

        let maxBackupFiles = process.env.MAX_BACKUP_FILES ? process.env.MAX_BACKUP_FILES : 7
        if(backups.length > maxBackupFiles){
            for (let i = maxBackupFiles; i < backups.length; i++) {
                module.exports.deleteBackup(backups[i].filename)
            }
        }
    })
}

function isNumber(num){
    return !isNaN(parseFloat(num)) && isFinite(num);
}
 
 module.exports = {
     backup: function(overwrite = false){
         cleanBackups()
         let filepath = ".data/backup_" + new Date().getTime() + ".sqlite3"
         if(overwrite || !fs.existsSync(filepath)){
             fs.copyFileSync('.data/database.sqlite3', filepath)
         }
     },
     deleteBackup: function(filename){
         let filepath = ".data/" + filename
         try {
            fs.unlinkSync(filepath)
         } catch (error) {
             logger.error(error)
         }
     },
     reload: function(){
        database = new sqlite3.Database('.data/database.sqlite3')
     },
     restore: function(filename){
         module.exports.backup()
         let filepath = ".data/" + filename
         fs.copyFileSync(filepath, ".data/database.sqlite3")
         module.exports.reload()
     },
     getBackups: function(callback){
         let p = []
         let backups = []
         let files = fs.readdirSync(".data").filter(f => f.startsWith('backup_'))
         
         for (let i = 0; i < files.length; i++) {
             const file = files[i];
             p.push(new Promise((resolve) => {
                 fs.stat(".data/" + file, (err, stats) => {
                     backups.push({
                         filename: file,
                         size: stats.size,
                         createdAt: toFRDatetimeString(new Date(stats.birthtimeMs)),
                         createdDate: new Date(stats.birthtimeMs)
                     })
                     resolve()
                 })
             }))
         }
 
         Promise.all(p).then(() => {
             backups.sort((a, b) => {
                 return a.createdDate.getTime() - b.createdDate.getTime()
             })
             callback(backups)
         })
     },
     sanitize: function(input){
        return input.replace(/\'/gi, "''")
     },
     createTable: function(tablename, rows) {
         var templateRows = [{
             name: "",
             type: "",
             primary: false,
             not_null: false
         }]
     
         var rowsString = []
         for (var row of rows) {
             var rowString = row.name
             rowString += " " + row.type
             if(row.primary){
                 rowString += " PRIMARY KEY"
             } else {
                 if(row.not_null){
                     rowString += " NOT NULL"
                 }
             }
             rowsString.push(rowString)
         }
         
         return new Promise((resolve, reject) => {
             database.run("CREATE TABLE IF NOT EXISTS " + tablename + "(" + rowsString.join(", ") + ")", function(err){
                 if(err){
                     if(err.code == 'SQLITE_IOERR' || err.code == 'SQLITE_BUSY'){
                     setTimeout(() => {
                         // logger.log("[DB-CONFIG] WARN(createTable): Database access file error catched")
                         module.exports.createTable(tablename, rows).then(() => {
                         // logger.log("[DB-CONFIG] WARN(createTable): Database access file error handled")
                         resolve()
                         })
                     }, 1000)
                     } else {
                     logger.log("CREATE TABLE IF NOT EXISTS " + tablename + "(" + rowsString.join(", ") + ")")
                     logger.log(err)
                     reject(err)                      
                     }
                 } else {
                     resolve()
                 }
             });
         })
     },
     insert: function(tablename, rows) {
         var lastID
         
         return new Promise(function(resolve, reject){
             var sql_values = []
             var all_values = []
             var cols = []

             for(var row of rows){
                 let populatedCols = cols.length > 0
                 var values = []

                 for (const [col, value] of Object.entries(row)) {
                     if(!populatedCols) cols.push(col)
                     values.push(value)
                     all_values.push(value)
                     /* if(isNumber(value)){
                         values.push(value)
                     } else {
                         values.push("'" + module.exports.sanitize(value) + "'")
                     }*/
                 }

                 sql_values.push("("+values.map(a => "?").join(", ")+")")
             }
             database.run("INSERT INTO " + tablename + "("+cols.join(', ')+") VALUES " + sql_values.join(', '), all_values, function(err){
                if(err){
                    reject(err)
                } else {
                    resolve(this.lastID)
                }
            })
         })
     },
     update: function(tablename, row, where = "1") {       
         return new Promise(function(resolve, reject){
             var sets = []
             var values = []
             
             for (const [col, value] of Object.entries(row)) {
                 sets.push(col + " = ?")
                 values.push(value)
                 /* if(Number.isInteger(value)){
                     sets.push(col + " = " + value)
                 } else {
                     sets.push(col + ' = "' + value + '"')
                 }*/
             }
             
             database.run("UPDATE " + tablename + " SET " + sets.join(', ') + " WHERE " + where, values, function(err){
                 if(err){
                     if(err.code == 'SQLITE_IOERR' || err.code == 'SQLITE_BUSY'){
                     setTimeout(() => {
                         // logger.log("[DB-CONFIG] WARN(update): Database access file error catched")
                         module.exports.update(tablename, row, where).then(() => {
                         // logger.log("[DB-CONFIG] WARN(update): Database access file error handled")
                         resolve()
                         })
                     }, 1000)
                     } else {
                     logger.log("UPDATE " + tablename + " SET " + sets.join(', ') + " WHERE " + where)
                     logger.log(err)
                     reject(err)                      
                     }
                 } else {
                     resolve(this.lastID)
                 }
             })      
         })
     },
     run: function(request, params = []){
         return new Promise(function(resolve, reject){
             database.run(request, params, function(err){
                 if(err){
                     if(err.code == 'SQLITE_IOERR' || err.code == 'SQLITE_BUSY'){
                        setTimeout(() => {
                            // logger.log("[DB-CONFIG] WARN(run): Database access file error catched")
                            module.exports.run(request, params).then(() => {
                            // logger.log("[DB-CONFIG] WARN(run): Database access file error handled")
                            resolve()
                            })
                        }, 1000)
                     } else {
                        logger.log(request)
                        logger.log(err)
                        reject(err)                      
                     }
                 } else {
                     resolve()
                 }
             })
         })
     },
     selectAll: function(tablename, callback) {
         module.exports.select("SELECT * FROM " + tablename, [], callback)
     },
     select: function(request, params, callback) {
         if(!Array.isArray(params)){
             callback = params
             params = []
         }
         database.all(request, params, function(err, rows){
            if(err){
                if(err.code == 'SQLITE_IOERR' || err.code == 'SQLITE_BUSY'){
                   setTimeout(() => {
                       // logger.log("[DB-CONFIG] WARN(run): Database access file error catched")
                       module.exports.select(request, params, (rows) => {
                        // logger.log("[DB-CONFIG] WARN(run): Database access file error handled")
                        callback(rows)
                       })
                   }, 1000)
                } else {
                   logger.log(request)
                   logger.log(err)
                   callback([])
                }
            } else {
                callback(rows)
            }
         });
     },
     closeDB: function() {
         database.close();
     }
 }