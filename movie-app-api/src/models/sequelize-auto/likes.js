const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('likes', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
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
    }
  }, {
    sequelize,
    tableName: 'likes',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "likes_pkey",
        unique: true,
        fields: [
          { name: "userId" },
          { name: "reviewId" },
        ]
      },
    ]
  });
};
