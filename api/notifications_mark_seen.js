const { encrypt } = require('../modules/crypto');
const db = require('../modules/db');

module.exports = {
    exec: function(req, res){
        if(!req.params.notif_id){
            res.status(400)
            res.send("Identifiant de notification vide")
            return
        }

        if(req.params.notif_id == "all"){
            db.run("UPDATE notifications SET seen = 1 WHERE user_id = " + res.user.user_id).then(() => {
                res.status(200)
                res.send('OK')
            })
        } else {
            db.select("SELECT * FROM notifications WHERE user_id = " + res.user.user_id + " AND notif_id = ?", [req.params.notif_id], function(rows){
                if(rows && rows.length > 0){
                    db.run("UPDATE notifications SET seen = 1 WHERE notif_id = ?", [req.params.notif_id])
                    res.status(200)
                    res.send('OK')
                } else {
                    res.status(400)
                    res.send('La notification a déjà été marquée comme lue ou n\'existe pas')
                }
            })
        }
    }
}