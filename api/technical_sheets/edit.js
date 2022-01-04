const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");
const {editIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {editTechnicalSheet, getTechnicalSheet} = require("../../modules/dao/technical_sheets");

module.exports = {
    exec: function(req, res){
        editTechnicalSheet(req.params.technical_sheet_id, req.body).then(() => {
            getTechnicalSheet(req.params.technical_sheet_id).then((technical_sheet) => {
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
