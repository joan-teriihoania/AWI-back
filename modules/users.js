const db = require("./db")
const request = require('request')
const { sendMail } = require("./mail")
const fs = require('fs')

function checkPassword(password){
    return new Promise((resolve, reject) => {
        // Regex to check if a string
        // contains uppercase, lowercase
        // special character & numeric value
        var pattern = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$"
        );

        // Print Yes If the string matches
        // with the Regex
        if (password && password.length >= 12 && pattern.test(password)) {
            resolve()
        } else {
            reject("Votre mot de passe doit contenir au moins 12 caractères, au moins une minuscule, une majuscule, un caractère spécial et un chiffre")
        }
    })
}

function blockAccount(user_id, reason = "Aucune raison spécifiée"){
    getUserInfo(user_id).then((user) => {
        db.run("UPDATE users SET blocked = 1, blockedReason = ? WHERE user_id = ?", [reason, user_id]).then(() => {
            sendMail(user.email, "Compte bloqué", {
                header: {
                    title: "Compte bloqué",
                    subtitle: "Notification système"
                },
                main: {
                    components: [
                        {
                            type: "text",
                            content: [
                                {
                                    type: "title",
                                    lines: [
                                        `Bonjour ${user.username},`
                                    ]
                                },
                                {
                                    type: "text",
                                    lines: [
                                        `Votre compte <b>Polygenda</b> a été bloqué par un administrateur pour la raison suivante : <code>${reason}</code>.`,
                                        "De ce fait, votre accès à nos services vous est restreint jusqu'à le déblocage de votre compte.",
                                        "",
                                        "Pour en savoir plus, vous pouvez prendre contact directement auprès d'un administrateur."
                                    ]
                                }
                            ]
                        }
                    ]
                }
            })
            uncacheUser(user_id)
        })
    })
}

function deleteAccount(user_id){
    return new Promise(async (resolve, reject) => {
        await new Promise((resolve) => {
            getUserInfo(user_id).then((user) => {
                sendMail(user.email, "Compte supprimé", {
                    header: {
                        title: "Compte supprimé",
                        subtitle: "Notification système"
                    },
                    main: {
                        components: [
                            {
                                type: "text",
                                content: [
                                    {
                                        type: "title",
                                        lines: [
                                            `Bonjour ${user.username},`
                                        ]
                                    },
                                    {
                                        type: "text",
                                        lines: [
                                            `Nous sommes navrés de vous voir partir, votre compte a bien été supprimé et toutes vos informations ont été effacées de notre base.`,
                                            "",
                                            "Nous vous remercions de votre passage avec nous et espérons vous revoir bientôt."
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                })
                resolve()
            })
        })

        let p = []
        p.push(db.run("DELETE FROM users WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM user_events WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM user_groups WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM notifications WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM messages WHERE sender_user_id = " + user_id))
        p.push(db.run("DELETE FROM messages WHERE recipient_user_id = " + user_id))
        p.push(db.run("DELETE FROM action_links WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM user_groups_blacklist_filter WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM user_groups_whitelist_filter WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM event_change_requests WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM event_change_request_votes WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM whoisthisteacher_scoreboard WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM applications WHERE user_id = " + user_id))
        p.push(db.run("DELETE FROM notes WHERE user_id = " + user_id))

        Promise.all(p).then(() => {
            uncacheUser(user_id)
            resolve()
        }).catch(() => {
            reject()
        })
    })
}

function checkURL(url){
    return new Promise((resolve, reject) => {
        if(url == "") return resolve(false)
        return request.head({
          url: url,
          timeout: 5000
        }).on("response", (res) => {
            resolve(res.statusCode.toString()[0] === "2")
        }).on("error", (res) => {
            resolve(false)
        })
    })
}

let cachedUsers = {}
let minuteToCache = 10

setInterval(() => {
    for (const user_id in cachedUsers) {
      if (cachedUsers[user_id]) {
        if(new Date().getTime() - cachedUsers[user_id].timestamp > minuteToCache*60*1000){
          cachedUsers[user_id] = undefined
        }
      }
    }
}, 1000);

function getUserInfo(user_id, partial = false){
    return new Promise((resolve, reject) => {
        if(cachedUsers[user_id]) resolve(cachedUsers[user_id].content)
        db.select("SELECT * FROM users WHERE user_id = " + user_id, function(users){
            if(users && users.length > 0){
                const user = users[0]
                const userObject = {}
                let p = []
                
                for (const [key, value] of Object.entries(user)) {
                    if(["password", "discord_token", "twitter_token"].includes(key)) continue
                    userObject[key] = value
                }
    
                userObject.isAdmin = (process.env.ADMIN_EMAILS.split(',').includes(userObject.email))
                if(!userObject.img_profile || userObject.img_profile == ""){
                    userObject.img_profile = process.env.BASE_URL + "/assets/img/no_profile_picture.png"
                }

                if(userObject.img_profile != process.env.BASE_URL + "/assets/img/no_profile_picture.png"){
                    p.push(new Promise((resolve) => {
                        checkURL(userObject.img_profile.startsWith("/") ? process.env.BASE_URL + userObject.img_profile : userObject.img_profile).then((exists) => {
                            if(!exists){
                                userObject.img_profile = process.env.BASE_URL + "/assets/img/no_profile_picture.png"
                            }
                            resolve()
                        })
                    }))
                }
                
                p.push(new Promise((resolve) => {
                    db.select("SELECT * FROM action_links WHERE type = 'email' AND activated = 1 AND user_id = " + user.user_id, function(al){
                        if(al && al.length > 0){
                            userObject.activated = true
                            userObject.link = al[0].link
                        }
                        resolve()
                    })
                }))

                Promise.all(p).then(() => {
                    cachedUsers[user_id] = {
                        content: userObject,
                        timestamp: new Date().getTime()
                    }
                    resolve(userObject)
                }).catch((err) => {
                    reject(err)
                })
            } else {
                reject("User not found")
            }
        })
    })
}

function uncacheUser(user_id){
    cachedUsers[user_id] = undefined
}

module.exports = {
    deleteAccount: deleteAccount,
    getUserInfo: getUserInfo,
    checkURL: checkURL,
    uncacheUser: uncacheUser,
    blockAccount,
    checkPassword
}