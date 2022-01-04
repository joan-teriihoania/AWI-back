const db = require("../db");


function editAllergene(allergene_id, arr){
    return db.update("allergenes", arr, "allergene_id = " + allergene_id)
}

function deleteAllergene(allergene_id){
    return db.run("DELETE FROM allergenes WHERE allergene_id = ?", [allergene_id])
}

function createAllergene(name){
    return db.insert("allergenes", [
        {
            name: name
        }
    ])
}

function getAllAllergenes(filter = {}){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM allergenes", [], (allergenes) => {
            if(allergenes){
                let o = []
                let p = []

                for (let i = 0; i < allergenes.length; i++) {
                    const allergene = allergenes[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getAllergene(allergene.allergene_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting allergens")
            }
        })
    })
}

function getAllergene(allergene_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM allergenes WHERE allergene_id = ?", [allergene_id], async (allergenes) => {
            if(allergenes && allergenes.length > 0){
                resolve(allergenes[0])
            } else {
                reject("Allergene " + allergene_id + " not found")
            }
        })
    })
}

module.exports = {
    getAllergene,
    getAllAllergenes,
    createAllergene,
    deleteAllergene,
    editAllergene
}
