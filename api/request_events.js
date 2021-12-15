const db = require("../modules/db")
const { getEventsParticipatedBy, getEventsCreatedBy } = require("../modules/events")

module.exports = {
    exec: function(req, res){
        let from = req.query.from ? new Date(req.query.from) : undefined
        let to = req.query.to ? new Date(req.query.to) : undefined

        getEventsParticipatedBy(res.user.user_id, function(ep){
            getEventsCreatedBy(res.user.user_id, function(ec){
                let e = ep.concat(ec)
                res.status(200)
                res.send(e)
            }, from, to, {groups: true, rooms: true})
        }, from, to, {groups: true, rooms: true})
    }
}