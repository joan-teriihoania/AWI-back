const {createRecipe, getRecipe} = require("../../modules/dao/recipes");
const {createIngredient, getIngredient} = require("../../modules/dao/ingredients");
const {createUnit, getUnit} = require("../../modules/dao/units");

module.exports = {
    exec: function(req, res){
        createUnit(req.body.name).then((unit_id) => {
            getUnit(unit_id).then((unit) => {
                res.send(unit)
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