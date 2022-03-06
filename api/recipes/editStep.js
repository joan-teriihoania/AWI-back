const {getRecipe, addStep, removeStep, getRecipeStep, editRecipeStep} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");


module.exports = {
    exec: function(req, res){
        getRecipeStep(req.params.recipe_id, req.params.step_id).then((recipe_step) => {
            editRecipeStep(req.params.recipe_id, req.params.step_id, recipe_step.position, req.body.position, req.body.quantity).then(() => {
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
        }).catch((err) => {
            res.status(400)
            res.send(err)
        })
    }
}
