const db = require("../modules/db")
const { getEventById, getEvent } = require("../modules/events")
const { canCreate, create, getRequest } = require("../modules/event_change_request")

module.exports = {
    exec: function(req, res){
        getEvent(req.params.event_uid, (event) => {
            if(event){
                canCreate(event.event_id, res.user.user_id).then(() => {
                    res.status(200)
                    res.end("OK")
                }).catch((reason) => {
                    res.status(403)
                    res.send(reason)
                })
            } else {
                res.status(404)
                res.send("L'évènement que vous avez spécifié n'existe pas")
            }
        }, undefined, {})
    }
}