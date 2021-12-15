const bcrypt = require('bcrypt');
const { encrypt } = require('../modules/crypto');
const db = require('../modules/db');

module.exports = {
    exec: function(req, res){
        var email = req.query.email
        var password = req.query.password
        if(email != undefined && password != undefined){
            email = decodeURIComponent(email)
            password = decodeURIComponent(password)

            db.select('SELECT * FROM users u JOIN action_links al ON u.user_id == al.user_id WHERE u.email = ? AND al.type = \'email\' AND al.activated = 1', [email], function(rows){
                if(rows && rows.length > 0 && bcrypt.compareSync(password, rows[0].password)){
                    if(!rows[0].blocked){
                        res.cookie("JZ-Translation-auth", encrypt(JSON.stringify({
                            "auth_key": rows[0].auth_key
                        })), { expires: new Date(new Date().getTime() + 1000*60*60*24*365) })
    
                        res.status(200)
                        res.cookie("redirect_after_login", "/")
                        res.send({
                            redirect: req.cookies["redirect_after_login"],
                            user: rows[0]
                        })
                        return
                    } else {
                        res.status(403)
                        res.end(rows[0].blockedReason)
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