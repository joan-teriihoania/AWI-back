const db = require("../modules/db")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM groups g", function(groups){
            res.status(200)
            res.send(groups)
        })
    }
}