const movieGenreTable = (sequelize, DataTypes) => {
    const MovieGenreTable = sequelize.define('MovieGenreTable',{
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
        tableName: 'MovieGenreTables',
        schema: 'public',
        timestamps: false,
        indexes: [
          {
            name: "MovieGenreTables_pkey",
            unique: true,
            fields: [
              { name: "GenreId" },
              { name: "movieId" },
            ]
          },
        ]
    });

    MovieGenreTable.associate = models => {
        MovieGenreTable.belongsTo(models.Genre, {foreignKey: "GenreId"});
        MovieGenreTable.belongsTo(models.Movies, {foreignKey: "movieId"});
    };


        return MovieGenreTable;
};

export default movieGenreTable;
