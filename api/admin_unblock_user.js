const db = require("../modules/db")
const { uncacheUser } = require("../modules/users")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM users WHERE user_id = ?", [req.params.user_id], function(users){
            if(users && users.length > 0){
                if(!users[0].blocked) {
                    res.status(409)
                    res.end()
                } else {
                    db.run("UPDATE users SET blocked = 0 WHERE user_id = ?", [req.params.user_id]).then(() => {
                        uncacheUser(req.params.user_id)
                        res.status(200)
                        res.end()
                    })
                }
            } else {
                res.status(400)
                res.end()
            }
        })
    }
}