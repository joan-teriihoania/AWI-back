const {getAllergene} = require("../../modules/dao/allergenes");


module.exports = {
    exec: function(req, res){
        getAllergene(req.params.allergene_id).then((allergene) => {
            res.status(200)
            res.send(allergene)
        }).catch((err) => {
            res.status(err ? 500 : 404)
            res.send(err ? err : "Not found")
        })
    }
}