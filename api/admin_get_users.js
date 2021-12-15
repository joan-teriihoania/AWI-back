const db = require("../modules/db")
const { getUserInfo } = require("../modules/users")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM users", function(users){
            let _users = []
            let p = []
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                p.push(new Promise((resolve, reject) => {
                    getUserInfo(user.user_id).then((u) => {
                        _users.push(u)
                        resolve()
                    }).catch(() => {
                        resolve()
                    })
                }))
            }
            Promise.all(p).then(() => {
                res.status(200)
                res.send(_users)
            })
        })
    }
}