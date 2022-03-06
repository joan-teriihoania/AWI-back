/**
 * Provide every functions required to interact with ingredients
 * @module dao.ingredients
 * */


const db = require('../db')
const {getRecipeCategory} = require("./recipe_categories");
const {getUserInfo, getUserPublic} = require("../users");
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


/**
 * Provide every functions required to interact with recipes
 * @module dao.recipes
 * */

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
                    db.select("SELECT * FROM recipe_steps WHERE recipe_id = ? ORDER BY position ASC", [recipe_id], async (steps) => {
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

function editRecipeStep(recipe_id, step_id, previousPosition, position, quantity){
    return db.update("recipe_steps", {
        position: position,
        quantity: quantity
    }, "step_id = " + step_id + " AND recipe_id = " + recipe_id + " AND position = " + previousPosition)
}

function getRecipeStep(recipe_id, step_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipe_steps WHERE recipe_id = ? AND step_id = ?", [recipe_id, step_id], (recipe_step) => {
            if(recipe_step && recipe_step.length > 0){
                resolve(recipe_step[0])
            } else {
                reject("Error while requesting recipe step")
            }
        })
    })
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

/**
 * Provide every functions required to interact with step components
 * @module dao.step_components
 * */

/**
 * Change the propeerties of a step component
 * @param step_component_id
 * @param arr
 * @returns {Promise | Promise<unknown>}
 */
function editStepComponent(step_component_id, arr){
    return db.update("step_components", arr, "step_component_id = " + step_component_id)
}

/**
 * Delete a step component
 * @param step_component_id
 * @returns {Promise | Promise<unknown>}
 */
function deleteStepComponent(step_component_id){
    return db.run("DELETE FROM step_components WHERE step_component_id = ?", [step_component_id])
}

/**
 * Create a step component
 * @param step_id
 * @param quantity
 * @param sub_step_id
 * @param sub_recipe_id
 * @param sub_ingredient_id
 * @returns {Promise | Promise<unknown>}
 */
function createStepComponent(step_id, quantity, sub_step_id, sub_recipe_id, sub_ingredient_id){
    return db.insert("step_components", [
        {
            step_id: step_id,
            quantity: quantity,
            sub_step_id: sub_step_id,
            sub_recipe_id: sub_recipe_id,
            sub_ingredient_id: sub_ingredient_id
        }
    ])
}

/**
 * Return a list of all step components
 * @returns {Promise<unknown>}
 */
function getAllStepComponents(){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM step_components", [], (step_components) => {
            if(step_components){
                let o = []
                let p = []

                for (let i = 0; i < step_components.length; i++) {
                    const step_component = step_components[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getStepComponent(step_component.step_component_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting step components")
            }
        })
    })
}

/**
 * Return a step component
 * @param step_component_id
 * @returns {Promise<unknown>}
 */
function getStepComponent(step_component_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM step_components WHERE step_component_id = ?", [step_component_id], async (step_components) => {
            if(step_components && step_components.length > 0){
                const step_component = step_components[0]
                if(step_component.sub_step_id){
                    step_component.component = await getStep(step_component.sub_step_id)
                } else if(step_component.sub_recipe_id){
                    step_component.component = await getRecipe(step_component.sub_recipe_id)
                } else if(step_component.sub_ingredient_id){
                    step_component.component = await getIngredient(step_component.sub_ingredient_id)
                } else {
                    reject("Recipe step component "+ step_component_id +" does not have a sub element")
                }
                resolve(step_component)
            } else {
                reject("Step component " + step_component_id + " not found")
            }
        })
    })
}

/**
 * Provide every functions required to interact with steps
 * @module dao.steps
 * */

/**
 * Change the properties of a step
 * @param step_id
 * @param arr
 * @returns {Promise | Promise<unknown>}
 */
function editStep(step_id, arr){
    return db.update("steps", arr, "step_id = " + step_id)
}

/**
 * Delete a step
 * @param step_id
 * @returns {Promise | Promise<unknown>}
 */
function deleteStep(step_id){
    return db.run("DELETE FROM steps WHERE step_id = ?", [step_id])
}

/**
 * Create a step
 * @param name
 * @param description
 * @param duration
 * @returns {Promise | Promise<unknown>}
 */
function createStep(name, description, duration){
    return db.insert("steps", [
        {
            name: name,
            description: description,
            duration: duration
        }
    ])
}

/**
 * Return a list of all steps
 * @returns {Promise<unknown>}
 */
function getAllSteps(){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM steps", [], (steps) => {
            if(steps){
                let o = []
                let p = []

                for (let i = 0; i < steps.length; i++) {
                    const step = steps[i]
                    p.push(new Promise(async (resolve) => {
                        o.push(await getStep(step.step_id))
                        resolve()
                    }))
                }

                Promise.all(p).then(() => {
                    resolve(o)
                })
            } else {
                reject("Error while requesting steps")
            }
        })
    })
}

/**
 * Return a step
 * @param step_id
 * @returns {Promise<unknown>}
 */
function getStep(step_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM steps WHERE step_id = ?", [step_id], async (steps) => {
            if(steps && steps.length > 0){
                const step = steps[0]
                step.type = "step"
                step.components = []
                step.ingredients = []

                await new Promise((resolve) => {
                    db.select("SELECT * FROM step_components WHERE step_id = ?", [step_id], async (step_components) => {
                        if(step_components && step_components.length > 0){
                            for (let i = 0; i < step_components.length; i++) {
                                const t = await getStepComponent(step_components[i].step_component_id)
                                if(t.component.type === "recipe" || t.component.type === "step"){
                                    for (let j = 0; j < t.quantity; j++) {
                                        for (let k = 0; k < t.component.ingredients; k++) {
                                            step.ingredients.push(t.component.ingredients[k])
                                        }
                                    }
                                } else if(t.component.type === "ingredient"){
                                    for (let j = 0; j < t.quantity; j++) {
                                        step.ingredients.push(t.component)
                                    }
                                }
                                step.components.push(t)
                            }
                        }
                        resolve()
                    })
                })

                resolve(step)
            } else {
                reject("Step " + step_id + " not found")
            }
        })
    })
}

module.exports.getStep = getStep
module.exports.getAllSteps = getAllSteps
module.exports.createStep = createStep
module.exports.deleteStep = deleteStep
module.exports.editStep = editStep


module.exports.getIngredient = getIngredient
module.exports.getAllIngredients = getAllIngredients
module.exports.createIngredient = createIngredient
module.exports.deleteIngredient = deleteIngredient
module.exports.editIngredient = editIngredient
module.exports.addAllergene = addAllergene
module.exports.removeAllergene = removeAllergene


module.exports.getRecipe = getRecipe
module.exports.getAllRecipes = getAllRecipes
module.exports.createRecipe = createRecipe
module.exports.deleteRecipe = deleteRecipe
module.exports.editRecipe = editRecipe
module.exports.addStep = addStep
module.exports.removeStep = removeStep
module.exports.getRecipeStep = getRecipeStep
module.exports.editRecipeStep = editRecipeStep

module.exports.getStepComponent = getStepComponent
module.exports.getAllStepComponents = getAllStepComponents
module.exports.createStepComponent = createStepComponent
module.exports.deleteStepComponent = deleteStepComponent
module.exports.editStepComponent = editStepComponent
