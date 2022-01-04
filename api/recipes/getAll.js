const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");
const {getAllRecipes} = require("../../modules/dao/recipes");


module.exports = {
    exec: function(req, res){
        getAllRecipes().then((recipes) => {
            res.send(recipes)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}