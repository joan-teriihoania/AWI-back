const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");
const {editIngredient, getIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {editStepComponent, getStepComponent} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");

module.exports = {
    exec: function(req, res){
        editStepComponent(req.params.step_component_id, req.body).then(() => {
            getStepComponent(req.params.step_component_id).then((step_component) => {
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
