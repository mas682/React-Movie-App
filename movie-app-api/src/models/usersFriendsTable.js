const usersFriends = (sequelize, DataTypes) => {
    const UsersFriends= sequelize.define('UsersFriends', {
    },
    );
    return UsersFriends;
};

export default usersFriends;
