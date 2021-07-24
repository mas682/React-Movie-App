const crypto = require('crypto');
const config = require('../../Config.json');


const hash = (text, type) => {
    let saltBytesCount = config.crypto[type].saltBytes;
    let hashAlg = config.crypto[type].hash;
    let outputBytes = config.crypto[type].outputBytes;
    let iterations = config.crypto[type].iterations;
    let saltBytes =  crypto.randomBytes(saltBytesCount);
    let salt = saltBytes.toString('base64');
    let hash = crypto.pbkdf2Sync(text, salt, iterations, outputBytes, hashAlg).toString("base64");
    return {salt: salt, value: hash};
}

const checkHashedValue = (text, type, salt) => {
    let hashAlg = config.crypto[type].hash;
    let outputBytes = config.crypto[type].outputBytes;
    let iterations = config.crypto[type].iterations;
    let hash = crypto.pbkdf2Sync(text, salt, iterations, outputBytes, hashAlg).toString("base64");
    return {salt: salt, value: hash};
}

// will have to verify IV not repeated
// will need to change key every X amount of entries
// will need IV to be unique in table
// if not unique, regenerate


// An encrypt function
function encrypt(text, type) {
    let algorithm = config.crypto[type].algorithm;
    let ivSize = config.crypto[type].ivSize;
    let key = config.crypto[type].key;
    let iv = crypto.randomBytes(ivSize);

    // Creating Cipheriv with its parameter
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'base64'), iv);

    // Updating text
    let encrypted = cipher.update(text);

    // Using concatenation
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Returning iv and encrypted data
    return { iv: iv.toString('base64'), encryptedData: encrypted.toString('base64')};
}

// A decrypt function
function decrypt(text, iv, type) {
    let algorithm = config.crypto[type].algorithm;
    let key = config.crypto[type].key;

    let bufferedIv = Buffer.from(iv, 'base64');
    let encryptedText = Buffer.from(text, 'base64');

    // Creating Decipher
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'base64'), bufferedIv);

     // Updating encrypted text
     let decrypted = decipher.update(encryptedText);
     decrypted = Buffer.concat([decrypted, decipher.final()]);

     // returns data after decryption
     return decrypted.toString();
}


export {hash, checkHashedValue, encrypt, decrypt};
