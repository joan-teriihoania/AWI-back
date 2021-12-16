const db = require('../db')
const {getRecipeStepComponent} = require("./recipe_step_components");

function editRecipeStep(recipe_step_id, arr){
    return db.update("recipe_steps", arr, "recipe_step_id = " + recipe_step_id)
}

function deleteRecipeStep(recipe_step_id){
    return db.run("DELETE FROM recipe_steps WHERE recipe_step_id = ?", [recipe_step_id])
}

function createRecipeStep(recipe_id, position, name, description, quantity, duration){
    return db.insert("recipe_steps", [
        {
            recipe_id: recipe_id,
            position: position,
            name: name,
            description: description,
            quantity: quantity,
            duration: duration
        }
    ])
}

function getRecipeStep(recipe_step_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipe_steps WHERE recipe_step_id = ?", [recipe_step_id], async (recipe_steps) => {
            if(recipe_steps && recipe_steps.length > 0){
                const recipe_step = recipe_steps[0]
                recipe_step.components = []
                recipe_step.ingredients = []

                await new Promise((resolve) => {
                    db.select("SELECT * FROM recipe_step_components WHERE recipe_step_id = ?", [recipe_step_id], async (recipe_step_components) => {
                        if(recipe_step_components && recipe_step_components.length > 0){
                            for (let i = 0; i < recipe_step_components; i++) {
                                const t = await getRecipeStepComponent(recipe_step_components[i].recipe_step_component_id)
                                if(t.sub_recipe || t.sub_recipe_step){
                                    recipe_step.ingredients.push(t.sub_recipe.ingredients)
                                } else if(t.sub_ingredient){
                                    recipe_step.ingredients.push(t.sub_ingredient)
                                }
                                recipe_step.components.push(t)
                            }
                        }
                        resolve()
                    })
                })

                resolve(recipe_step)
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    getRecipeStep,
    createRecipeStep,
    deleteRecipeStep,
    editRecipeStep
}