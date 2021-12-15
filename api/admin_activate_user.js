const db = require("../modules/db")

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM action_links WHERE type = 'email' AND user_id = ?", [req.params.user_id], function(al){
            if(al && al.length > 0){
                if(al[0].activated) {
                    res.status(409)
                    res.end()
                } else {
                    db.run("UPDATE action_links SET activated = 1 WHERE type = 'email' AND user_id = ?", [req.params.user_id]).then(() => {
                        res.status(200)
                        res.end()
                    })
                }
            } else {
                res.status(400)
                res.end()
            }
        })
    }
}