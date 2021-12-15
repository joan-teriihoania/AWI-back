const fileManager = require("./fileManager");

function getPatchnotes(){
    return new Promise((resolve) => {
        fileManager.readFile("./patchnotes.json", function(err, content){
            let contentParsed = JSON.parse(content)
            let contentToReturn = []
            for (let i = 0; i < contentParsed.length; i++) {
                if(!contentParsed[i].hidden){
                    contentToReturn.push(contentParsed[i])
                }
            }
            resolve(contentToReturn)
        })    
    })
}

function getLastPatchnote(){
    return new Promise((resolve) => {
        getPatchnotes().then((patchnotes) => {
            resolve(patchnotes[patchnotes.length-1])
        })
    })
}

module.exports = {
    getPatchnotes: getPatchnotes,
    getLastPatchnote: getLastPatchnote
}