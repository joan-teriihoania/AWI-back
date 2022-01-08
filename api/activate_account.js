const bcrypt = require('bcrypt')
const { generateAuthKey } = require('../server');
const db = require("../modules/db")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM action_links WHERE type = 'email' AND activated = 0 AND link = ?", [req.params.id], function(rows){
            if(rows && rows.length > 0){
                db.run("UPDATE action_links SET activated = 1 WHERE action_link_id = ?", [rows[0].action_link_id]).then(() => {
                    res.send({})
                }).catch(() => {
                    res.status(400)
                    res.send("Une erreur s'est produite durant l'activation de votre compte")
                })
            } else {
                res.status(400)
                res.send("Ce lien est obsolète ou n'existe pas")
            }
        })
    }
}