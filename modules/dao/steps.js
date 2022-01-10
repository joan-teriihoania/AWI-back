/**
* Provide every functions required to interact with steps
* @module dao.steps
* */

const db = require('../db')
const {getStepComponent} = require("./step_components");

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

module.exports = {
    getStep,
    getAllSteps,
    createStep,
    deleteStep,
    editStep
}
