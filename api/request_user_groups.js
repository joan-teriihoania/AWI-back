const db = require("../modules/db")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM groups g JOIN user_groups ug ON g.group_id = ug.group_id WHERE ug.user_id = " + res.user.user_id, function(groups){
            res.status(200)
            res.send(groups)
        })
    }
}