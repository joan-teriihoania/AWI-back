const db = require("../modules/db")
const { getEventsParticipatedBy, getEventsCreatedBy, getEventsOfGroup } = require("../modules/events")
const { getEventsOfPromotion } = require("../modules/promotions")

module.exports = {
    exec: function(req, res){
        let from = req.query.from ? new Date(req.query.from) : undefined
        let to = req.query.to ? new Date(req.query.to) : undefined
        let groupNames = req.query.groups ? req.query.groups.split(',') : []
        let events = []
        let p = []
        
        for (let i = 0; i < groupNames.length; i++) {
            const groupName = groupNames[i];
            p.push(new Promise((resolve) => {
                db.select("SELECT * FROM groups WHERE name = ?", [groupName], (groups) => {
                    if(groups && groups.length){
                        const group_id = groups[0].group_id
                        getEventsOfGroup(group_id, (_events) => {
                            for (let i = 0; i < _events.length; i++) {
                                const event = _events[i];
                                let ifAlreadyIn = events.filter(e => e.uid == event.uid)
                                if(ifAlreadyIn.length > 0) continue
                                events.push(event)
                            }
                            resolve()
                        }, from, to, {groups: true, rooms: true})
                    } else {
                        resolve()
                    }
                })
            }))
        }

        Promise.all(p).then(() => {
            res.send(events)
        })
    }
}