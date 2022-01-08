const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");

module.exports = {
    exec: function(req, res){
        deleteAllergene(req.params.allergene_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}