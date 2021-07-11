const Op = require('Sequelize').Op;
const movieTag = (sequelize, DataTypes) => {
    const MovieTag = sequelize.define('movieTag', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        value: {
          type: DataTypes.STRING(20),
          allowNull: true,
          unique: "movieTags_value_key"
        }
      }, {
        sequelize,
        tableName: 'MovieTags',
        schema: 'public',
        timestamps: true,
        indexes: [
          {
            name: "movieTags_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
          {
            name: "movieTags_value_key",
            unique: true,
            fields: [
              { name: "value" },
            ]
          },
        ]
      });

    // this will probably be changed to good/bad tags
    // associate bad tags with reviews
    // each tag can belong to many reviews
    MovieTag.associate = models => {
        MovieTag.belongsToMany(models.Reviews, {as: "goodReviews", through: models.ReviewGoodTags, foreignKey: "movieTagId", otherKey: "reviewId", onDelete: 'CASCADE'});
        MovieTag.belongsToMany(models.Reviews, {as: "badReviews", through: models.ReviewBadTags, foreignKey: "movieTagId", otherKey: "reviewId",  onDelete: 'CASCADE'});
    };

    // function to find a tag or create one and include a review with it
    MovieTag.findOrCreateByValue = async (models, tag, reviewId, type) =>
    {
        let result;
        if(type === "good")
        {
            result = await MovieTag.findOrCreate({
                where: {value: tag},
                include: {
                    model: models.Reviews,
                    as: "goodReviews",
                    where: {id: reviewId},
                    required: false
                }
            })
        }
        else
        {
            result = await MovieTag.findOrCreate({
                where: {value: tag},
                include: {
                    model: models.Reviews,
                    as: "badReviews",
                    where: {id: reviewId},
                    required: false
                }
            });
        }
        return result;
    };

    // function to find a tag or create one and include a review with it
    MovieTag.findOrCreateById = async (models, tag, reviewId, type) =>
    {
        let result;
        if(type === "good")
        {
            result = await MovieTag.findOrCreate({
                where: {id: tag.id},
                defaults: {value: tag.value},
                include: {
                    model: models.Reviews,
                    as: "goodReviews",
                    where: {id: reviewId},
                    required: false
                }
            })
        }
        else
        {
            result = await MovieTag.findOrCreate({
                where: {id: tag.id},
                defaults: {value: tag.value},
                include: {
                    model: models.Reviews,
                    as: "badReviews",
                    where: {id: reviewId},
                    required: false
                }
            });
        }
        return result;
    };

    MovieTag.findByValue = async (models, value, count) =>
    {
        let endsWith = "%" + value;
        let contains = "%" + value + "%";
        let startsWith = value + "%";
        let tags = await MovieTag.findAll({
            limit: count,
            where: {
                value: {
                    [Op.or]: [value, {[Op.iLike]: startsWith}, {[Op.iLike]: contains}, {[Op.iLike]: endsWith}]
                }
            },
            attributes: ["id", "value"],
            order: [
                sequelize.literal(`CASE
                    WHEN upper("movieTag"."value") = upper('${value}') then 0
                    ELSE 1
                    END ASC`),
                ['value', 'ASC']
            ]
        });
        return tags;
    };

    return MovieTag;
};

export default movieTag;
