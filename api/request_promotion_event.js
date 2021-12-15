const db = require("../modules/db")
const { getEventsParticipatedBy, getEventsCreatedBy } = require("../modules/events")
const { getEventsOfPromotion } = require("../modules/promotions")

module.exports = {
    exec: function(req, res){
        getEventsOfPromotion(decodeURIComponent(req.params.promotion_name), undefined, undefined).then((e) => {
            e = e.filter(e => e.uid == req.params.uid)
            if(e && e.length > 0){
                res.status(200)
                res.send(e[0])    
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