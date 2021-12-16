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

function getUnit(unit_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM units WHERE unit_id = ?", [unit_id], (units) => {
            if(units && units.length > 0){
                resolve(units[0])
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    getUnit,
    createUnit,
    deleteUnit,
    editUnit
}