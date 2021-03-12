const tempVerificationCodes = (sequelize, DataTypes) => {
    const UserVerificationCodes = sequelize.define('TempVerificationCodes', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            },
            unique: "TempVerificationCodes_userId_key"
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
        },
        expiresAt: {
          type: DataTypes.DATE
        }
      },
      {
        sequelize,
        tableName: 'TempVerificationCodes',
        schema: 'public',
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: "TempVerificationCodes_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
        ]
    });

    return TempVerificationCodes;
};

export default tempVerificationCodes;
