const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");
const {getAllIngredientCategories} = require("../../modules/dao/ingredient_categories");


module.exports = {
    exec: function(req, res){
        getAllIngredientCategories().then((ingredient_categories) => {
            res.send(ingredient_categories)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}