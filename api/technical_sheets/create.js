const {createRecipe, getRecipe} = require("../../modules/dao/recipes");
const {createIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {createUnit, getUnit} = require("../../modules/dao/units");
const {createStep, getStep} = require("../../modules/dao/steps");
const {createStepComponent, getStepComponent} = require("../../modules/dao/step_components");
const {createTechnicalSheet, getTechnicalSheet} = require("../../modules/dao/technical_sheets");

module.exports = {
    exec: function(req, res){
        createTechnicalSheet(req.body.recipe_id, req.body.cout_assaisonnement, req.body.cout_personnel, req.body.cout_fluide, req.body.coef_marge).then((technical_sheet_id) => {
            getTechnicalSheet(technical_sheet_id).then((technical_sheet) => {
                res.send(technical_sheet)
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