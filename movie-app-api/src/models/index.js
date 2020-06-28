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
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;
