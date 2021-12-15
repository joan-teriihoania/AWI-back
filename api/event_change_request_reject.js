const db = require("../modules/db")
const { getEventById, getEvent } = require("../modules/events")
const { canCreate, create, getRequest, vote, approve, reject } = require("../modules/event_change_request")

module.exports = {
    exec: function(req, res){
        getRequest(req.params.event_change_request_id, (request) => {
            if(request){
                if(res.user.isAdmin || request.user.isOrganizer){
                    reject(request.event_change_request_id, () => {
                        res.status(200)
                        res.end()
                    })
                } else {
                    res.status(403)
                    res.end("Vous n'êtes pas autorisé à effectuer cette action")
                }
            } else {
                res.status(404)
                res.end("Cette demande n'existe pas")
            }
        })
    }
}