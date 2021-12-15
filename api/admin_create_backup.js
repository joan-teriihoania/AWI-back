const { restore, backup } = require("../modules/db");
const db = require("../modules/db");
const { cancelScheduledMaintenance } = require("../modules/git");
const { assign_groups } = require("../modules/load_icals");
const { deleteAccount } = require("../modules/users");

module.exports = {
    exec: function(req, res){
        backup()
        res.status(200)
        res.end()
    }
}