const db = require('../modules/db');

module.exports = {
    exec: function(req, res, api_info){
        if(res.user.auth_method == "app_auth"){
            let u = {}
            if(res.user.token.scopes.includes("profile.public")){
                u = {
                    user_id: res.user.user_id,
                    username: res.user.username,
                    link: res.user.link
                }
            }
            
            if(res.user.token.scopes.includes("profile.private")){
                u = {
                    user_id: res.user.user_id,
                    username: res.user.username,
                    link: res.user.link,
                    img_profile: res.user.img_profile,
                    ical: res.user.ical
                }
            }

            res.status(200)
            res.send(u)
        } else {
            res.status(200)
            res.send(res.user)
        }
    }
}