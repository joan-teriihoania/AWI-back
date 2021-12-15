const crypto = require('crypto');
const { execSync } = require('child_process');
const { gitUpdate, scheduleUpdate } = require('../modules/git');

module.exports = {
    exec: function(req, res){
        const hmac = crypto.createHmac('sha1', process.env.SECRET_KEY);
        const sig  = 'sha1=' + hmac.update(JSON.stringify(req.body)).digest('hex');
        if (req.headers['x-github-event'] === 'push' &&
            crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(req.headers['x-hub-signature']))) {
            res.sendStatus(200);

            scheduleUpdate()

            return;
        } else {
          console.log('[GIT] Webhook signature incorrect!');
          return res.sendStatus(403);
        }
    }
}