const db = require("../modules/db")
const { getEventsParticipatedBy, getEventsCreatedBy } = require("../modules/events")

module.exports = {
    exec: function(req, res){
        let from = req.query.from ? new Date(req.query.from) : undefined
        let to = req.query.to ? new Date(req.query.to) : undefined

        db.select("SELECT * FROM action_links WHERE link = ?", [req.params.id], function(al){
            if(al && al.length > 0){
                db.select("SELECT * FROM users WHERE user_id = " + al[0].user_id, function(u){
                    if(u && u.length > 0){
                        const user = u[0]
                        getEventsCreatedBy(user.user_id, function(ec){
                            res.status(200)
                            res.send(ec)
                        }, from, to, {groups: true, rooms: true})
                    } else {
                        res.status(500)
                        res.end()
                    }
                })
            } else {
                res.status(404)
                res.end()
            }
        })
    }
}