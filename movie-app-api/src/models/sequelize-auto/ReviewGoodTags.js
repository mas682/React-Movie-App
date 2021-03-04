const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ReviewGoodTags', {
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
    tableName: 'ReviewGoodTags',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "ReviewGoodTags_pkey",
        unique: true,
        fields: [
          { name: "reviewId" },
          { name: "movieTagId" },
        ]
      },
    ]
  });
};
