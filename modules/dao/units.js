/**
* Provide every functions required to interact with units
* @module dao.units
* */

const db = require("../db");

/**
 * Edit the properties of a unit
 * @param unit_id
 * @param arr
 * @returns {Promise | Promise<unknown>}
 */
function editUnit(unit_id, arr){
    return db.update("units", arr, "unit_id = " + unit_id)
}

/**
 * Delete a unit
 * @param unit_id
 * @returns {Promise | Promise<unknown>}
 */
function deleteUnit(unit_id){
    return db.run("DELETE FROM units WHERE unit_id = ?", [unit_id])
}

/**
 * Create a unit
 * @param name
 * @returns {Promise | Promise<unknown>}
 */
function createUnit(name){
    return db.insert("units", [
        {
            name: name
        }
    ])
}

/**
 * Return a list of all units
 * @returns {Promise<unknown>}
 */
function getAllUnits(){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM units", [], (units) => {
            if(units){
                let o = []
                let p = []

                for (let i = 0; i < units.length; i++) {
                    const unit = units[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getUnit(unit.unit_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting units")
            }
        })
    })
}

/**
 * Return a unit
 * @param unit_id
 * @returns {Promise<unknown>}
 */
function getUnit(unit_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM units WHERE unit_id = ?", [unit_id], (units) => {
            if(units && units.length > 0){
                resolve(units[0])
            } else {
                reject("Unit " + unit_id + " not found")
            }
        })
    })
}

module.exports = {
    getUnit,
    getAllUnits,
    createUnit,
    deleteUnit,
    editUnit
}
