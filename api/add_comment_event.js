const bcrypt = require('bcrypt')
const { generateAuthKey } = require('../server');
const db = require("../modules/db");
const { getEvent, uncacheEvent, getEventsOf } = require('../modules/events');

function sanitizeHTML(str) {
	return str.replace(/[^\w. ]/gi, function (c) {
		return '&#' + c.charCodeAt(0) + ';';
	});
};

module.exports = {
    exec: function(req, res){
        getEvent(req.params.uid, function(e){
            if(e){
                if(req.body.text && req.body.text != ""){
                    db.insert("event_comments", [
                        {
                            user_id: res.user.user_id,
                            event_id: e.event_id,
                            content: sanitizeHTML(req.body.text)
                        }
                    ]).then(() => {
                        getEvent(req.params.uid, function(e){
                            res.status(200)
                            res.send(e)
                            
                            // db.select("SELECT * FROM users WHERE user_id <> ?", [res.user.user_id], function(users){
                            //     if(users && users.length > 0){
                            //         for (let i = 0; i < users.length; i++) {
                            //             const user = users[i];
                            //             getEventsOf(user.user_id, function(events){
                            //                 events = events.filter(e => e.uid == req.params.uid)
                            //                 if(events.length > 0){
                            //                     db.insert("notifications", [
                            //                         {
                            //                             user_id: user.user_id,
                            //                             type: "info",
                            //                             title: "Nouveau commentaire",
                            //                             content: `<b>${res.user.username}</b> a ajouté un commentaire à l'évènement <b>${e.name}</b> où vous êtes participant.`,
                            //                             icon: "fas fa-comment",
                            //                             link: "/events/" + e.uid
                            //                         }
                            //                     ])
                            //                     return
                            //                 }
                            //             }, undefined, undefined, {})
                            //         }
                            //     }
                            // })
                        }, false)
                    })
                } else {
                    res.status(400).end("Votre commentaire est vide.")
                }
            } else {
                res.status(404)
                res.end()
            }
        }, undefined, {})
    }
}