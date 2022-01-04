const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients");
const {deleteUnit} = require("../../modules/dao/units");
const {deleteStep} = require("../../modules/dao/steps");
const {deleteIngredientCategory} = require("../../modules/dao/ingredient_categories");

module.exports = {
    exec: function(req, res){
        deleteIngredientCategory(req.params.ingredient_category_id).then(() => {
            res.send("OK")
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}