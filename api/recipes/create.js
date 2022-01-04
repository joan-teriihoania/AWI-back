const {createRecipe, getRecipe} = require("../../modules/dao/recipes");

module.exports = {
    exec: function(req, res){
        createRecipe(req.body.name, req.body.nb_couvert, res.user.user_id, req.body.recipe_category_id).then((recipe_id) => {
            getRecipe(recipe_id).then((recipe) => {
                res.send(recipe)
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