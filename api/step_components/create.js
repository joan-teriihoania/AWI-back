const {createRecipe, getRecipe} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {createIngredient, getIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {createUnit, getUnit} = require("../../modules/dao/units");
const {createStep, getStep} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {createStepComponent, getStepComponent} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");

module.exports = {
    exec: function(req, res){
        createStepComponent(req.params.step_id, req.body.quantity, req.body.sub_step_id, req.body.sub_recipe_id, req.body.sub_ingredient_id).then((step_component_id) => {
            getStepComponent(step_component_id).then((step_component) => {
                res.send(step_component)
            }).catch((err) => {
                res.status(500)
                res.send(err)
            })
        }).catch((err) => {
            res.status(400)
            res.send(err)
        })
    }
}
