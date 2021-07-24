let connectRedis;
let redisStore;


function createConnectRedis(session) {
    connectRedis = require('connect-redis')(session);
}


function createStore(session, redisClient) {
    createConnectRedis(session);
    // will eventually have to pass some connection parameters here...
    redisStore = new connectRedis({ client: redisClient ,ttl: 86400});
    return redisStore;
}

function getStore() {
    return redisStore;
}


module.exports.createStore = createStore;
module.exports.getStore = getStore;
