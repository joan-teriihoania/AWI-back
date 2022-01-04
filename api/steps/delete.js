const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients");
const {deleteUnit} = require("../../modules/dao/units");
const {deleteStep} = require("../../modules/dao/steps");

module.exports = {
    exec: function(req, res){
        deleteStep(req.params.step_id).then(() => {
            res.send("OK")
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}