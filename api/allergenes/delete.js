const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");

module.exports = {
    exec: function(req, res){
        deleteAllergene(req.params.allergene_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            if(err.code && err.code === "SQLITE_CONSTRAINT"){
                res.send("Cet allergène ne peut pas être supprimé car il est utilisé par un ou plusieurs ingrédients.")
            } else {
                res.send(err)
            }
        })
    }
}
