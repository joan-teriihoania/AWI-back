const {getRecipe} = require("../../modules/dao/recipes");


module.exports = {
    exec: function(req, res){
        getRecipe(req.params.recipe_id).then((recipe) => {
            res.status(200)
            res.send(recipe)
        }).catch((err) => {
            res.status(err ? 500 : 404)
            res.send(err ? err : "Not found")
        })
    }
}