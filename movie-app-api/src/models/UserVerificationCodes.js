const userVerificationCodes = (sequelize, DataTypes) => {
    const UserVerificationCodes = sequelize.define('UserVerificationCodes', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        userEmail: {
          type: DataTypes.STRING(30),
          allowNull: false,
          unique: "UserVerificationCodes_userEmail_key"
        },
        username: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: "UserVerificationCodes_username_key"
        },
        code: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      {
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
            name: "UserVerificationCodes_userEmail_key",
            unique: true,
            fields: [
              { name: "userEmail" },
            ]
          },
          {
            name: "UserVerificationCodes_username_key",
            unique: true,
            fields: [
              { name: "username" },
            ]
          },
        ]
    });

    return UserVerificationCodes;
};

export default userVerificationCodes;
