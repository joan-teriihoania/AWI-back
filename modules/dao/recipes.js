/**
* Provide every functions required to interact with recipes
* @module dao.recipes
* */

const db = require('../db')
const {getRecipeCategory} = require("./recipe_categories");
const {getUserInfo, getUserPublic} = require("../users");
const {getStep} = require("./steps");

/**
 * Change the propertie of a recipe
 * @param recipe_id
 * @param arr
 * @returns {Promise | Promise<unknown>}
 */
function editRecipe(recipe_id, arr){
    return db.update("recipes", arr, "recipe_id = " + recipe_id)
}

/**
 * Delete a recipe
 * @param recipe_id
 * @returns {Promise<unknown[]>}
 */
function deleteRecipe(recipe_id){
    return Promise.all([
        db.run("DELETE FROM technical_sheets WHERE recipe_id = ?", [recipe_id]),
        db.run("DELETE FROM recipes WHERE recipe_id = ?", [recipe_id]),
        db.run("DELETE FROM recipe_steps WHERE recipe_id = ?", [recipe_id])
    ])
}

/**
 * Create a recipe
 * @param name
 * @param nb_couvert
 * @param user_id
 * @param recipe_category_id
 * @returns {Promise | Promise<unknown>}
 */
function createRecipe(name, nb_couvert, user_id, recipe_category_id){
    return db.insert("recipes", [
        {
            name: name,
            nb_couvert: nb_couvert,
            user_id: user_id,
            recipe_category_id: recipe_category_id
        }
    ])
}

/**
 * Returns a list of all recipes
 * @returns {Promise<unknown>}
 */
function getAllRecipes(){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipes", [], (recipes) => {
            if(recipes){
                let o = []
                let p = []

                for (let i = 0; i < recipes.length; i++) {
                    const recipe = recipes[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getRecipe(recipe.recipe_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting recipes")
            }
        })
    })
}

/**
 * Return a recipe
 * @param recipe_id
 * @returns {Promise<unknown>}
 */
function getRecipe(recipe_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipes WHERE recipe_id = ?", [recipe_id], async (recipe) => {
            if(recipe && recipe.length > 0){
                recipe = recipe[0]
                recipe.type = "recipe"
                recipe.category = await new Promise((resolve) => {
                    getRecipeCategory(recipe.recipe_category_id)
                        .then(resolve)
                        .catch((err) => {
                            reject(err)
                        })
                });
                recipe.author = await new Promise((resolve) => {
                    getUserPublic(recipe.user_id)
                        .then(resolve)
                        .catch((err) => {
                            reject(err)
                        })
                });
                recipe.steps = []
                recipe.ingredients = []

                await new Promise((resolve) => {
                    db.select("SELECT * FROM recipe_steps WHERE recipe_id = ?", [recipe_id], async (steps) => {
                        if(steps && steps.length > 0){
                            for (let i = 0; i < steps.length; i++) {
                                const t = await new Promise((resolve) => {
                                    getStep(steps[i].step_id)
                                        .then(resolve)
                                        .catch((err) => {
                                            reject(err)
                                        })
                                })
                                recipe.steps.push({
                                    quantity: steps[i].quantity,
                                    step: t
                                })

                                // add quantity times the ingredients
                                for (let j = 0; j < steps[i].quantity; j++) {
                                    for (let k = 0; k < t.ingredients.length; k++) {
                                        recipe.ingredients.push(t.ingredients[k])
                                    }
                                }
                            }
                        }
                        resolve()
                    })
                })
                resolve(recipe)
            } else {
                reject("Recipe " + recipe_id + " not found")
            }
        })
    })
}

/**
 * Add a step to a recipe
 * @param recipe_id
 * @param step_id
 * @param position
 * @param quantity
 * @returns {Promise | Promise<unknown>}
 */
function addStep(recipe_id, step_id, position, quantity){
    return db.insert("recipe_steps", [
        {
            recipe_id: recipe_id,
            step_id: step_id,
            position: position,
            quantity: quantity
        }
    ])
}

/**
 * Remove a step from a recipe
 * @param recipe_id
 * @param step_id
 * @returns {Promise | Promise<unknown>}
 */
function removeStep(recipe_id, step_id){
    return db.run("DELETE FROM recipe_steps WHERE recipe_id = ? AND step_id = ?", [recipe_id, step_id])
}

module.exports = {
    getRecipe,
    getAllRecipes,
    createRecipe,
    deleteRecipe,
    editRecipe,
    addStep,
    removeStep
}
