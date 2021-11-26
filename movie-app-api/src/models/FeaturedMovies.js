const appendCallerStack = require("../../routes/errorHandler.js").appendCallerStack;

const featuredMovies = (sequelize, DataTypes) => {
    const FeaturedMovies = sequelize.define('FeaturedMovies', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        movieId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'movies',
            key: 'id'
          }
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 0
        }
      }, {
        sequelize,
        tableName: 'FeaturedMovies',
        schema: 'public',
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: "FeaturedMovies_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          }
        ]
    });

    FeaturedMovies.associate = models => {
        // each FeaturedMovie is associated with a movie
        FeaturedMovies.belongsTo(models.Movies, {as: "FeaturedMovie", foreignKey: "movieId", onDelete: 'CASCADE'});
    };

    FeaturedMovies.getMovies = async (models) =>
    {
        let featuredMovies = await FeaturedMovies.findAll({
            include: [{
                model: models.Movies,
                as: "FeaturedMovie"
            }],
            order:[['order', 'ASC']]
        }).catch(error=>{
            let callerStack = new Error().stack;
            appendCallerStack(callerStack, error, undefined, true);
        });
        let movies = [];
        featuredMovies.forEach((movie) =>{
            movies.push(movie.FeaturedMovie);
        });
        return movies;
    };

    return FeaturedMovies;
};

export default featuredMovies;
