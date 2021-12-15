const db = require("../modules/db")
const { uncacheUser } = require("../modules/users")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM users WHERE user_id = ?", [req.params.user_id], function(users){
            if(users && users.length > 0){
                db.run("UPDATE users SET email = ? WHERE user_id = ?", [req.body.email, req.params.user_id]).then(() => {
                    uncacheUser(req.params.user_id)
                    res.status(200)
                    res.end()
                }).catch((err) => {
                    res.status(500)
                    res.end()
                })
            } else {
                res.status(400)
                res.end()
            }
        })
    }
}