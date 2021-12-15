const db = require("../modules/db");
const { assign_groups } = require("../modules/load_icals");

module.exports = {
    exec: function(req, res){
        const group = req.params.group;
        db.select(`SELECT * FROM groups WHERE group_id = ?`, [group], function(g){
            if(g && g.length > 0){
                db.select(`SELECT * FROM user_groups WHERE user_id = ${res.user.user_id} AND group_id = ?`, [group], function(g){
                    if(g && g.length > 0){
                        db.run(`DELETE FROM user_groups WHERE user_id = ${res.user.user_id} AND group_id = ?`, [group]).then(() => {
                            res.status(200)
                            res.end()
                        }).catch((err) => {
                            res.status(500)
                            res.send(err)
                        })
                    } else {
                        res.status(409)
                        res.end()
                    }
                })
            } else {
                res.status(404)
                res.end()
            }
        })
    }
}