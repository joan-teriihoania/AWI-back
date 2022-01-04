const db = require('../db')
const {getRecipe} = require("./recipes");
const {getIngredient} = require("./ingredients");
const {getStep} = require("./steps");

function editStepComponent(step_component_id, arr){
    return db.update("step_components", arr, "step_component_id = " + step_component_id)
}

function deleteStepComponent(step_component_id){
    return db.run("DELETE FROM step_components WHERE step_component_id = ?", [step_component_id])
}

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

module.exports = {
    getStepComponent,
    getAllStepComponents,
    createStepComponent,
    deleteStepComponent,
    editStepComponent
}