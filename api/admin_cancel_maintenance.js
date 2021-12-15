const db = require("../modules/db");
const { cancelScheduledMaintenance } = require("../modules/git");
const { assign_groups } = require("../modules/load_icals");
const { deleteAccount } = require("../modules/users");

module.exports = {
    exec: function(req, res){
        cancelScheduledMaintenance(req.params.scheduled_maintenance_id, (err) => {
            if(err){
                res.status(500)
                res.end()
            } else {
                res.status(200)
                res.end()
            }
        })
    }
}