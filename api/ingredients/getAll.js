const {getAllergene, getAllAllergenes} = require("../../modules/dao/allergenes");
const {getAllIngredients} = require("../../modules/dao/ingredients");


module.exports = {
    exec: function(req, res){
        getAllIngredients().then((ingredients) => {
            res.send(ingredients)
        }).catch((err) => {
            res.status(500)
            res.send(err)
        })
    }
}