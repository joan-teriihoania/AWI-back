const db = require("../modules/db")
const { canCreate, create, getRequest, remove } = require("../modules/event_change_request")

module.exports = {
    exec: function(req, res){
        getRequest(req.params.event_change_request_id, (request) => {
            if(res.user.isAdmin || (request.user_id == res.user.user_id && (request.status == "voting" || request.status == "validating"))){
                remove(req.params.event_change_request_id, () => {
                    res.status(200)
                    res.end()
                })
            } else {
                res.status(403)
                res.end("Vous n'êtes pas autorisé à faire cette action")
            }
        })
    }
}