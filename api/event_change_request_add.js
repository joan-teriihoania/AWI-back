const db = require("../modules/db")
const { getEventById, getEvent } = require("../modules/events")
const { canCreate, create, getRequest, getEventChangeConflicts } = require("../modules/event_change_request")

module.exports = {
    exec: function(req, res){
        getEvent(req.params.event_uid, (event) => {
            if(event){
                canCreate(event.event_id, res.user.user_id).then(async () => {
                    let conflicts = undefined

                    if(!req.body.confirm){
                        await new Promise((resolve) => {
                            getEventChangeConflicts(event.event_id, req.body.moveto, (_conflicts) => {
                                if(_conflicts.creators.length > 0 || _conflicts.groups.length > 0){
                                    conflicts = _conflicts
                                }
                                resolve()
                            })
                        })
                    }

                    if(!conflicts){
                        create(event.event_id, res.user.user_id, req.body.moveto).then((event_change_request_id) => {
                            getRequest(event_change_request_id, (request) => {
                                res.status(200)
                                res.send(request)
                            })
                        }).catch((reason) => {
                            res.status(400)
                            res.send(reason)
                        })   
                    } else {
                        res.status(409)
                        res.send(conflicts)
                    }
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