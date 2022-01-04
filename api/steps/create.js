const {createRecipe, getRecipe} = require("../../modules/dao/recipes");
const {createIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {createUnit, getUnit} = require("../../modules/dao/units");
const {createStep, getStep} = require("../../modules/dao/steps");

module.exports = {
    exec: function(req, res){
        createStep(req.body.name, req.body.description, req.body.duration).then((step_id) => {
            getStep(step_id).then((step) => {
                res.send(step)
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