

const genre = (sequelize, DataTypes) => {
    const Genre = sequelize.define('Genre', {
        value: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
    });

    // associate genres with movies
    // each genre can belong to many movies
    Genre.associate = models => {
        Genre.belongsToMany(models.Movies, {through: models.MovieGenreTable});
    };

    return Genre;
};

export default genre;
