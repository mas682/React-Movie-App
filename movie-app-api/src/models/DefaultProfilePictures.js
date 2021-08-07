const defaultProfilePictures = (sequelize, DataTypes) => {
    const DefaultProfilePictures = sequelize.define('DefaultProfilePictures', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        filename: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: "DefaultProfilePictures_filename_key"
        },
        source: {
          type: DataTypes.STRING(255),
          allowNull: false
        }

      }, {
        sequelize,
        tableName: 'DefaultProfilePictures',
        schema: 'public',
        hasTrigger: true,
        timestamps: true,
        indexes: [
          {
            name: "DefaultProfilePictures_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
          {
            name: "DefaultProfilePictures_filename_key",
            unique: true,
            fields: [
              { name: "filename" },
            ]
          }
        ]
    });

    // associate genres with movies
    // each genre can belong to many movies
    DefaultProfilePictures.associate = models => {};

    return DefaultProfilePictures;
};

export default defaultProfilePictures;
