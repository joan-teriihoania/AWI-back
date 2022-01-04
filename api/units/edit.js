const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");
const {editIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {editTechnicalSheet, getTechnicalSheet} = require("../../modules/dao/technical_sheets");
const {editUnit, getUnit} = require("../../modules/dao/units");

module.exports = {
    exec: function(req, res){
        editUnit(req.params.unit_id, req.body).then(() => {
            getUnit(req.params.unit_id).then((unit) => {
                res.send(unit)
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
