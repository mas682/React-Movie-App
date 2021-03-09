const userVerificationCodes = (sequelize, DataTypes) => {
    const UserVerificationCodes = sequelize.define('UserVerificationCodes', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        expiresAt: {
          type: DataTypes.DATE
        },
        userEmail: {
          type: DataTypes.STRING(30),
          allowNull: false,
          //unique: "UserVerificationCodes_userEmail_key"
        },
        username: {
          type: DataTypes.STRING(20),
          allowNull: false,
          //unique: "UserVerificationCodes_username_key"
        },
        password: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(6),
            allowNull: false,
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
        }
      },
      {
        sequelize,
        tableName: 'UserVerificationCodes',
        schema: 'public',
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: "UserVerificationCodes_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
          /*{
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
          */
        ]
    });

    return UserVerificationCodes;
};

export default userVerificationCodes;
