const { Sequelize } = require('sequelize');
const config = require('../Config.json');
let sequelize;

function createClient() {
    sequelize = new Sequelize(
        "postgres://" + config.database.username + ":" + config.database.password + "@" + config.database.host,
         {
            dialect: 'postgres',
            // shuts off logging
            logging: false
        }
    );
    return sequelize;
}


function getClient() {
    return sequelize;
}


module.exports.createClient = createClient;
module.exports.getClient = getClient;
