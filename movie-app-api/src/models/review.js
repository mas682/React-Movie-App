const Op = require('Sequelize').Op;
let moment = require('moment');
const review = (sequelize, DataTypes) => {
    const Review = sequelize.define('review', {
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
        // each review is associated with a movie
        Review.belongsTo(models.Movies, {as: "movie"});
        // each review is associated with a user
        Review.belongsTo(models.User, {as: "user"});
        // each review can have many good tags
        Review.belongsToMany(models.GoodTag, {through: models.ReviewGoodTags});
        // each review can have many bad tags
        Review.belongsToMany(models.BadTag, {through: models.ReviewBadTags});
        // each review can have many comments
        Review.hasMany(models.Comment);
        // each review can have many likes
        Review.belongsToMany(models.User, {as:"likes", through: models.Like});
        // each review beelongs to a movie
        // Review.belongsTo(models.Movie, {as: "movie"});
    };

    // function to get reviews for a set of users
    // can also be used to get a individual users reviews if passed a single id
    // this also checks to see if the reviews that are returned are
    // also liked by the requester
    Review.findByIds = async (models, ids, requesterId) =>
    {
        let includeArray = [
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

                model: models.User,
                as: "likes",
                required: false,
                attributes: [
                    // count the number of user id's found in each record and return it as
                    // the attirube liked
                    [sequelize.fn("COUNT", sequelize.col("user.id")), "liked"]
                ],
                through: {attributes: []},
                seperate: true
            },
            {
                    model: models.Movies,
                    as: "movie",
                    attributes: ["title", "id", "poster"],
            }

        ];
        let groupByArray = ["review.id", "user.username", "user.id", "goodTags.id",
            "badTags.id", "likes.id", "movie.title", "movie.id", "movie.poster"];
        // may need to eventually sort by time stamps if not doing it already
        let reviews = await Review.findAll({
            where: {
                userId: ids
            },
            order: [["updatedAt", 'DESC']],
            // only get these attributes
            attributes: ["id", "rating", "review", "updatedAt", "createdAt"],
            // include the following models with the specified attributes
            include:includeArray,
            group: groupByArray
        });

        // this will be really slow so will need fixed at some point
        // array to hold result
        let result = [];
        // loop through the reviews of the user
        for(let i = 0; i < reviews.length; i++)
        {
            // get the first review
            let tempReview = reviews[i];
            let liked = false;
            // if undefined, user looking at posts not logged in
            if(requesterId !== undefined)
            {
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
            }
            result.push({review: tempReview, liked: liked});
        }

        return result;
    }

    // find a review based off its id
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
                    model: models.Movies,
                    as: "movie",
                    //attributes: ["title", "id", "poster"]
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
                    seperate: true,
                    order: [["updatedAt", 'ASC']],
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

    // function to get a review and include a specific user who liked it
    Review.getReviewWithLikedUser = async (reviewId, userId, models) =>
    {
        return models.Review.findOne({
            where: {id: reviewId},
            include: [
                {
                    model: models.User,
                    as: "likes",
                    where: {id: userId},
                    required: false
                }
            ]
        });
    };

    // function to get a review to add/update a comment to it
    // for now, simply returns a review
    // eventually, if the user who posted the reviews profile is not public,
    // check to see if the userId follows them when getting the review
    Review.getReviewForComment = async(reviewId, userId, commentId, models) =>
    {
        return models.Review.findOne({
            where: {id: reviewId},
            include: []
        });
    }

    // function to return a review and the user who created it
    Review.getReviewWithCreator = async(reviewId, models) =>
    {
        return models.Review.findOne({
            where: {id: reviewId},
            include: [{
                model: models.User,
                as: "user",
                attributes: ["username", "id"]
            }]
        });
    };

    // function to get the users who liked a reveiw
    Review.getLikes = async (reviewId, userId, models) => {
        let review = await Review.findOne({where: {id: reviewId}});
        if(review === null)
        {
            return null;
        }
        let usersWhoLiked = await review.getLikes({
            attributes: ["username"],
            include: [
                {
                    model: models.User,
                    as: "Followers",
                    attributes:["username"],
                    where: {id: userId},
                    required: false
                }
            ]
        });
        return usersWhoLiked;
    };

    // function to return all users from a list of users who liked a post that
    // the requesting user follows
    // reviewId is the id of the review whose likes are being checked
    // userId is the user id of the requesting user
    Review.getFollowingFromLikes = async (reviewId, userId, models) => {
        // get the review
        let review = await Review.findAll({where: {id: reviewId}});
        if(review === null)
        {
            return null;
        }
        // get the users who liked the post that have the requester as a follower
        let followedUsers = await review[0].getLikes({
            include:[
                {
                    model: models.User,
                    as: "Followers",
                    where: {id: userId}
                }
            ]
        });
        return followedUsers;
    };

    // function to return all users from a list of users who liked a post that
    // the requesting user does not follow
    // reviewId is the id of the review whose likes are being checked
    // userId is the user id of the requesting user
    // ids is an array of user id's whom the requesting user already follows
    // this should be called after the getFollowingFromLikes function is called
    Review.getNotFollowingFromLikes = async (reviewId, userId, ids, models) => {
        let review = await Review.findAll({where: {id: reviewId}});
        if(review === null)
        {
            return null;
        }
        // get the users who liked the post that do not have requester as a follower
        let notFollowedUsers = await review[0].getLikes({
                where: {id:{[Op.notIn]:ids}},
                include:[
                    {
                        model: models.User,
                        as: "Followers",
                    }
                ]
        });
        return notFollowedUsers;
    };


    return Review;
};

export default review;
