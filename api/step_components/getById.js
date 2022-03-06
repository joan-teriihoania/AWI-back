const {getRecipe} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getUnit} = require("../../modules/dao/units");
const {getStep} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getStepComponent} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");


module.exports = {
    exec: function(req, res){
        getStepComponent(req.params.step_component_id).then((step_component) => {
            res.status(200)
            res.send(step_component)
        }).catch((err) => {
            res.status(err ? 500 : 404)
            res.send(err ? err : "Not found")
        })
    }
}
