const db = require("../modules/db")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM rooms", function(rooms){
            res.status(200)
            res.send(rooms)
        })
    }
}