const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ReviewBadTags', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'reviews',
        key: 'id'
      }
    },
    movieTagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'movieTags',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'ReviewBadTags',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "ReviewBadTags_pkey",
        unique: true,
        fields: [
          { name: "reviewId" },
          { name: "movieTagId" },
        ]
      },
    ]
  });
};
