const Op = require('Sequelize').Op;
const movieTag = (sequelize, DataTypes) => {
    const MovieTag = sequelize.define('movieTag', {
        // create a username field
        value: {
            // set the data type to string
            type: DataTypes.STRING,
            // make the value be unique
            unique: true,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                // prevent empty strings
                notEmpty: true,
                // limit length to 1-20 characters
                len: [1,20]
            }
        },
        // may eventually want to keep track of the number of reviews that
        // have this tag?
    });

    // this will probably be changed to good/bad tags
    // associate bad tags with reviews
    // each tag can belong to many reviews
    MovieTag.associate = models => {
        //MovieTag.belongsToMany(models.Review, { as: "goodTags", through: models.ReviewGoodTags, onDelete: 'CASCADE' });
    //    MovieTag.hasMany(models.ReviewGoodTags, { foreignKey: { allowNull: false}, onDelete: 'CASCADE'});
        MovieTag.belongsToMany(models.Review, {as: "goodReviews", through: models.ReviewGoodTags, onDelete: 'CASCADE'});
        MovieTag.belongsToMany(models.Review, {as: "badReviews", through: models.ReviewBadTags, onDelete: 'CASCADE'});
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
                    model: models.Review,
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
                    model: models.Review,
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
                    model: models.Review,
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
                    model: models.Review,
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
        // find any exact matches first
        let tags = await MovieTag.findAll({
            limit: count,
            where: {
                value: value
            },
            order: [
                ['value', 'ASC']
            ]
        });
        // holds the tag id's that are already found
        let idArray = [];
        if(tags.length < count)
        {
            tags.forEach((tag) => {
                idArray.push(tag.id);
            });
            // set new temporary query limit
            let tempCount = count - tags.length;
            // get the tags that start with the value
            let tagStartsWith = await MovieTag.findAll({
                limit: tempCount,
                where: {
                  [Op.and]: [
                    {
                      value: {
                          [Op.iLike]: value + "%",
                      }
                    },
                    {
                      id: {
                        [Op.notIn]: idArray
                      }
                    }
                  ]
                },
                order: [
                  ['value', 'ASC'],
                ]
            });
            tags = tags.concat(tagStartsWith);
            // add the id's to ignore if another query needed
            if(tags.length < count)
            {
                tagStartsWith.forEach((tag) => {
                    idArray.push(tag.id);
                });
            }
        }
        // if more results still needed
        if(tags.length < count)
        {
            // set new temporary query limit
            let tempCount = count - tags.length;
            // get the tags that end with the value
            let tagEndsWith = await MovieTag.findAll({
                limit: tempCount,
                where: {
                    [Op.and]: [
                      {
                        value: {
                          [Op.iLike]: "%" + value
                        }
                      },
                      {
                        id: {
                          [Op.notIn]: idArray
                        }
                      }
                    ]
                },
                order: [
                  ['value', 'ASC'],
                ]
            });
            tags = tags.concat(tagEndsWith);
            // add the id's to ignore if another query needed
            if(tags.length < count)
            {
                tagEndsWith.forEach((tag) => {
                    idArray.push(tag.id);
                });
            }
        }
        // get any tags that contains the value last
        if(tags.length < count)
        {
            let tempCount = count - tags.length;
            let tagContains = await MovieTag.findAll({
                limit: tempCount,
                where: {
                    [Op.and]: [
                      {
                        value: {
                          [Op.iLike]: "%" + value + "%"
                        }
                      },
                      {
                        id: {
                          [Op.notIn]: idArray
                        }
                      }
                    ]
                },
                order: [
                  ['value', 'ASC'],
                ]
            });
            tags = tags.concat(tagContains);
        }
        return tags;
    };

    return MovieTag;
};

export default movieTag;
