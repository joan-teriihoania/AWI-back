const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients");
const {deleteUnit} = require("../../modules/dao/units");

module.exports = {
    exec: function(req, res){
        deleteUnit(req.params.unit_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}