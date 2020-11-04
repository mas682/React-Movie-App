import Sequelize from 'sequelize';

const sequelize = new Sequelize('postgres://postgres:password@localhost:5432/movie-app', {
    dialect: 'postgres',
    // shuts off logging
    logging: false
});

// get the models
const models = {
    User: sequelize.import('./user'),
    ReviewGoodTags: sequelize.import('./reviewGoodTags'),
    ReviewBadTags: sequelize.import('./reviewBadTags'),
    GoodTag: sequelize.import('./goodTag'),
    BadTag: sequelize.import('./badTag'),
    Review: sequelize.import('./review'),
    Comment: sequelize.import('./comments'),
    Like: sequelize.import('./likes'),
    UsersFriends: sequelize.import('./usersFriendsTable'),
    MovieGenreTable: sequelize.import('./MovieGenreTable'),
    Genre: sequelize.import('./genres'),
    Movies: sequelize.import('./movies'),
    UserWatchList: sequelize.import('./UserWatchList'),
    UsersWhoWatched: sequelize.import('./UsersWhoWatched')
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;
