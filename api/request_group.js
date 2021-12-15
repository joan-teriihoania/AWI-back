const db = require("../modules/db")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM groups WHERE group_id = ?", [req.params.id], function(groups){
            if(groups && groups.length > 0){
                res.status(200)
                res.send(groups[0])
            } else {
                res.status(404)
                res.end()    
            }
        })
    }
}