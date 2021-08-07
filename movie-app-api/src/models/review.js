const Op = require('Sequelize').Op;
let moment = require('moment');
const review = (sequelize, DataTypes) => {
    const Review = sequelize.define('Reviews', {
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
            model: 'Users',
            key: 'id'
          },
          unique: "reviews_userId_movieId_key"
        },
        movieId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'Movies',
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
        tableName: 'Reviews',
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
        Review.belongsTo(models.Users, {as: "user", onDelete: 'CASCADE', foreignKey: "userId"});
        // each review can have many comments
        Review.hasMany(models.Comments, {foreignKey: "reviewId"});
        // each review can have many likes
        Review.belongsToMany(models.Users,{as:"likes", through: models.Likes, otherKey: "userId",foreignKey: "reviewId", onDelete: 'CASCADE'});
        // each review can have many good tags
        Review.belongsToMany(models.MovieTags, {as: "goodTags", through: models.ReviewGoodTags, foreignKey: "reviewId", otherKey: "movieTagId", onDelete: 'CASCADE'});
        Review.belongsToMany(models.MovieTags, {as: "badTags", through: models.ReviewBadTags, foreignKey: "reviewId", otherKey: "movieTagId", onDelete: 'CASCADE'});
        Review.hasMany(models.ReviewBadTags, {as: "reviewBadTags", foreignKey: "reviewId"});
        Review.hasMany(models.ReviewGoodTags, {as: "reviewGoodTags", foreignKey: "reviewId"});
        Review.hasMany(models.Likes, {as: "reviewLikes",foreignKey: "reviewId"});
    };

    // function to get reviews for a set of users
    // can also be used to get a individual users reviews if passed a single id
    // this also checks to see if the reviews that are returned are
    // also liked by the requester
    Review.findByIds = async (models, ids, requesterId, max, offset) =>
    {
        let includeArray = [
            {
                model: models.Users,
                as: "user",
                attributes: ["username", [sequelize.fn('concat', sequelize.col("user->profilePicture.source"),sequelize.col("user->profilePicture.filename")), "picture"]],
                duplicating: false,
                include: [
                    {
                        model: sequelize.models.DefaultProfilePictures,
                        as: "profilePicture",
                        attributes: []
                    }
                ]
            },
            {
                model: models.MovieTags,
                as: "goodTags",
                // included the id to make one less query needed to find tag
                attributes:["id", "value"],
                // do not include the association table
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.MovieTags,
                as: "badTags",
                // included the id to make one less query needed to find tag
                attributes: ["id", "value"],
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.Users,
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
        let groupByArray = ["Reviews.id", "user.id", "goodTags.id","badTags.id", "movie.id", "user->profilePicture.source", "user->profilePicture.filename"];
        let attributes = ["id", "rating", "review", "updatedAt", "createdAt",
        // get the number of likes
        [sequelize.fn("COUNT", sequelize.col("likes->Likes.userId")), "likeCount"],
        // check if the user liked the post
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "likes->Likes"."userId" = ${requesterId} THEN 1 ELSE 0 END`)), 'liked']
        ];
        if(requesterId === undefined)
        {
            attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                    // get the number of likes
                    [sequelize.fn("COUNT", sequelize.col("likes->Likes.userId")), "likeCount"]
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
                include: attributes,
                exclude: ["userId"]
            },
            // include the following models with the specified attributes
            include:includeArray,
            group: groupByArray
        });
        return reviews.rows;
    }


    // function to get a INDIVIDUAL review with the users who liked it
    // this also checks to see if the reviews that are returned are
    // also liked by the requester
    // need to be careful with this to make sure not reutnring user IDs
    Review.findByIdWithLikes = async (models, reviewId, requesterId) =>
    {
        let includeArray = [
            {
                model: models.Users,
                as: "user",
                attributes: ["username", "id"]
            },
            {
                model: models.MovieTags,
                as: "goodTags",
                // included the id to make one less query needed to find tag
                attributes:["id", "value"],
                // do not include the association table
                through: {attributes: []}
            },
            {
                model: models.MovieTags,
                as: "badTags",
                // included the id to make one less query needed to find tag
                attributes: ["id", "value"],
                through: {attributes: []}
            },
            {
                model: models.Users,
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
        let groupByArray = ["Reviews.id", "user.id", "goodTags.id","badTags.id", "movie.id"];
        let attributes = ["id", "rating", "review", "updatedAt", "createdAt",
            // get the number of likes
            [sequelize.fn("COUNT", sequelize.col("likes->Likes.userId")), "likeCount"],
            // check if the user liked the post
            [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "likes->Likes"."userId" = ${requesterId} THEN 1 ELSE 0 END`)), 'liked']
        ];
        if(requesterId === undefined)
        {
            attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                    // get the number of likes
                    [sequelize.fn("COUNT", sequelize.col("likes->Likes.userId")), "likeCount"]
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
                    model: models.MovieTags,
                    as: "goodTags",
                    // included the id to make one less query needed to find tag
                    attributes:["id", "value"],
                    // do not include the association table
                    through: {attributes: []}
                },
                {
                    model: models.MovieTags,
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
        return models.Reviews.findOne({
            where: {id: reviewId},
            include: [
                {
                    model: models.Users,
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
        return models.Reviews.findOne({
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
                model: models.Comments,
                attributes:["id", "value", "createdAt"],
                include:[
                    {
                        model: models.Users,
                        attributes: ["username"]
                    }]
            }],
            order: [[models.Comments, 'createdAt', 'ASC']]
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
        return models.Reviews.findOne({
            where: {id: reviewId},
            include: [{
                model: models.Users,
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
            attributes: [
             "username",
             [sequelize.fn('concat', sequelize.col("profilePicture.source"),sequelize.col("profilePicture.filename")), "picture"]
         ],
            include: [
                {
                    model: models.Users,
                    as: "Followers",
                    attributes:["username"],
                    where: {id: userId},
                    required: false,
                    through: {
                        attributes: []
                    }
                },
                {
                    model: sequelize.models.DefaultProfilePictures,
                    as: "profilePicture",
                    attributes: []
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
                model: models.Users,
                as: "user",
                attributes: ["username", [sequelize.fn('concat', sequelize.col("user->profilePicture.source"),sequelize.col("user->profilePicture.filename")), "picture"]],
                required: true,
                include: [
                    {
                        model: models.Users,
                        as: "Followers",
                        attributes: ["username"],
                        through: {attributes: []},
                        where: {id: requesterId},
                        required: true,
                        duplicating: false
                    },
                    {
                        model: sequelize.models.DefaultProfilePictures,
                        as: "profilePicture",
                        attributes: []
                    }

                ],
                duplicating: false
            },
            {
                model: models.MovieTags,
                as: "goodTags",
                // included the id to make one less query needed to find tag
                attributes:["id", "value"],
                // do not include the association table
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.MovieTags,
                as: "badTags",
                // included the id to make one less query needed to find tag
                attributes: ["id", "value"],
                through: {attributes: []},
                duplicating: false
            },
            {
                model: models.Users,
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
        let groupByArray = ["Reviews.id", "user.id", "goodTags.id","badTags.id", "movie.id", "user->Followers.id",
                            "user->profilePicture.source", "user->profilePicture.filename"];
        let attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                // get the number of likes
                [sequelize.fn("COUNT", sequelize.col("likes->Likes.userId")), "likeCount"],
                // check if the user liked the post
                [sequelize.fn('SUM', sequelize.literal(`CASE WHEN "likes->Likes"."userId" = ${requesterId} THEN 1 ELSE 0 END`)), 'liked']
        ];
        if(requesterId === undefined)
        {
            attributes = ["id", "rating", "review", "updatedAt", "createdAt",
                    // get the number of likes
                    [sequelize.fn("COUNT", sequelize.col("likes->Likes.userId")), "likeCount"]
            ]
        }
        // may need to eventually sort by time stamps if not doing it already
        let reviews = await Review.findAll({
            order: [["updatedAt", 'DESC']],
            offset: offset,
            limit: max,
            // only get these attributes
            attributes: {
                include: attributes,
                exclude: ["userId"]
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
