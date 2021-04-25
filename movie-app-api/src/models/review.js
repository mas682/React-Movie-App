const Op = require('Sequelize').Op;
let moment = require('moment');
const review = (sequelize, DataTypes) => {
    const Review = sequelize.define('review', {
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        rating: {
          type: DataTypes.DECIMAL,
          allowNull: false
        },
        review: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          unique: "reviews_userId_movieId_key"
        },
        movieId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'movies',
            key: 'id'
          },
          unique: "reviews_userId_movieId_key"
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
      }, {
        sequelize,
        tableName: 'reviews',
        schema: 'public',
        hasTrigger: true,
        timestamps: true,
        indexes: [
          {
            name: "reviews_pkey",
            unique: true,
            fields: [
              { name: "id" },
            ]
          },
          {
            name: "reviews_userId_movieId_key",
            unique: true,
            fields: [
              { name: "userId" },
              { name: "movieId" },
            ]
          },
        ]
    });

    Review.associate = models => {
        // each review is associated with a movie
        Review.belongsTo(models.Movies, {as: "movie", foreignKey: "movieId", onDelete: 'CASCADE'});
        // each review is associated with a user
        Review.belongsTo(models.User, {as: "user", onDelete: 'CASCADE', foreignKey: "userId"});
        // each review can have many comments
        Review.hasMany(models.Comment, {foreignKey: "reviewId"});
        // each review can have many likes
        Review.belongsToMany(models.User, {as:"likes", through: models.Like, foreignKey: "reviewId", otherKey: "userId", onDelete: 'CASCADE'});
        // each review can have many good tags
        Review.belongsToMany(models.MovieTag, {as: "goodTags", through: models.ReviewGoodTags, foreignKey: "reviewId", otherKey: "movieTagId", onDelete: 'CASCADE'});
        Review.belongsToMany(models.MovieTag, {as: "badTags", through: models.ReviewBadTags, foreignKey: "reviewId", otherKey: "movieTagId", onDelete: 'CASCADE'});
        Review.hasMany(models.ReviewBadTags, {as: "reviewBadTags", foreignKey: "reviewId"});
        Review.hasMany(models.ReviewGoodTags, {as: "reviewGoodTags", foreignKey: "reviewId"});
        Review.hasMany(models.Like, {as: "reviewLikes",foreignKey: "reviewId"});
    };

    // function to get reviews for a set of users
    // can also be used to get a individual users reviews if passed a single id
    // this also checks to see if the reviews that are returned are
    // also liked by the requester
    Review.findByIds = async (models, ids, requesterId, max, offset) =>
    {
        let includeArray = [
            {
                model: models.User,
                as: "user",
                attributes: ["username", "id", "picture"],
                duplicating: false
            },
            {
                model: models.MovieTag,
                as: "goodTags",
                // included the id to make one less query needed to find tag
                attributes:["id", "value"],
                // do not include the association table
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.MovieTag,
                as: "badTags",
                // included the id to make one less query needed to find tag
                attributes: ["id", "value"],
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.User,
                as: "likes",
                required: false,
                attributes: [],
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.Movies,
                as: "movie",
                attributes: ["title", "id", "poster"]
            }

        ];
        let groupByArray = ["review.id", "user.id", "goodTags.id","badTags.id", "movie.id"];
        let attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                // get the number of likes
                [sequelize.fn("COUNT", sequelize.col("likes->like.userId")), "likeCount"],
                // check if the user liked the post
                [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "likes->like"."userId" = ${requesterId} THEN 1 ELSE 0 END`)), 'liked']
        ];
        if(requesterId === undefined)
        {
            attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                    // get the number of likes
                    [sequelize.fn("COUNT", sequelize.col("likes->like.userId")), "likeCount"]
            ]
        }
        // may need to eventually sort by time stamps if not doing it already
        let reviews = await Review.findAndCountAll({
            limit: max,
            offset: offset,
            where: {
                userId: ids
            },
            order: [["updatedAt", 'DESC']],
            // only get these attributes
            attributes: {
                include: attributes
            },
            // include the following models with the specified attributes
            include:includeArray,
            group: groupByArray
        });
        console.log(reviews);
        console.log(reviews.count.length);
        return reviews.rows;
    }


    // function to get a INDIVIDUAL review with the users who liked it
    // this also checks to see if the reviews that are returned are
    // also liked by the requester
    Review.findByIdWithLikes = async (models, reviewId, requesterId) =>
    {
        let includeArray = [
            {
                model: models.User,
                as: "user",
                attributes: ["username", "id"]
            },
            {
                model: models.MovieTag,
                as: "goodTags",
                // included the id to make one less query needed to find tag
                attributes:["id", "value"],
                // do not include the association table
                through: {attributes: []}
            },
            {
                model: models.MovieTag,
                as: "badTags",
                // included the id to make one less query needed to find tag
                attributes: ["id", "value"],
                through: {attributes: []}
            },
            {
                model: models.User,
                as: "likes",
                required: false,
                attributes: [],
                through: {attributes: []}
            },
            {
                    model: models.Movies,
                    as: "movie",
                    attributes: ["title", "id", "poster"],
            }

        ];
        let groupByArray = ["review.id", "user.id", "goodTags.id","badTags.id", "movie.id"];
        let attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                // get the number of likes
                [sequelize.fn("COUNT", sequelize.col("likes->like.userId")), "likeCount"],
                // check if the user liked the post
                [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "likes->like"."userId" = ${requesterId} THEN 1 ELSE 0 END`)), 'liked']
        ];
        if(requesterId === undefined)
        {
            attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                    // get the number of likes
                    [sequelize.fn("COUNT", sequelize.col("likes->like.userId")), "likeCount"]
            ]
        }
        // may need to eventually sort by time stamps if not doing it already
        let reviews = await Review.findAll({
            where: {
                id: reviewId
            },
            order: [["updatedAt", 'DESC']],
            // only get these attributes
            attributes: {
                include: attributes
            },
            // include the following models with the specified attributes
            include:includeArray,
            group: groupByArray
        });

        return reviews;
    }

    Review.findByIdForUpdate = async (models, reviewId) => {
        let reviews = await Review.findAll({
            where: {
                id: reviewId
            },
            // only get these attributes
            // include the following models with the specified attributes
            include:[
                {
                    model: models.MovieTag,
                    as: "goodTags",
                    // included the id to make one less query needed to find tag
                    attributes:["id", "value"],
                    // do not include the association table
                    through: {attributes: []}
                },
                {
                    model: models.MovieTag,
                    as: "badTags",
                    // included the id to make one less query needed to find tag
                    attributes: ["id", "value"],
                    through: {attributes: []}
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

    // function to get a reviews comments
    // eventually, if the user who posted the reviews profile is not public,
    // will check to see if the userId follows them when getting the review/comments
    Review.getReviewComments = async(reviewId, userId, models) =>
    {
        let review = await Review.findOne({
            where: {id: reviewId},
            include: [{
                model: models.Comment,
                attributes:["id", "value", "createdAt"],
                include:[
                    {
                        model: models.User,
                        attributes: ["username"]
                    }]
            }],
            order: [[models.Comment, 'createdAt', 'ASC']]
        });
        // review could not be found
        if(review === null)
        {
            return null;
        }
        else
        {
            return review.comments;
        }
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

    // function to get reviews for a set of users
    // can also be used to get a individual users reviews if passed a single id
    // this also checks to see if the reviews that are returned are
    // also liked by the requester
    Review.getUserReviewFeed = async (models, requesterId, max, offset) =>
    {
        let includeArray = [
            {
                model: models.User,
                as: "user",
                attributes: ["username", "id"],
                required: true,
                include: {
                    model: models.User,
                    as: "Followers",
                    attributes: ["id"],
                    through: {attributes: []},
                    where: {id: requesterId},
                    required: true,
                    duplicating: false
                },
                duplicating: false
            },
            {
                model: models.MovieTag,
                as: "goodTags",
                // included the id to make one less query needed to find tag
                attributes:["id", "value"],
                // do not include the association table
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.MovieTag,
                as: "badTags",
                // included the id to make one less query needed to find tag
                attributes: ["id", "value"],
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.User,
                as: "likes",
                required: false,
                attributes: [],
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.Movies,
                as: "movie",
                attributes: ["title", "id", "poster"]
            }

        ];
        let groupByArray = ["review.id", "user.id", "goodTags.id","badTags.id", "movie.id", "user->Followers.id"];
        let attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                // get the number of likes
                [sequelize.fn("COUNT", sequelize.col("likes->like.userId")), "likeCount"],
                // check if the user liked the post
                [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "likes->like"."userId" = ${requesterId} THEN 1 ELSE 0 END`)), 'liked']
        ];
        if(requesterId === undefined)
        {
            attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                    // get the number of likes
                    [sequelize.fn("COUNT", sequelize.col("likes->like.userId")), "likeCount"]
            ]
        }
        // may need to eventually sort by time stamps if not doing it already
        let reviews = await Review.findAll({
            order: [["updatedAt", 'DESC']],
            offset: offset,
            limit: max,
            // only get these attributes
            attributes: {
                include: attributes
            },
            // include the following models with the specified attributes
            include:includeArray,
            group: groupByArray
        });
        return reviews;
    }


    return Review;
};

export default review;
