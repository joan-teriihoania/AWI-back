const db = require("../modules/db");
const { assign_groups } = require("../modules/load_icals");

module.exports = {
    exec: function(req, res){
        let result = {}
        db.select("SELECT * FROM users WHERE user_id = ?", [res.user.user_id], function(users){
            if(users && users.length > 0){
                const user = users[0]
                result.user = user

                let p = []
                p.push(new Promise((resolve, reject) => {
                    db.select("SELECT * FROM user_events WHERE user_id = ?", [res.user.user_id], function(values){
                        let pr = []
                        result.events = []
                        for (let i = 0; i < values.length; i++) {
                            const value = values[i];
                            pr.push(new Promise((r) => {
                                db.select("SELECT * FROM events WHERE event_id = " + value.event_id, function(event){
                                    result.events.push(event)
                                    r()
                                })
                            }))
                        }
                        
                        Promise.all(pr).then(() => {
                            resolve()
                        })
                    })
                }))
                p.push(new Promise((resolve, reject) => {
                    db.select("SELECT * FROM user_groups WHERE user_id = " + res.user.user_id, function(values){
                        let pr = []
                        result.groups = []
                        for (let i = 0; i < values.length; i++) {
                            const value = values[i];
                            pr.push(new Promise((r) => {
                                db.select("SELECT * FROM groups WHERE group_id = " + value.group_id, function(group){
                                    result.groups.push(group)
                                    r()
                                })
                            }))
                        }
                        
                        Promise.all(pr).then(() => {
                            resolve()
                        })
                    })
                }))
                p.push(new Promise((resolve, reject) => {
                    db.select("SELECT * FROM notifications WHERE user_id = " + res.user.user_id, function(values){
                        result.notifications = values
                        resolve()
                    })
                }))
                p.push(new Promise((resolve, reject) => {
                    db.select("SELECT * FROM messages WHERE sender_user_id = " + res.user.user_id, function(values){
                        if(result.messages == undefined) result.messages = {}
                        result.messages.sent = values
                        resolve()
                    })
                }))
                p.push(new Promise((resolve, reject) => {
                    db.select("SELECT * FROM messages WHERE recipient_user_id = " + res.user.user_id, function(values){
                        if(result.messages == undefined) result.messages = {}
                        result.messages.received = values
                        resolve()
                    })
                }))
                p.push(new Promise((resolve, reject) => {
                    db.select("SELECT * FROM action_links WHERE user_id = " + res.user.user_id, function(values){
                        result.action_links = values
                        resolve()
                    })
                }))

                Promise.all(p).then(() => {
                    res.status(200)
                    res.send(result)
                }).catch(() => {
                    res.status(500)
                    res.end()
                })
            } else {
                res.status(404)
                res.end("Nous n'avons pas pu trouver votre compte.")
            }
        })
    }
}