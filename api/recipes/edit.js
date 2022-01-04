const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");
const {editIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {editRecipe, getRecipe} = require("../../modules/dao/recipes");

module.exports = {
    exec: function(req, res){
        editRecipe(req.params.recipe_id, req.body).then(() => {
            getRecipe(req.params.recipe_id).then((recipe) => {
                res.send(recipe)
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
