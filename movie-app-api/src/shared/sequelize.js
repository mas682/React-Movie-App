const { Sequelize } = require('sequelize');
const config = require('../../Config.json');
let sequelize;

function createClient() {
    let host = (process.env.NODE_DOCKER == "true") ? "movie-api-database:5432/movie-app" : config.database.host;
    sequelize = new Sequelize(
        "postgres://" + config.database.username + ":" + config.database.password + "@" + host,
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
