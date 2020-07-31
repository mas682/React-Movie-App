
let moment = require('moment');
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
        createdAt: {
            // this is done to format the date on return
            type: DataTypes.DATE,
            get() {
                let hour = this.getDataValue('createdAt').getHours();
                let amPm = "AM";
                if(hour >= 12)
                {
                    amPm = "PM";
                }
                return moment(this.getDataValue('createdAt')).format('MMMM DD, YYYY h:mm ') + amPm;
            }
        },
        updatedAt: {
            // this is done to format the date on return
            type: DataTypes.DATE,
            get() {
                let hour = this.getDataValue('updatedAt').getHours();
                let amPm = "AM";
                if(hour >= 12)
                {
                    amPm = "PM";
                }
                return moment(this.getDataValue('updatedAt')).format('MMMM DD, YYYY h:mm ') + amPm;
            }
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
            order: [["updatedAt", 'DESC']],
            // only get these attributes
            attributes: ["id", "title", "rating", "review", "updatedAt", "createdAt"],
            // include the following models with the specified attributes
            include:[
                {
                    model: models.User,
                    attributes: ["username", "id"]
                },
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
            // include the following models with the specified attributes
            include:[
                {
                    model: models.User,
                    attributes: ["username", "id"]
                },
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
    Review.findByReviewId = async (models,reviewId) => {
        let reviews = await Review.findAll({
            where: {
                id: reviewId
            },
            // only get these attributes
            // include the following models with the specified attributes
            include:[
                {
                    model: models.User,
                    attributes: ["username", "id"]
                },
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
