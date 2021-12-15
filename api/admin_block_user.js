const db = require("../modules/db")
const { sendMail } = require("../modules/mail")
const { uncacheUser, blockAccount } = require("../modules/users")
const fs = require('fs')

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM users WHERE user_id = ?", [req.params.user_id], function(users){
            if(users && users.length > 0){
                if(users[0].blocked) {
                    res.status(409)
                    res.end()
                } else {
                    blockAccount(req.params.user_id, req.body.reason)
                    res.status(200)
                    res.end()
                }
            } else {
                res.status(400)
                res.end()
            }
        })
    }
}