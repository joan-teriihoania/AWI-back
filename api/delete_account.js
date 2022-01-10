const db = require("../modules/db");
const { deleteAccount } = require("../modules/users");

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM users WHERE user_id = ?", [res.user.user_id], function(users){
            if(users && users.length > 0){
                const user = users[0]
                if(user.created_by_script == 0){
                    if(user.username == decodeURIComponent(req.params.username)){
                        deleteAccount(res.user.user_id).then(() => {
                            res.status(200)
                            res.end()
                        }).catch(() => {
                            res.status(500)
                            res.end()
                        })
                    } else {
                        res.status(403)
                        res.send("Le nom d'utilisateur que vous avez entré ne correspond pas au vôtre.")
                    }
                } else {
                    res.status(403)
                    res.send("Les comptes organisateurs doivent être supprimés avec une procédure spéciale. Contactez un administrateur.")
                }
            } else {
                res.status(404)
                res.end("Nous n'avons pas pu trouver votre compte.")
            }
        })
    }
}
