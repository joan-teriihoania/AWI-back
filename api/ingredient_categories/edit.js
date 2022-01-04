const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");
const {editIngredientCategory, getIngredientCategory} = require("../../modules/dao/ingredient_categories");

module.exports = {
    exec: function(req, res){
        editIngredientCategory(req.params.ingredient_category_id, req.body).then(() => {
            getIngredientCategory(req.params.ingredient_category_id).then((ingredient_category) => {
                res.send(ingredient_category)
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
