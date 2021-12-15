const db = require("../modules/db")
const { getEventById, getEvent } = require("../modules/events")
const { canCreate, create, getRequest, vote } = require("../modules/event_change_request")

module.exports = {
    exec: function(req, res){
        getRequest(req.params.event_change_request_id, (request) => {
            if(request){
                vote(req.params.event_change_request_id, res.user.user_id, req.body.approve == 1 ? true : false).then(() => {
                    res.status(200)
                    res.end("OK")
                }).catch((reason) => {
                    res.status(400)
                    res.send(reason)
                })
            } else {
                res.status(404)
                res.end("Cette demande n'existe pas")
            }
        })
    }
}