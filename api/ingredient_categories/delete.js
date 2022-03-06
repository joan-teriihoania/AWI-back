const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {deleteUnit} = require("../../modules/dao/units");
const {deleteStep} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {deleteIngredientCategory} = require("../../modules/dao/ingredient_categories");

module.exports = {
    exec: function(req, res){
        deleteIngredientCategory(req.params.ingredient_category_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            if(err.code && err.code === "SQLITE_CONSTRAINT"){
                res.send("Cette catégorie ne peut pas être supprimée car elle est utilisée par un ou plusieurs ingrédients.")
            } else {
                res.send(err)
            }
        })
    }
}
