const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, process.env.SECRET_KEY, iv);
    
    try {
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return {
            iv: iv.toString('hex'),
            content: encrypted.toString('hex')
        };
    } catch (ex) {
        return
    }
};

const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, process.env.SECRET_KEY, (Buffer.from(hash.iv, 'hex')));

    try {
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
        return decrpyted.toString();
    } catch (ex) {
        return ""
    }
};

function getHash(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


function generateAuthKey(length, characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    var result           = '';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    encrypt,
    decrypt,
    getHash,
    generateAuthKey
};