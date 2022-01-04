const bcrypt = require('bcrypt')
const { generateAuthKey } = require('../server');
const db = require("../modules/db")
const fs = require('fs');
const { sendMail } = require('../modules/mail');
const { checkPassword } = require('../modules/users');

function endsWithAny(suffixes, string) {
    return suffixes.some(function (suffix) {
        return string.endsWith(suffix);
    });
}

module.exports = {
    exec: function(req, res){
        var username = req.body.username
        var email = req.body.email
        var password = req.body.password

        if(username !== undefined && email !== undefined && password !== undefined){
            username = decodeURIComponent(username)
            password = decodeURIComponent(password)
            email = decodeURIComponent(email)

            if(!endsWithAny(process.env.AUTHORIZED_EMAIL_END_WITH.split(','), email)){
                res.status(500)
                res.send("Votre adresse électronique possède un domain non-reconnu")
                return
            }

            checkPassword(password).then(() => {
                db.insert("users", [
                    {
                        "username": username,
                        "email": email,
                        "password": bcrypt.hashSync(password, 10),
                        "blocked": 1,
                        "blockedReason": "Votre compte doit être validé par un administrateur"
                    }
                ]).then((userId) => {
                    db.insert("action_links", [
                        {
                            "link": generateAuthKey(128),
                            "user_id": userId,
                            "type": "email"
                        }
                    ]).then((linkId) => {
                        db.select("SELECT * FROM users WHERE user_id = " + userId, function(new_user){
                            db.select("SELECT * FROM action_links WHERE action_link_id = " + linkId, function(activationLink){
                                if(new_user && new_user.length > 0 && activationLink && activationLink.length > 0){
                                    sendMail(
                                        new_user[0].email,
                                        "Activation de votre compte",
                                        {
                                            header: {
                                                title: "Inscription",
                                                subtitle: "Activation de votre compte"
                                            },
                                            main:{
                                                components:[
                                                    {
                                                        type: "text",
                                                        content: [
                                                            {
                                                                type: "title",
                                                                lines: [
                                                                    "Bonjour "+new_user[0].username+","
                                                                ]
                                                            },
                                                            {
                                                                type: "text",
                                                                lines: [
                                                                    "Il ne vous reste plus qu'une seule chose à faire pour finaliser votre inscription à <b>"+process.env.APP_NAME+"</b> ! Pour cela, vous devez activer votre compte et confirmer votre adresse mail en cliquant sur le lien ci-dessous."
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        type: "button",
                                                        text: "Activer mon compte",
                                                        link: process.env.FRONT_BASE_URL + "/account/activate/" + activationLink[0].link
                                                    }
                                                ]
                                            }
                                        }
                                    ).then((info) => {
                                        res.status(200)
                                        res.send({
                                            activationLink: activationLink[0],
                                            user: new_user[0]
                                        })
                                    }).catch((error) => {
                                        db.run("DELETE FROM users WHERE user_id = ?", [userId])
                                        db.run("DELETE FROM action_links WHERE user_id = ?", [userId])
                                        res.status(500)
                                        res.send("Votre adresse email ne semble pas valide ou un problème a été rencontré lors de l'envoi de votre mail d'activation")
                                    })
                                } else {
                                    res.status(500)
                                    res.send("Nous rencontrons des difficultés à récupérer les informations de votre compte")
                                }
                            })
                        })
                    }).catch(() =>  {
                        res.send("Un problème est survenu lors de la tentative d'activation de votre compte")
                    })
                }).catch((e) =>  {
                    res.status(500)
                    res.send("Ce nom d'utilisateur ou cette adresse électronique est déjà utilisée")
                })
            }).catch((reason) => {
                res.status(500)
                res.send(reason)
            })
        } else {
            res.status(400)
            res.end("Paramètre manquant")
        }
    }
}