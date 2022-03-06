/**
* Provide every functions required to interact with ingredients
* @module dao.ingredients
* */

const db = require("../db");
const {getIngredientCategory} = require("./ingredient_categories");
const {getUnit} = require("./units");
const {getAllergene} = require("./allergenes");

/**
 * Change the properties of an ingredient
 * @param ingredient_id
 * @param arr
 * @returns {Promise | Promise<unknown>}
 */
function editIngredient(ingredient_id, arr){
    return db.update("ingredients", arr, "ingredient_id = " + ingredient_id)
}

/**
 * Delete an ingredient
 * @param ingredient_id
 * @returns {Promise | Promise<unknown>}
 */
function deleteIngredient(ingredient_id){
    return db.run("DELETE FROM ingredients WHERE ingredient_id = ?", [ingredient_id])
}

/**
 * Create a new ingredient
 * @param unit_id
 * @param ingredient_category_id
 * @param name
 * @param price
 * @returns {Promise | Promise<unknown>}
 */
function createIngredient(unit_id, ingredient_category_id, name, price){
    return db.insert("ingredients", [
        {
            unit_id: unit_id,
            ingredient_category_id: ingredient_category_id,
            name: name,
            price: price
        }
    ])
}

/**
 * Return the list of all ingredients
 * @returns {Promise<unknown>}
 */
function getAllIngredients(){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM ingredients", [], (ingredients) => {
            if(ingredients){
                let o = []
                let p = []

                for (let i = 0; i < ingredients.length; i++) {
                    const ingredient = ingredients[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getIngredient(ingredient.ingredient_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting ingredients")
            }
        })
    })
}

/**
 * Return an ingredient
 * @param ingredient_id
 * @returns {Promise<unknown>}
 */
function getIngredient(ingredient_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM ingredients WHERE ingredient_id = ?", [ingredient_id], async (ingredients) => {
            if(ingredients && ingredients.length > 0){
                ingredients[0].type = "ingredient"
                ingredients[0].category = await new Promise((resolve) => {
                    getIngredientCategory(ingredients[0].ingredient_category_id)
                        .then(resolve)
                        .catch(reject)
                })
                ingredients[0].unit = await new Promise((resolve) => {
                    getUnit(ingredients[0].unit_id)
                        .then(resolve)
                        .catch(reject)
                })
                ingredients[0].allergenes = []

                await new Promise((resolve) => {
                    db.select("SELECT * FROM ingredient_allergenes WHERE ingredient_id = ?", [ingredient_id], async (allergenes) => {
                        if(allergenes){
                            for (let j = 0; j < allergenes.length; j++) {
                                ingredients[0].allergenes.push(await getAllergene(allergenes[j].allergene_id))
                            }
                        }
                        resolve()
                    })
                })
                resolve(ingredients[0])
            } else {
                reject("Ingredient " + ingredient_id + " not found")
            }
        })
    })
}

/**
 * Add an allergene to an ingredient
 * @param ingredient_id
 * @param allergene_id
 * @returns {Promise | Promise<unknown>}
 */
function addAllergene(ingredient_id, allergene_id){
    return db.insert("ingredient_allergenes", [
        {
            ingredient_id: ingredient_id,
            allergene_id: allergene_id
        }
    ])
}

/**
 * Remove an allergene from an ingredient
 * @param ingredient_id
 * @param allergene_id
 * @returns {Promise | Promise<unknown>}
 */
function removeAllergene(ingredient_id, allergene_id){
    return db.run("DELETE FROM ingredient_allergenes WHERE ingredient_id = ? AND allergene_id = ?", [ingredient_id, allergene_id])
}

module.exports.getIngredient = getIngredient
module.exports.getAllIngredients = getAllIngredients
module.exports.createIngredient = createIngredient
module.exports.deleteIngredient = deleteIngredient
module.exports.editIngredient = editIngredient
module.exports.addAllergene = addAllergene
module.exports.removeAllergene = removeAllergene
