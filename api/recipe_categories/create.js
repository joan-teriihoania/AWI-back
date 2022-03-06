const {createRecipe, getRecipe} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {createIngredient, getIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {createUnit, getUnit} = require("../../modules/dao/units");
const {createStep, getStep} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {createIngredientCategory, getIngredientCategory} = require("../../modules/dao/ingredient_categories");
const {createRecipeCategory, getRecipeCategory} = require("../../modules/dao/recipe_categories");

module.exports = {
    exec: function(req, res){
        createRecipeCategory(req.body.name).then((recipe_category_id) => {
            getRecipeCategory(recipe_category_id).then((recipe_category) => {
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
