const {createRecipe, getRecipe} = require("../../modules/dao/recipes");
const {createIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {createUnit, getUnit} = require("../../modules/dao/units");
const {createStep, getStep} = require("../../modules/dao/steps");
const {createIngredientCategory, getIngredientCategory} = require("../../modules/dao/ingredient_categories");

module.exports = {
    exec: function(req, res){
        createIngredientCategory(req.body.name).then((ingredient_category_id) => {
            getIngredientCategory(ingredient_category_id).then((ingredient_category) => {
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