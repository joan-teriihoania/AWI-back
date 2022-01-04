const {getRecipe, addStep} = require("../../modules/dao/recipes");
const {addAllergene, getIngredient} = require("../../modules/dao/ingredients");


module.exports = {
    exec: function(req, res){
        addAllergene(req.params.ingredient_id, req.params.allergene_id).then(() => {
            getIngredient(req.params.ingredient_id).then((ingredient) => {
                res.send(ingredient)
            }).catch((err) => {
                res.status(500)
                res.send(err)
            })
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}