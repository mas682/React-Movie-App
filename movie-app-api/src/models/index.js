import Sequelize from 'sequelize';

const sequelize = new Sequelize('postgres://postgres:password@localhost:5432/movie-app', {
    dialect: 'postgres'
});

// get the models
const models = {
    User: sequelize.import('./user'),
    Review: sequelize.import('./review'),
    Review_GoodTags: sequelize.import('./reviewGoodTags'),
    GoodTag: sequelize.import('./goodTag'),
    BadTag: sequelize.import('./badTag'),
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;
