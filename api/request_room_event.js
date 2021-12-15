const db = require("../modules/db")
const { getEvent } = require("../modules/events")

module.exports = {
    exec: function(req, res){
        db.select("SELECT uid FROM events e JOIN event_rooms er ON e.event_id = er.event_id JOIN rooms ON er.room_id = rooms.room_id WHERE rooms.room_id = ? AND uid = ?", [req.params.id, req.params.uid], function(uids){
            if(uids && uids.length > 0){
                getEvent(uids[0].uid, function(event){
                    res.status(200)
                    res.send(event)
                })
            } else {
                res.status(404)
                res.end()    
            }
        })
    }
}