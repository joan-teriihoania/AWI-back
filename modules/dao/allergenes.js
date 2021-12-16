const db = require("../db");


function editAllergene(allergene_id, arr){
    return db.update("allergenes", arr, "allergene_id = " + allergene_id)
}

function deleteAllergene(allergene_id, deleteAllOccurences = false){
    return db.run("DELETE FROM allergenes WHERE allergene_id = ?", [allergene_id])
}

function createAllergene(name){
    return db.insert("allergenes", [
        {
            name: name
        }
    ])
}

function getAllergene(allergene_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM allergenes WHERE allergene_id = ?", [allergene_id], async (allergenes) => {
            if(allergenes && allergenes.length > 0){
                resolve(allergenes[0])
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    getAllergene,
    createAllergene,
    deleteAllergene,
    editAllergene
}