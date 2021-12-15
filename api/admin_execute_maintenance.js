const db = require("../modules/db");
const { cancelScheduledMaintenance, getScheduledMaintenance, executeScheduledMaintenance } = require("../modules/git");
const { assign_groups } = require("../modules/load_icals");
const { deleteAccount } = require("../modules/users");

module.exports = {
    exec: function(req, res){
        getScheduledMaintenance(req.params.scheduled_maintenance_id, function(maintenance){
            if(!maintenance.ongoing && !maintenance.completed){
                executeScheduledMaintenance(maintenance)
                res.status(200)
                res.end()
            } else {
                res.status(403)
                res.end()
            }
        })
    }
}