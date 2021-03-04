const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserVerificationQuestions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "UserVerificationsQuestions_userId_VerificationQuestionId"
    },
    VerificationQuestionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'VerificationQuestions',
        key: 'id'
      },
      unique: "UserVerificationsQuestions_userId_VerificationQuestionId"
    },
    answer: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'UserVerificationQuestions',
    schema: 'public',
    hasTrigger: true,
    timestamps: true,
    indexes: [
      {
        name: "UserVerificationQuestions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "UserVerificationsQuestions_userId_VerificationQuestionId",
        unique: true,
        fields: [
          { name: "userId" },
          { name: "VerificationQuestionId" },
        ]
      },
    ]
  });
};
