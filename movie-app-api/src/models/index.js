//import Sequelize from 'sequelize';
const config = require('../../Config.json');
const sequelize = require('../shared/sequelize.js').getClient();

// get the models
const models = {
    Users: sequelize.import('./Users'),
    Reviews: sequelize.import('./Review'),
    Comments: sequelize.import('./Comments'),
    Likes: sequelize.import('./Likes'),
    UsersFriends: sequelize.import('./UsersFriendsTable'),
    MovieGenres: sequelize.import('./MovieGenres'),
    Genres: sequelize.import('./Genres'),
    Movies: sequelize.import('./Movies'),
    UserWatchLists: sequelize.import('./UserWatchLists'),
    UsersWatchedMovies: sequelize.import('./UsersWatchedMovies'),
    MovieTags: sequelize.import('./MovieTags'),
    ReviewGoodTags: sequelize.import('./ReviewGoodTags'),
    ReviewBadTags: sequelize.import('./ReviewBadTags'),
    UserVerificationCodes: sequelize.import('./UserVerificationCodes'),
    TempVerificationCodes: sequelize.import('./TempVerificationCodes'),
    FeaturedMovies: sequelize.import('./FeaturedMovies'),
    UserSessions: sequelize.import('./UserSessions'),
    DefaultProfilePictures: sequelize.import('./DefaultProfilePictures')
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

module.exports.models = models;
