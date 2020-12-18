const badTag = (sequelize, DataTypes) => {
    const BadTag = sequelize.define('badTag', {
    });

    return BadTag;
};

export default badTag;
