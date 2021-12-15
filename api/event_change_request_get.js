const db = require("../modules/db")
const { getEventById, getEvent } = require("../modules/events")
const { canCreate, create, getRequest } = require("../modules/event_change_request")

module.exports = {
    exec: function(req, res){
        getRequest(req.params.event_change_request_id, (request) => {
            if(request){
                request.user = {
                    user_id: request.user.user_id,
                    username: request.user.username
                }
                
                request.event.creators = request.event.creators.map((u) => {
                    return {
                        user_id: u.user_id,
                        username: u.username
                    }
                })
                res.send(request)
            } else {
                res.status(404)
                res.end("Cette demande n'existe pas")
            }
        })
    }
}