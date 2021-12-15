const bcrypt = require('bcrypt')
const { generateAuthKey } = require('../server');
const db = require("../modules/db");
const { getEvent, uncacheEvent, getEventById } = require('../modules/events');

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM event_comments WHERE event_comment_id = ?", [req.params.event_comment_id], function(comments){
            if(comments && comments.length > 0){
                getEventById(comments[0].event_id, function(e){
                    if(res.user.isAdmin || res.user.user_id == comments[0].user_id){
                        db.run("DELETE FROM event_comments WHERE event_comment_id = ?", [req.params.event_comment_id]).then(() => {
                            if(comments[0].user_id != res.user.user_id){
                                db.insert("notifications", [
                                    {
                                        user_id: comments[0].user_id,
                                        type: "warning",
                                        title: "Commentaire supprimé",
                                        content: `Votre commentaire sur l'évènement <b>${e.name}</b> a été supprimé par un administrateur.`,
                                        icon: "fas fa-comment",
                                        link: "/events/" + e.uid
                                    }
                                ])
                            }

                            getEvent(e.uid, function(e){
                                res.status(200)
                                res.send(e)
                            }, false)
                        })
                    } else {
                        res.status(403)
                        res.end()
                    }
                }, false)
            } else {
                res.status(404)
                res.end()
            }
        })
    }
}