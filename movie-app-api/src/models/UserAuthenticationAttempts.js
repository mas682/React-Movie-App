const userAuthenticationAttempts = (sequelize, DataTypes) => { 
    const UserAuthenticationAttempts = sequelize.define('UserAuthenticationAttempts', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            primaryKey: true
        },
        verificationAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        passwordAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        verificationLocked: {
            type: DataTypes.DATE
        },
        passwordLocked: {
            type: DataTypes.DATE
        }
    }, 
    {
        sequelize,
        tableName: 'UserAuthenticationAttempts',
        schema: 'public',
        timestaps: true,
        indexes: [
            {
                name: "UserAuthenticationAttempts_pkey",
                unique: true,
                fields: [
                    { name: "userId" }
                ]
            },
        ]
    });

    UserAuthenticationAttempts.associate = models => {
        UserAuthenticationAttempts.belongsTo(models.Users, {as: "authenticationAttempts", onDelete: 'CASCADE', foreignKey: "userId"});
    }

    return UserAuthenticationAttempts;
};

export default userAuthenticationAttempts;