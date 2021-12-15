const db = require("../modules/db")
const { getEventsParticipatedBy, getEventsCreatedBy } = require("../modules/events")
const { getEventsOfPromotion } = require("../modules/promotions")

module.exports = {
    exec: function(req, res){
        let from = req.query.from ? new Date(req.query.from) : undefined
        let to = req.query.to ? new Date(req.query.to) : undefined

        getEventsOfPromotion(decodeURIComponent(req.params.promotion_name), from, to, {groups: true, rooms: true}).then((e) => {
            if(e){
                res.status(200)
                res.send(e)    
            } else {
                res.status(404)
                res.end()
            }
        }).catch(() => {
            res.status(404)
            res.end()
        })
    }
}