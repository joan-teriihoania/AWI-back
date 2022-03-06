const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {deleteUnit} = require("../../modules/dao/units");

module.exports = {
    exec: function(req, res){
        deleteUnit(req.params.unit_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            if(err.code && err.code === "SQLITE_CONSTRAINT"){
                res.send("Cette unité ne peut pas être supprimée car elle est utilisée par un ou plusieurs ingrédients.")
            } else {
                res.send(err)
            }
        })
    }
}
