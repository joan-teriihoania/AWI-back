const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");
const {editIngredient, getIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");

module.exports = {
    exec: function(req, res){
        editIngredient(req.params.ingredient_id, req.body).then(() => {
            getIngredient(req.params.ingredient_id).then((ingredient) => {
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
