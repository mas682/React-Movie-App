import Sequelize from 'sequelize';
const config = require('../../Config.json');

const sequelize = new Sequelize("postgres://" + config.database.username + ":" + config.database.password + "@" + config.database.host, {
    dialect: 'postgres',
    // shuts off logging
    logging: false
});

// get the models
const models = {
    User: sequelize.import('./user'),
    Review: sequelize.import('./review'),
    Comment: sequelize.import('./comments'),
    Like: sequelize.import('./likes'),
    UsersFriends: sequelize.import('./usersFriendsTable'),
    MovieGenreTable: sequelize.import('./MovieGenreTable'),
    Genre: sequelize.import('./genres'),
    Movies: sequelize.import('./movies'),
    UserWatchList: sequelize.import('./UserWatchList'),
    UsersWhoWatched: sequelize.import('./UsersWhoWatched'),
    MovieTag: sequelize.import('./movieTags'),
    ReviewGoodTags: sequelize.import('./reviewGoodTags'),
    ReviewBadTags: sequelize.import('./reviewBadTags'),
    UserVerificationCodes: sequelize.import('./UserVerificationCodes'),
    TempVerificationCodes: sequelize.import('./TempVerificationCodes'),
    FeaturedMovies: sequelize.import('./FeaturedMovies'),
    UserSessions: sequelize.import('./UserSessions')
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;
