const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");


module.exports = {
    exec: function(req, res){
        getAllAllergenes(req.query).then((allergenes) => {
            res.send(allergenes)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}