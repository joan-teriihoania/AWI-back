const db = require('../db')
const {getRecipeStep} = require("./recipe_steps");
const {getRecipe} = require("./recipes");
const {getIngredient} = require("./ingredients");

function editRecipeStepComponent(recipe_step_component_id, arr){
    return db.update("recipe_step_components", arr, "recipe_step_component_id = " + recipe_step_component_id)
}

function deleteRecipeStepComponent(recipe_step_component_id){
    return db.run("DELETE FROM recipe_step_components WHERE recipe_step_component_id = ?", [recipe_step_component_id])
}

function createRecipeStepComponent(recipe_step_id, quantity, sub_recipe_step_id, sub_recipe_id, sub_ingredient_id){
    return db.insert("recipe_step_components", [
        {
            recipe_step_id: recipe_step_id,
            quantity: quantity,
            sub_recipe_step_id: sub_recipe_step_id,
            sub_recipe_id: sub_recipe_id,
            sub_ingredient_id: sub_ingredient_id
        }
    ])
}

function getRecipeStepComponent(recipe_step_component_id){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM recipe_steps WHERE recipe_step_component_id = ?", [recipe_step_component_id], async (recipe_step_components) => {
            if(recipe_step_components && recipe_step_components.length > 0){
                const recipe_step_component = recipe_step_components[0]
                if(recipe_step_component.sub_recipe_step_id){
                    recipe_step_component.sub_recipe_step = await getRecipeStep(recipe_step_component.sub_recipe_step_id)
                } else if(recipe_step_component.sub_recipe_id){
                    recipe_step_component.sub_recipe = await getRecipe(recipe_step_component.sub_recipe_id)
                } else if(recipe_step_component.sub_ingredient_id){
                    recipe_step_component.sub_ingredient = await getIngredient(recipe_step_component.sub_ingredient_id)
                } else {
                    reject("Recipe step component does not have a sub element")
                }
                resolve(recipe_step_component)
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    getRecipeStepComponent,
    createRecipeStepComponent,
    deleteRecipeStepComponent,
    editRecipeStepComponent
}