const db = require("../db");

function editUnit(unit_id, arr){
    return db.update("units", arr, "unit_id = " + unit_id)
}

function deleteUnit(unit_id){
    return db.run("DELETE FROM units WHERE unit_id = ?", [unit_id])
}

function createUnit(name){
    return db.insert("units", [
        {
            name: name
        }
    ])
}


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