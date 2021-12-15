const db = require("../modules/db")
const { getEvent, getEventNotes } = require("../modules/events")

module.exports = {
    exec: function(req, res){
        getEvent(req.params.uid, async function(e){
            if(e){
                if(res.user.user_id){
                    await new Promise((resolve) => {
                        getEventNotes(e.event_id, res.user.user_id, (notes) => {
                            e.notes = notes
                            resolve()
                        })
                    })
                }
                res.status(200)
                res.send(e)    
            } else {
                res.status(404)
                res.end()
            }
        })
    }
}