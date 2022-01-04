const {getRecipe} = require("../../modules/dao/recipes");
const {getIngredient} = require("../../modules/dao/ingredients");


module.exports = {
    exec: function(req, res){
        getIngredient(req.params.ingredient_id).then((ingredient) => {
            res.status(200)
            res.send(ingredient)
        }).catch((err) => {
            res.status(err ? 500 : 404)
            res.send(err ? err : "Not found")
        })
    }
}