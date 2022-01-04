const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");
const {getAllRecipeCategories} = require("../../modules/dao/recipe_categories");


module.exports = {
    exec: function(req, res){
        getAllRecipeCategories().then((recipe_categories) => {
            res.send(recipe_categories)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}