const db = require("../modules/db");
const { cancelScheduledMaintenance, getScheduledMaintenance, deleteScheduledMaintenance } = require("../modules/git");
const { assign_groups } = require("../modules/load_icals");
const { deleteAccount } = require("../modules/users");

module.exports = {
    exec: function(req, res){
        getScheduledMaintenance(req.params.scheduled_maintenance_id, (maintenance) => {
            deleteScheduledMaintenance(maintenance, (err) => {
                if(err){
                    res.status(500)
                    res.send(err)
                } else {
                    res.status(200)
                    res.end()
                }
            })
        })
    }
}