const movie = (sequelize, DataTypes) => {
    const Movie = sequelize.define('movie', {
        // create a username field
        id: {
            // set the data type to string
            type: DataTypes.INTEGER,
            // make the value be unique
            unique: true,
            // do not allow this to be empty
            allowNull: true,
            primaryKey: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
        title: {
            // set the data type to string
            type: DataTypes.STRING,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
        // probably eventually want to change this to the date type..
        releaseDate: {
            // set the data type to string
            type: DataTypes.STRING,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            },
        },
        overview: {
            // set the data type to string
            type: DataTypes.TEXT,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
        poster: {
            // set the data type to string
            type: DataTypes.STRING,
            // make the value be unique
            unique: true,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
    });

    Movie.associate = models => {
        // each movie can be associated with many reviews
        //Movie.hasMany(models.Review);
    }

    return Movie;
};

export default movie;
