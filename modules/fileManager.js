const fs = require('fs')


let minuteToCache = 10
let cachedFiles = {}

setInterval(() => {
  for (const filepath in cachedFiles) {
    if (cachedFiles[filepath]) {
      if(new Date().getTime() - cachedFiles[filepath].timestamp > minuteToCache*60*1000){
        cachedFiles[filepath] = undefined
      }
    }
  }
}, 1000);

module.exports = {
    readFile: function(filepath, callback){
      if(cachedFiles[filepath]){
        callback(undefined, cachedFiles[filepath].content)
      } else {
        fs.readFile(filepath, "utf-8", function(err, data){
          if(!err){
            cachedFiles[filepath] = {
              content: data,
              timestamp: new Date().getTime()
            }
          }
          callback(err, data)
        })
      }
    },
    readFiles: function(folder, files, callback){
        return new Promise(function (resolve, reject) {
            let filesContents = {}
            const promises = files.map(file => { // get back an array of promises
              return new Promise(function(resolve, reject){
                fs.stat(folder + file, function(err, stats){
                  if(stats.isFile()){
                    module.exports.readFile(folder + file, function(err, data) {
                      if(!err){
                        filesContents[file] = data.toString()
                        resolve()
                      } else {
                        reject(err)
                      }
                    })
                  } else {
                    resolve()
                  }
                })
              })
            });
            
            Promise.all(promises)
              .then(() => { // all done!
                callback(filesContents)
                resolve()
              })
              .catch((error) => {
                reject(error)
              })
          })
    }
}