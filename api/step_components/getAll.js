const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");
const {getAllStepComponents} = require("../../modules/dao/step_components");


module.exports = {
    exec: function(req, res){
        getAllStepComponents().then((step_components) => {
            res.send(step_components)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}