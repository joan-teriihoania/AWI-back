/**
* Provide every functions required to interact with technical sheets
* @module dao.technical_sheets
* */

const db = require("../db");
const {getRecipe} = require("./ingredients_recipes_steps_stepcomponents");

/**
 * Change the properties of a technical sheet
 * @param technical_sheet_id
 * @param arr
 * @returns {Promise | Promise<unknown>}
 */
function editTechnicalSheet(technical_sheet_id, arr){
    return db.update("technical_sheets", arr, "technical_sheet_id = " + technical_sheet_id)
}

/**
 * Delete a technical sheet
 * @param technical_sheet_id
 * @returns {Promise | Promise<unknown>}
 */
function deleteTechnicalSheet(technical_sheet_id){
    return db.run("DELETE FROM technical_sheets WHERE technical_sheet_id = ?", [technical_sheet_id])
}

/**
 * Create a technical sheet
 * @param recipe_id
 * @param cout_assaisonnement
 * @param cout_personnel
 * @param cout_fluide
 * @param coef_marge
 * @returns {Promise | Promise<unknown>}
 */
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

/**
 * Returns a list of all technical sheets
 * @returns {Promise<unknown>}
 */
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

/**
 * Return a technical sheet
 * @param technical_sheet_id
 * @returns {Promise<unknown>}
 */
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
