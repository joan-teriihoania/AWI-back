const { encrypt } = require('../modules/crypto');
const db = require('../modules/db');

module.exports = {
    exec: function(req, res){
        db.select("SELECT * FROM notifications WHERE user_id = " + res.user.user_id, function(rows){
            res.status(200)
            if(rows && rows.length > 0){
                res.send(rows)
                res.end()
            } else {
                res.send([])
            }
        })
    }
}