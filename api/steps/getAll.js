const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");
const {getAllSteps} = require("../../modules/dao/steps");


module.exports = {
    exec: function(req, res){
        getAllSteps().then((steps) => {
            res.send(steps)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}