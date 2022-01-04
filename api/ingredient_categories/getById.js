const {getRecipe} = require("../../modules/dao/recipes");
const {getIngredient} = require("../../modules/dao/ingredients");
const {getUnit} = require("../../modules/dao/units");
const {getStep} = require("../../modules/dao/steps");
const {getIngredientCategory} = require("../../modules/dao/ingredient_categories");


module.exports = {
    exec: function(req, res){
        getIngredientCategory(req.params.ingredient_category_id).then((ingredient_category) => {
            res.status(200)
            res.send(ingredient_category)
        }).catch((err) => {
            res.status(err ? 500 : 404)
            res.send(err ? err : "Not found")
        })
    }
}