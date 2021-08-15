const redis = require('redis');
let redisClient;


function createClient() {
    let host = (process.env.NODE_DOCKER == "true") ? "redis-container" : "localhost";
    // will eventually have to pass some connection parameters here...
    redisClient = redis.createClient({
        host: host,
        port: 6379
    });
    return redisClient;
}

function getClient() {
    return redisClient;
}


module.exports.createClient = createClient;
module.exports.getClient = getClient;
