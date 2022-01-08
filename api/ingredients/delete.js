const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients");

module.exports = {
    exec: function(req, res){
        deleteIngredient(req.params.ingredient_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}