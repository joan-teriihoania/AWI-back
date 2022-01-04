const {createAllergene, getAllergene, editAllergene} = require("../../modules/dao/allergenes");
const {editIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {editRecipeCategory, getRecipeCategory} = require("../../modules/dao/recipe_categories");

module.exports = {
    exec: function(req, res){
        editRecipeCategory(req.params.recipe_category_id, req.body).then(() => {
            getRecipeCategory(req.params.recipe_category_id).then((recipe_category) => {
                res.send(recipe_category)
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
