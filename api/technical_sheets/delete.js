const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients");
const {deleteUnit} = require("../../modules/dao/units");
const {deleteStep} = require("../../modules/dao/steps");
const {deleteStepComponent} = require("../../modules/dao/step_components");
const {deleteTechnicalSheet} = require("../../modules/dao/technical_sheets");

module.exports = {
    exec: function(req, res){
        deleteTechnicalSheet(req.params.technical_sheet_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}