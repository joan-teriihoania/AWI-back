const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");

module.exports = {
    exec: function(req, res){
        deleteIngredient(req.params.ingredient_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            if(err.code && err.code === "SQLITE_CONSTRAINT"){
                res.send("Cet ingrédient ne peut pas être supprimé car il est utilisé dans d'autres éléments (étapes, recettes, etc).")
            } else {
                res.send(err)
            }
        })
    }
}
