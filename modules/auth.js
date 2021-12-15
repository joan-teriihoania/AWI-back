const db = require('./db')
const googleutils = require('./googleutils')
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();

module.exports = {
    is_auth: function(user, req, callback){
        if(req.query.auth_key){
            db.select('SELECT * FROM users u JOIN action_links al ON u.user_id == al.user_id WHERE u.auth_key = ? AND al.type = \'email\' AND al.activated = 1 AND u.blocked = 0', [req.query.auth_key], function(rows){
                if(rows && rows.length > 0){
                    callback("auth_key", rows[0], true)
                } else {
                    callback(false, undefined)
                }
            })
          return
        }

        if(req.body.auth_key){
            db.select('SELECT * FROM users u JOIN action_links al ON u.user_id == al.user_id WHERE u.auth_key = ? AND al.type = \'email\' AND al.activated = 1 AND u.blocked = 0', [req.body.auth_key], function(rows){
                if(rows && rows.length > 0){
                    callback("auth_key", rows[0], true)
                } else {
                    callback(false, undefined)
                }
            })
          return
        }

        if(user.auth_key){
            db.select('SELECT * FROM users u JOIN action_links al ON u.user_id == al.user_id WHERE u.auth_key = ? AND al.type = \'email\' AND al.activated = 1 AND u.blocked = 0', [user.auth_key], function(rows){
                if(rows && rows.length > 0){
                    callback("credentials", rows[0])
                } else {
                    callback(false, undefined)
                }
            })
          return
        }
        
        callback(false, undefined)
    }
}