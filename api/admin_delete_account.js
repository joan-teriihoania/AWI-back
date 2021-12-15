const db = require("../modules/db");
const { assign_groups } = require("../modules/load_icals");
const { deleteAccount } = require("../modules/users");

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM users WHERE user_id = ?", [req.params.user_id], function(users){
            if(users && users.length > 0){
                const user = users[0]
                deleteAccount(user.user_id).then(() => {
                    res.status(200)
                    res.end()
                }).catch(() => {
                    res.status(500)
                    res.end()
                })
            } else {
                res.status(404)
                res.end()
            }
        })
    }
}