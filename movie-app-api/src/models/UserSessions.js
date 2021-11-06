

const userSessions = (sequelize, DataTypes) => { 
  const UserSessions = sequelize.define('UserSessions', {
    session: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: "UserSessions_session_userId_key"
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

  UserSessions.associate = models => {
      UserSessions.belongsTo(models.Users, {as: "user", onDelete: 'CASCADE', foreignKey: "userId"});
  };

  return UserSessions;
};

export default userSessions;
