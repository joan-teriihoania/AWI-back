const db = require("../modules/db")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM rooms WHERE room_id = ?", [req.params.id], function(rooms){
            if(rooms && rooms.length > 0){
                res.status(200)
                res.send(rooms[0])
            } else {
                res.status(404)
                res.end()    
            }
        })
    }
}