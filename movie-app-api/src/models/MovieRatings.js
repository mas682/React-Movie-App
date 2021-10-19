

const movieRatings = (sequelize, DataTypes) => {
    const MovieRatings = sequelize.define('MovieRatings',{
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true
        },
        movieId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'movies',
                key: 'id'
            }
        },
        userRating: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
            default: 0.0
        },
        totalUserRatings: {
            type: DataTypes.BIGINT,
            allowNull: false,
            default: 0
        }
    }, {
        sequelize,
        tableName: 'MovieRatings',
        schema: 'public',
        hasTrigger: true,
        timestamps: true
    });

    MovieRatings.associate = models => {
        MovieRatings.belongsTo(models.Movies, {as: "rating", foreignKey: "movieId"});
    };

    return MovieRatings;
}

export default movieRatings;