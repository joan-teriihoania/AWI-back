const db = require("../modules/db")
const { getEventsParticipatedBy, getEventsCreatedBy, getEventsOfGroup, getEvent, setNotes } = require("../modules/events")
const { getEventsOfPromotion } = require("../modules/promotions")

module.exports = {
    exec: function(req, res){
        getEvent(req.params.uid, (event) => {
            setNotes(event.event_id, res.user.user_id, req.body.content ? req.body.content : "", () => {
                res.status(200)
                res.send("OK")
            })
        }, undefined, {})
    }
}