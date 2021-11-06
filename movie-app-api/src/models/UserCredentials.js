const userCredentials = (sequelize, DataTypes) => { 
    const UserCredentials = sequelize.define('UserCredentials', {
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
        password: {
            type: DataTypes.STRING(44),
            allowNull: false
        },
        salt: {
            type: DataTypes.STRING(44),
            allowNull: false
        }
    }, 
    {
        sequelize,
        tableName: 'UserCredentials',
        schema: 'public',
        timestaps: true,
        indexes: [
            {
                name: "UserCredentials_pkey",
                unique: true,
                fields: [
                    { name: "userId" }
                ]
            },
            {
                name: "UserCredentials_salt_key",
                unique: true,
                fields: [
                  { name: "salt" },
                ]
              },
        ]
    });

    UserCredentials.associate = models => {
        UserCredentials.belongsTo(models.Users, {as: "credentials", onDelete: 'CASCADE', foreignKey: "userId"});
    }

    return UserCredentials;
};

export default userCredentials;