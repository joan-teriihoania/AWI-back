const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteRecipe} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");

module.exports = {
    exec: function(req, res){
        deleteRecipe(req.params.recipe_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            if(err.code && err.code === "SQLITE_CONSTRAINT"){
                res.send("Cette recette ne peut pas être supprimée car elle est utilisée dans d'autres éléments (étapes, recettes, etc).")
            } else {
                res.send(err)
            }
        })
    }
}
