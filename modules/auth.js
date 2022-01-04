const db = require('./db')
const {decrypt} = require("./crypto");

module.exports = {
    is_auth: function(req, callback){
        if(req.headers && req.headers.authorization){
            let token = req.headers.authorization.split(' ')
            if(token.length > 1 && token[0] === "Bearer"){
                token = token[1]
                db.select('SELECT * FROM users u JOIN action_links al ON u.user_id == al.user_id JOIN session_tokens st ON st.user_id = u.user_id WHERE st.session_token = ? AND al.type = \'email\' AND al.activated = 1 AND u.blocked = 0', [token], function(rows){
                    if(rows && rows.length > 0){
                        rows[0].token = token
                        callback("authorization", rows[0], true)
                    } else {
                        callback(false)
                    }
                })
            } else {
                callback(false)
            }
            return
        }
        
        callback(false)
    }
}