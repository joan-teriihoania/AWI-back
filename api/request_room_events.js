const db = require("../modules/db")
const { getEvent } = require("../modules/events")

module.exports = {
    exec: function(req, res){
        let from = req.query.from
        let to = req.query.to

        let date_selector = ""
        if(from != undefined && to != undefined){
            from = new Date(from)
            to = new Date(to)
            if((from instanceof Date && !isNaN(from)) || (to instanceof Date && !isNaN(to))){
                let from_string = from.toISOString().replace('T', ' ').replace('Z', '').replace('.000', '')
                let to_string = to.toISOString().replace('T', ' ').replace('Z', '').replace('.000', '')
                date_selector = "AND (startsAt BETWEEN '"+from_string+"' AND '"+to_string+"' OR endsAt BETWEEN '"+from_string+"' AND '"+to_string+"')"
            } else {
                from = undefined
                to = undefined
            }
        }

        db.select("SELECT uid FROM events e JOIN event_rooms er ON e.event_id = er.event_id JOIN rooms ON er.room_id = rooms.room_id WHERE deleted = 0 AND rooms.room_id = ? " + date_selector, [req.params.id], function(uids){
            if(uids){
                let p = []
                let result = []
                for (let i = 0; i < uids.length; i++) {
                    const uid = uids[i].uid;
                    p.push(new Promise((resolve) => {
                        getEvent(uid, function(event){
                            result.push(event)
                            resolve()
                        }, undefined, {groups: true, rooms: true})
                    }))
                }

                Promise.all(p).then(() => {
                    res.status(200)
                    res.send(result)
                })
            } else {
                res.status(404)
                res.end()    
            }
        })
    }
}