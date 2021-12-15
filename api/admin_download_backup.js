const db = require("../modules/db");
const { cancelScheduledMaintenance, getScheduledMaintenance, executeScheduledMaintenance } = require("../modules/git");
const { assign_groups } = require("../modules/load_icals");
const { deleteAccount } = require("../modules/users");

module.exports = {
    exec: function(req, res){
        db.getBackups((backups) => {
            if(backups.map(b => b.filename).includes(decodeURIComponent(req.params.filename))){
                res.download(".data/" + decodeURIComponent(req.params.filename))
            } else {
                res.status(404)
                res.end()
            }
        })
    }
}