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

function getTechnicalSheet(technical_sheet_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM technical_sheets WHERE technical_sheet_id = ?", [technical_sheet_id], async (technical_sheets) => {
            if(technical_sheets && technical_sheets.length > 0){
                technical_sheets[0].recipe = await getRecipe(technical_sheets[0].recipe_id)
                resolve(technical_sheets[0])
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    getTechnicalSheet,
    createTechnicalSheet,
    deleteTechnicalSheet,
    editTechnicalSheet
}