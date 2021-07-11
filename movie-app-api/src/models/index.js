import Sequelize from 'sequelize';
const config = require('../../Config.json');

const sequelize = new Sequelize("postgres://" + config.database.username + ":" + config.database.password + "@" + config.database.host, {
    dialect: 'postgres',
    // shuts off logging
    logging: false
});

// get the models
const models = {
    Users: sequelize.import('./Users'),
    Reviews: sequelize.import('./review'),
    Comments: sequelize.import('./Comments'),
    Likes: sequelize.import('./Likes'),
    UsersFriends: sequelize.import('./usersFriendsTable'),
    MovieGenres: sequelize.import('./MovieGenres'),
    Genres: sequelize.import('./Genres'),
    Movies: sequelize.import('./Movies'),
    UserWatchLists: sequelize.import('./UserWatchLists'),
    UsersWatchedMovies: sequelize.import('./UsersWatchedMovies'),
    MovieTags: sequelize.import('./MovieTags'),
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
