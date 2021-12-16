const bcrypt = require('bcrypt')
const { generateAuthKey } = require('../server');
const db = require("../modules/db");
const { sendMail } = require('../modules/mail');
const { checkPassword } = require('../modules/users');

module.exports = {
    exec: function(req, res){
        if(req.body.new_password){
            db.select("SELECT * FROM action_links WHERE type = 'reset' AND activated = 0 AND link = ? AND datetime(\'now\') < datetime(created_at, '+24 hours')", [req.params.id], function(rows){
                if(rows && rows.length > 0){
                    checkPassword(req.body.new_password).then(() => {
                        db.run("UPDATE action_links SET activated = 1 WHERE action_link_id = " + rows[0].action_link_id).then(() => {
                            db.run("UPDATE users SET password = ? WHERE user_id = " + rows[0].user_id, [bcrypt.hashSync(req.body.new_password, 10)]).then(() => {
                                res.send("OK")
                            }).catch(() => {
                                res.status(400)
                                res.send("Une erreur s'est produite durant la réinitialisation de votre compte")
                            })
                        }).catch(() => {
                            res.status(400)
                            res.send("Une erreur s'est produite durant la réinitialisation de votre compte")
                        })
                    }).catch((reason) => {
                        res.status(400)
                        res.send(reason)
                    })
                } else {
                    res.status(400)
                    res.send("Ce lien est obsolète ou n'existe pas")
                }
            })
        } else {
            res.status(400)
            res.send("Vous devez spécifier un nouveau mot de passe")
        }
    }
}