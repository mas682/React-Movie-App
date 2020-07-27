

const review = (sequelize, DataTypes) => {
    const Review = sequelize.define('review', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        rating: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        review: {
            type: DataTypes.TEXT,
            allowNull: true,

        },
    });

    Review.associate = models => {
        Review.belongsTo(models.User);
        Review.belongsToMany(models.GoodTag, {through: models.ReviewGoodTags});
        Review.belongsToMany(models.BadTag, {through: models.ReviewBadTags});
        Review.hasMany(models.Comment);
    };

    Review.findFriendsReviews = async (models, ids) =>
    {
        // may need to eventually sort by time stamps if not doing it already
        let reviews = await Review.findAll({
            where: {
                userId: ids
            },
            // only get these attributes
            attributes: ["id", "title", "rating", "review", "updatedAt"],
            // include the following models with the specified attributes
            include:[
                {
                    model: models.GoodTag,
                    // included the id to make one less query needed to find tag
                    attributes:["id", "value"],
                    // do not include the association table
                    through: {attributes: []}
                },
                {
                    model: models.BadTag,
                    // included the id to make one less query needed to find tag
                    attributes: ["id", "value"],
                    through: {attributes: []}
                },
                {
                    model: models.Comment,
                    attributes: ["id", "value", "updatedAt"],
                    // for the comments, also include the following information about the user
                    include: [
                        {
                            model: models.User,
                            attributes: ["username", "email"]
                        }
                    ]
                }
            ]
        });
        return reviews;
    }

    // find reviews associated with a user
    Review.findById = async (models,id) => {
        let reviews = await Review.findAll({
            where: {
                userId: id
            },
            // only get these attributes
            attributes: ["id", "title", "rating", "review", "updatedAt"]
            // include the following models with the specified attributes
            , include:[
                {
                    model: models.GoodTag,
                    // included the id to make one less query needed to find tag
                    attributes:["id", "value"],
                    // do not include the association table
                    through: {attributes: []}
                },
                {
                    model: models.BadTag,
                    // included the id to make one less query needed to find tag
                    attributes: ["id", "value"],
                    through: {attributes: []}
                },
                {
                    model: models.Comment,
                    attributes: ["id", "value", "updatedAt"],
                    // for the comments, also include the following information about the user
                    include: [
                        {
                            model: models.User,
                            attributes: ["username", "email"]
                        }
                    ]
                }
            ]
        });
        return reviews;
    }

    return Review;
};

export default review;
