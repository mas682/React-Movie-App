const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserVerificationCodes', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      //allowNull: false
    },
    userEmail: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    verificationAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    codesResent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(44),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salt: {
      type: DataTypes.STRING(44),
      allowNull: false,
      unique: "UserVerificationCodes_salt_key"
    }
  }, {
    sequelize,
    tableName: 'UserVerificationCodes',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "UserVerificationCodes_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UserVerificationCodes_salt_key",
        unique: true,
        fields: [
          { name: "salt" },
        ]
      },
    ]
  });
};
