const bcrypt = require('bcrypt')
const { generateAuthKey } = require('../server');
const db = require("../modules/db");
const { sendMail } = require('../modules/mail');
const fs = require('fs')

module.exports = {
    exec: function(req, res){
        if(req.body.email){
            db.select('SELECT * FROM users u JOIN action_links al ON u.user_id == al.user_id WHERE u.email = ? AND al.type = \'email\' AND al.activated = 1', [req.body.email], function(rows){
                if(rows && rows.length > 0){
                    db.insert("action_links", [
                        {
                            "link": generateAuthKey(128),
                            "user_id": rows[0].user_id,
                            "type": "reset"
                        }
                    ]).then((linkId) => {
                        db.select("SELECT * FROM action_links WHERE action_link_id = ?", [linkId], function(activationLink){
                            if(activationLink && activationLink.length > 0){
                                sendMail(
                                    req.body.email,
                                    "Réinitialisation de votre compte",
                                    fs.readFileSync('./api/ask_reset_account/email_reset_link.html', {encoding: 'utf-8'})
                                    .replace(/{{ username }}/gi, rows[0].username)
                                    .replace(/{{ website }}/gi, process.env.FRONT_BASE_URL)
                                    .replace(/{{ action_link }}/gi, process.env.FRONT_BASE_URL + "/account/reset/" + activationLink[0].link)
                                )
                            }
                            res.status(200)
                            res.end()
                        })
                    }).catch(() =>  {
                        res.status(200)
                        res.end()
                    })
                } else {
                    res.status(200)
                    res.end()
                }
            })
        } else {
            res.status(400)
            res.end("Vous devez spécifier une adresse mail")
        }
    }
}
