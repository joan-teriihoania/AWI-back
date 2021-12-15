const db = require("../modules/db");
const { assign_groups } = require("../modules/load_icals");
const logger = require("../modules/logger");
const { deleteAccount } = require("../modules/users");

module.exports = {
    exec: function(req, res){
        logger.clearLogs()
        res.status(200)
        res.end()
    }
}