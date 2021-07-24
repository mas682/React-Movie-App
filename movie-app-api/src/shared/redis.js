const redis = require('redis');
let redisClient;


function createClient() {
    // will eventually have to pass some connection parameters here...
    redisClient = redis.createClient();
    return redisClient;
}

function getClient() {
    return redisClient;
}


module.exports.createClient = createClient;
module.exports.getClient = getClient;
