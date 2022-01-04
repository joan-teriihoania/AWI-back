const {getRecipe} = require("../../modules/dao/recipes");
const {getIngredient} = require("../../modules/dao/ingredients");
const {getUnit} = require("../../modules/dao/units");
const {getStep} = require("../../modules/dao/steps");
const {getStepComponent} = require("../../modules/dao/step_components");


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