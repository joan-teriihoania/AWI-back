/**
* Provide every functions required to interact with session tokens
* @module dao.session_tokens
* */

const db = require("../db");
const {getDbString, getParisTime} = require("../time");
const {generateAuthKey} = require("../crypto");

/**
 * Deletes any expired token
 */
setInterval(() => {
    db.run("DELETE FROM session_tokens WHERE expires_at < '"+getDbString(getParisTime())+"'", [])
        .then(() => {})
        .catch(console.error)
}, 10*1000)

/**
 * Check if a session token is valid
 * @param user_id
 * @param session_token
 * @returns {Promise<unknown>}
 */
function checkSessionToken(user_id, session_token){
    return new Promise((resolve, reject) => {
        db.select("SELECT * FROM session_tokens WHERE user_id = ? AND session_token = ?", [user_id, session_token], (session_tokens) => {
            if(session_tokens && session_tokens.length > 0){
                resolve(session_tokens[0])
            } else {
                reject("Session token not found")
            }
        })
    })
}

/**
 * Create a new session token
 * @param user_id
 * @returns {Promise<unknown>}
 */
function createSessionToken(user_id){
    return new Promise((resolve, reject) => {
        const token = {
            user_id: user_id,
            session_token: generateAuthKey(128),
            expires_at: getDbString(new Date(getParisTime().getTime() + 30*24*60*60*1000)) // default expiration time set to a month
        }

        db.insert("session_tokens", [token]).then(() => {
            resolve(token)
        }).catch(reject)
    })
}

module.exports = {
    createSessionToken,
    checkSessionToken
}
