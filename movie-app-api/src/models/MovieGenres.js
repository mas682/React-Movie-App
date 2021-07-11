const movieGenres = (sequelize, DataTypes) => {
    const MovieGenres = sequelize.define('MovieGenres',{
        GenreId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'Genres',
            key: 'id'
          }
        },
        movieId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'movies',
            key: 'id'
          }
        }
      }, {
        sequelize,
        tableName: 'MovieGenres',
        schema: 'public',
        timestamps: false,
        indexes: [
          {
            name: "MovieGenres_pkey",
            unique: true,
            fields: [
              { name: "GenreId" },
              { name: "movieId" },
            ]
          },
        ]
    });

    MovieGenres.associate = models => {
        MovieGenres.belongsTo(models.Genres, {foreignKey: "GenreId"});
        MovieGenres.belongsTo(models.Movies, {foreignKey: "movieId"});
    };


        return MovieGenres;
};

export default movieGenres;
