const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserSessions', {
    session: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: "UserSessions_session_userId_key"
    },
    iv: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: "UserSessions_iv_key"
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "UserSessions_session_userId_key"
    },
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'UserSessions',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "UserSessions_iv_key",
        unique: true,
        fields: [
          { name: "iv" },
        ]
      },
      {
        name: "UserSessions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UserSessions_session_key",
        unique: true,
        fields: [
          { name: "session" },
        ]
      },
      {
        name: "UserSessions_session_userId_key",
        unique: true,
        fields: [
          { name: "userId" },
          { name: "session" },
        ]
      },
    ]
  });
};
