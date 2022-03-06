const {getRecipe} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {getUnit} = require("../../modules/dao/units");


module.exports = {
    exec: function(req, res){
        getUnit(req.params.unit_id).then((unit) => {
            res.status(200)
            res.send(unit)
        }).catch((err) => {
            res.status(err ? 500 : 404)
            res.send(err ? err : "Not found")
        })
    }
}
