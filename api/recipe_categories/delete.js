const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients");
const {deleteUnit} = require("../../modules/dao/units");
const {deleteStep} = require("../../modules/dao/steps");
const {deleteIngredientCategory} = require("../../modules/dao/ingredient_categories");
const {deleteRecipeCategory} = require("../../modules/dao/recipe_categories");

module.exports = {
    exec: function(req, res){
        deleteRecipeCategory(req.params.recipe_category_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}