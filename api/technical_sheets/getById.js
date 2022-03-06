const {getRecipe} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getUnit} = require("../../modules/dao/units");
const {getStep} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getStepComponent} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getTechnicalSheet} = require("../../modules/dao/technical_sheets");


module.exports = {
    exec: function(req, res){
        getTechnicalSheet(req.params.technical_sheet_id).then((technical_sheet) => {
            res.status(200)
            res.send(technical_sheet)
        }).catch((err) => {
            res.status(err ? 500 : 404)
            res.send(err ? err : "Not found")
        })
    }
}
