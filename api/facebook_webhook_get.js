module.exports = {
    exec: function(req, res){
      // Parse params from the webhook verification request
      let mode = req.query['hub.mode'];
      let token = req.query['hub.verify_token'];
      let challenge = req.query['hub.challenge'];
        
      // Check if a token and mode were sent
      if (mode && token) {
      
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === process.env.SECRET_KEY) {
          
          // Respond with 200 OK and challenge token from the request
          console.log('[FACEBOOK] Webhook verified');
          res.status(200).send(challenge);
        
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          res.sendStatus(403);      
        }
      }
    }
}