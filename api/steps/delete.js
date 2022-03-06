const {createAllergene, getAllergene, deleteAllergene} = require("../../modules/dao/allergenes");
const {deleteIngredient} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");
const {deleteUnit} = require("../../modules/dao/units");
const {deleteStep} = require("../../modules/dao/ingredients_recipes_steps_stepcomponents");

module.exports = {
    exec: function(req, res){
        deleteStep(req.params.step_id).then(() => {
            res.send({})
        }).catch((err) => {
            res.status(500)
            if(err.code && err.code === "SQLITE_CONSTRAINT"){
                res.send("Cette étape ne peut pas être supprimée car elle est utilisée dans d'autres éléments (étapes, recettes, etc).")
            } else {
                res.send(err)
            }
        })
    }
}
