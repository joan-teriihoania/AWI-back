const {createRecipe, getRecipe} = require("../../modules/dao/recipes");
const {createIngredient, getIngredient} = require("../../modules/dao/ingredients");

module.exports = {
    exec: function(req, res){
        createIngredient(req.body.unit_id, req.body.ingredient_category_id, req.body.name, req.body.price).then((ingredient_id) => {
            getIngredient(ingredient_id).then((ingredient) => {
                res.send(ingredient)
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