const {getRecipe} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getUnit} = require("../../modules/dao/units");
const {getStep} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getIngredientCategory} = require("../../modules/dao/ingredient_categories");
const {getRecipeCategory} = require("../../modules/dao/recipe_categories");


module.exports = {
    exec: function(req, res){
        getRecipeCategory(req.params.recipe_category_id).then((recipe_category) => {
            res.status(200)
            res.send(recipe_category)
        }).catch((err) => {
            res.status(err ? 500 : 404)
            res.send(err ? err : "Not found")
        })
    }
}
