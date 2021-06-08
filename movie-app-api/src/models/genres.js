const genre = (sequelize, DataTypes) => {
    const Genre = sequelize.define('Genre', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        value: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: "Genres_value_key"
        }
      }, {
        sequelize,
        tableName: 'Genres',
        schema: 'public',
        hasTrigger: true,
        timestamps: true,
        indexes: [
          {
            name: "Genres_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
          {
            name: "Genres_value_key",
            unique: true,
            fields: [
              { name: "value" },
            ]
          },
        ]
    });

    // associate genres with movies
    // each genre can belong to many movies
    Genre.associate = models => {
        Genre.belongsToMany(models.Movies, {through: models.MovieGenreTable, foreignKey: "GenreId", otherKey: "movieId" });
    };

    return Genre;
};

export default genre;
