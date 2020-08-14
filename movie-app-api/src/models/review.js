const Op = require('Sequelize').Op;
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
        Review.belongsTo(models.User, {as: "user"});
        Review.belongsToMany(models.GoodTag, {through: models.ReviewGoodTags});
        Review.belongsToMany(models.BadTag, {through: models.ReviewBadTags});
        Review.hasMany(models.Comment);
        Review.belongsToMany(models.User, {as:"likes", through: models.Like});
    };

    Review.findFriendsReviews = async (models, ids, requesterId) =>
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
                    as: "user",
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
                },
                {
                    model: models.User,
                    as: "likes",
                    required: false,
                    attributes: ["username"],
                    through: {attributes: []}
                }
            ]
        });

        // array to hold result
        let result = [];
        // loop through the reviews of the user
        for(let i = 0; i < reviews.length; i++)
        {
            // get the first review
            let tempReview = reviews[i];
            let liked = false;
            // query to see if requester liked post
            // will return a empty array if not
            let user = await tempReview.getLikes(
                {
                    where: {id: requesterId}
                }
            );
            if(user.length > 0)
            {
                liked = true;
            }
            result.push({review: tempReview, liked: liked});
        }

        return result;
    }


    // solution may be to just query likes for the specific user
    // have each like associate a count
    // find reviews associated with a user
    Review.findById = async (models,id, requesterId) => {
        let reviews = await Review.findAll({
            where: {
                userId: id
            },
            // only get these attributes
            // include the following models with the specified attributes
            include:[
                {
                    model: models.User,
                    as: "user",
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
                },
                {
                    model: models.User,
                    as: "likes",
                    attributes: ["username"],
                    through: {attributes: []}
                },
                {
                    model: models.User,
                    as: "likes",
                    attributes: ["username"],
                    required: false,
                    through: {attributes: []}
                }
            ]
        });

        // array to hold result
        let result = [];
        // loop through the reviews of the user
        for(let i = 0; i < reviews.length; i++)
        {
            // get the first review
            let tempReview = reviews[i];
            let liked = false;
            // query to see if requester liked post
            // will return a empty array if not
            let user = await tempReview.getLikes(
                {
                    where: {id: requesterId}
                }
            );
            if(user.length > 0)
            {
                liked = true;
            }
            result.push({review: tempReview, liked: liked});
        }

        return result;
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
                    as: "user",
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
