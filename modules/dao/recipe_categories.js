/**
* Provide every functions required to interact with recipe_categories
* @module dao.recipe_categories
* */

const db = require("../db");

/**
 * Change the propertie of a recipe category
 * @param recipe_category_id
 * @param arr
 * @returns {Promise | Promise<unknown>}
 */
function editRecipeCategory(recipe_category_id, arr){
    return db.update("recipe_categories", arr, "recipe_category_id = " + recipe_category_id)
}

/**
 * Delete a recipe category
 * @param recipe_category_id
 * @returns {Promise | Promise<unknown>}
 */
function deleteRecipeCategory(recipe_category_id){
    return db.run("DELETE FROM recipe_categories WHERE recipe_category_id = ?", [recipe_category_id])
}

/**
 * Create a new recipe category
 * @param name
 * @returns {Promise | Promise<unknown>}
 */
function createRecipeCategory(name){
    return db.insert("recipe_categories", [
        {
            name: name
        }
    ])
}

/**
 * Returns a list of all recipe categories
 * @returns {Promise<unknown>}
 */
function getAllRecipeCategories(){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipe_categories", [], (recipe_categories) => {
            if(recipe_categories){
                let o = []
                let p = []

                for (let i = 0; i < recipe_categories.length; i++) {
                    const recipe_category = recipe_categories[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getRecipeCategory(recipe_category.recipe_category_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting recipe categories")
            }
        })
    })
}

/**
 * Return a recipe category
 * @param recipe_category_id
 * @returns {Promise<unknown>}
 */
function getRecipeCategory(recipe_category_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipe_categories WHERE recipe_category_id = ?", [recipe_category_id], (recipe_categories) => {
            if(recipe_categories && recipe_categories.length > 0){
                resolve(recipe_categories[0])
            } else {
                reject("Recipe category " + recipe_category_id + " not found")
            }
        })
    })
}

module.exports = {
    getRecipeCategory,
    getAllRecipeCategories,
    createRecipeCategory,
    deleteRecipeCategory,
    editRecipeCategory
}
