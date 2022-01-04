const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");
const {editIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {editStep, getStep} = require("../../modules/dao/steps");

module.exports = {
    exec: function(req, res){
        editStep(req.params.step_id, req.body).then(() => {
            getStep(req.params.step_id).then((step) => {
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
