const movieGenreTable = (sequelize, DataTypes) => {
    const MovieGenreTable = sequelize.define('MovieGenreTable',
        {},
        { timestamps: false }
    );

        return MovieGenreTable;
};

export default movieGenreTable;
