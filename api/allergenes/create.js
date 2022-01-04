const {createAllergene, getAllergene} = require("../../modules/dao/allergenes");

module.exports = {
    exec: function(req, res){
        createAllergene(req.body.name).then((allergene_id) => {
            getAllergene(allergene_id).then((allergene) => {
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