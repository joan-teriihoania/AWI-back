/**
* Provide every functions required to interact with ingredient categories
* @module dao.ingredient_categories
* */


const db = require("../db");

/**
 * Edit the database properties of an ingredient category object
 * @param {Integer} ingredient_category_id - The id of an ingredient category
 * @param {Object} arr - An object with the new values of properties to edit the ingredient category
 */
function editIngredientCategory(ingredient_category_id, arr){
    return db.update("ingredient_categories", arr, "ingredient_category_id = " + ingredient_category_id)
}

/**
 * Delete the ingredient category
 * @param ingredient_category_id
 * @returns {Promise | Promise<unknown>}
 */
function deleteIngredientCategory(ingredient_category_id){
    return db.run("DELETE FROM ingredient_categories WHERE ingredient_category_id = ?", [ingredient_category_id])
}

/**
 * Create a new ingredient category
 * @param name
 * @returns {Promise | Promise<unknown>}
 */
function createIngredientCategory(name){
    return db.insert("ingredient_categories", [
        {
            name: name
        }
    ])
}

/**
 * Returns the list of all ingredient categories
 * @returns {Promise<unknown>}
 */
function getAllIngredientCategories(){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM ingredient_categories", [], (ingredient_categories) => {
            if(ingredient_categories){
                let o = []
                let p = []

                for (let i = 0; i < ingredient_categories.length; i++) {
                    const ingredient_category = ingredient_categories[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getIngredientCategory(ingredient_category.ingredient_category_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting ingredient categories")
            }
        })
    })
}

/**
 * Returns the ingredient caegory specified
 * @param ingredient_category_id
 * @returns {Promise<unknown>}
 */
function getIngredientCategory(ingredient_category_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM ingredient_categories WHERE ingredient_category_id = ?", [ingredient_category_id], (ingredient_categories) => {
            if(ingredient_categories && ingredient_categories.length > 0){
                resolve(ingredient_categories[0])
            } else {
                reject("Ingredient category " + ingredient_category_id + " not found")
            }
        })
    })
}

module.exports = {
    getIngredientCategory,
    getAllIngredientCategories,
    createIngredientCategory,
    deleteIngredientCategory,
    editIngredientCategory
}
