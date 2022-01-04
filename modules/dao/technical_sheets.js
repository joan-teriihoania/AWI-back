const db = require("../db");
const {getRecipe} = require("./recipes");

function editTechnicalSheet(technical_sheet_id, arr){
    return db.update("technical_sheets", arr, "technical_sheet_id = " + technical_sheet_id)
}

function deleteTechnicalSheet(technical_sheet_id){
    return db.run("DELETE FROM technical_sheets WHERE technical_sheet_id = ?", [technical_sheet_id])
}

function createTechnicalSheet(recipe_id, cout_assaisonnement, cout_personnel, cout_fluide, coef_marge){
    return db.insert("technical_sheets", [
        {
            recipe_id: recipe_id,
            cout_assaisonnement: cout_assaisonnement,
            cout_personnel: cout_personnel,
            cout_fluide: cout_fluide,
            coef_marge: coef_marge
        }
    ])
}


function getAllTechnicalSheets(){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM technical_sheets", [], (technical_sheets) => {
            if(technical_sheets){
                let o = []
                let p = []

                for (let i = 0; i < technical_sheets.length; i++) {
                    const technical_sheet = technical_sheets[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getTechnicalSheet(technical_sheet.technical_sheet_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting technical sheets")
            }
        })
    })
}

function getTechnicalSheet(technical_sheet_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM technical_sheets WHERE technical_sheet_id = ?", [technical_sheet_id], async (technical_sheets) => {
            if(technical_sheets && technical_sheets.length > 0){
                technical_sheets[0].recipe = await getRecipe(technical_sheets[0].recipe_id)
                resolve(technical_sheets[0])
            } else {
                reject("Technical sheet " + technical_sheet_id + " not found")
            }
        })
    })
}

module.exports = {
    getTechnicalSheet,
    getAllTechnicalSheets,
    createTechnicalSheet,
    deleteTechnicalSheet,
    editTechnicalSheet
}