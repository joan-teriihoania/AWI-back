const bcrypt = require('bcrypt');
const { encrypt } = require('../modules/crypto');
const db = require('../modules/db');
const {createSessionToken} = require("../modules/dao/session_tokens");

module.exports = {
    exec: function(req, res){
        var email = req.body.email
        var password = req.body.password
        if(email !== undefined && password !== undefined){
            email = decodeURIComponent(email)
            password = decodeURIComponent(password)

            db.select('SELECT * FROM users u JOIN action_links al ON u.user_id == al.user_id WHERE u.email = ? AND al.type = \'email\' AND al.activated = 1', [email], function(rows){
                if(rows && rows.length > 0 && bcrypt.compareSync(password, rows[0].password)){
                    if(!rows[0].blocked){
                        createSessionToken(rows[0].user_id).then(r => {
                            res.status(200)
                            res.send(r)
                        }).catch((err) => {
                            res.status(500)
                            res.send(err)
                        })
                    } else {
                        res.status(403)
                        res.end("Compte bloqué : " + rows[0].blockedReason)
                    }
                } else {
                    res.status(401)
                    res.end("Votre adresse électronique et mot de passe ne correspondent à aucun compte activé")
                }
            })
        } else {
          res.status(400)
          res.end("Paramètre manquant")
        }
    }
}
