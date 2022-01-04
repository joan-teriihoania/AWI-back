const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");
const {getAllTechnicalSheets} = require("../../modules/dao/technical_sheets");


module.exports = {
    exec: function(req, res){
        getAllTechnicalSheets().then((technical_sheets) => {
            res.send(technical_sheets)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}