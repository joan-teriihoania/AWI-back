const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");

module.exports = {
    exec: function(req, res){
        editAllergene(req.params.allergene_id, req.body).then(() => {
            getAllergene(req.params.allergene_id).then((allergene) => {
                res.send(allergene)
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
