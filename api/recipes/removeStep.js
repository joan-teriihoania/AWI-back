const {getRecipe, addStep, removeStep} = require("../../modules/dao/recipes");


module.exports = {
    exec: function(req, res){
        removeStep(req.params.recipe_id, req.params.step_id).then(() => {
            getRecipe(req.params.recipe_id).then((recipe) => {
                res.send(recipe)
            }).catch((err) => {
                res.status(500)
                res.send(err)
            })
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}
