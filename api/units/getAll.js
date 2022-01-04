const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");
const {getAllUnits} = require("../../modules/dao/units");


module.exports = {
    exec: function(req, res){
        getAllUnits().then((units) => {
            res.send(units)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}