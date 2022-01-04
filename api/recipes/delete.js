const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteRecipe} = require("../../modules/dao/recipes");

module.exports = {
    exec: function(req, res){
        deleteRecipe(req.params.recipe_id).then(() => {
            res.send("OK")
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}