/**
* Provide every functions required to interact with allergenes
* @module dao.allergenes
* */

const db = require("../db");

/**
 * Edit the database properties of an allergene object
 * @param {Integer} allergene_id - The id of an allergene
 * @param {Object} arr - An object with the new values of properties to edit the allergene
 */
function editAllergene(allergene_id, arr){
    return db.update("allergenes", arr, "allergene_id = " + allergene_id)
}

/**
 * Delete the specified allergene
 * @param allergene_id
 * @returns {Promise | Promise<unknown>}
 */
function deleteAllergene(allergene_id){
    return db.run("DELETE FROM allergenes WHERE allergene_id = ?", [allergene_id])
}

/**
 * Create an allergene
 * @param name
 * @returns {Promise | Promise<unknown>}
 */
function createAllergene(name){
    return db.insert("allergenes", [
        {
            name: name
        }
    ])
}

/**
 * Returns the list of all allergenes
 * @param filter
 * @returns {Promise<unknown>}
 */
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

/**
 * Returns a list of all allergenes
 * @param allergene_id
 * @returns {Promise<unknown>}
 */
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
