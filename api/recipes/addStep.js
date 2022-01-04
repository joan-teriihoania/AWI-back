const {getRecipe, addStep} = require("../../modules/dao/recipes");


module.exports = {
    exec: function(req, res){
        addStep(req.params.recipe_id, req.params.step_id, req.body.position, req.body.quantity).then(() => {
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