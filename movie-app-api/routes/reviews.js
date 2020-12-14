import models, { sequelize } from '../src/models';
import {verifyLogin, validateIntegerParameter, validateStringParameter} from './globals.js';


// function to post a reviews
const review = (req, res, next) =>
{
    // get the signed cookies in the request if there are any
    let cookie = req.signedCookies.MovieAppCookie;
    // variable to indicate if user logged in
    let valid = false;
    // if there is a signed cookie in the request
    if(cookie != undefined)
    {
        // see if the cookie has a valid user
        verifyLogin(cookie).then((cookieValid) =>
        {
            if(cookieValid)
            {
                // get the reviews and pass the cookie
                selectPath(JSON.parse(cookie), req, res);
            }
            // cookie not valid
            else
            {
                res.status(401).send({
                    message:"You are not logged in",
                    requester: ""});
            }
        });
    }
    // if no cookie was found
    else
    {
        res.status(401).send({
            message: "You are not logged in",
            requester: ""});
    }

};

const selectPath = (cookie, req, res) =>
{
    if(req.method === "GET")
    {
        let routeFound = false;
        if(req.params.reviewId !== undefined)
        {
            if(req.params.type === "getcomments")
            {
                routeFound = true;
                getComments(req, res, cookie);
            }
        }
        // if the route was invalid for the GET request
        if(!routeFound)
        {
            res.status(404).send({
                message:"The review path sent to the server does not exist",
                requester: cookie.name
            });
        }
    }
    else if(req.method === "POST")
    {
        if(Object.keys(req.params).length == 0)
        {
            createReview(cookie, req, res);
        }
        // if the path is /review/update
        else if(req.params.type === "update")
        {
            updateReview(cookie, req, res);
        }
        // if the path is /review/delete
        else if(req.params.type === "delete")
        {
            deleteReview(cookie, req, res);
        }
        // if the path is /review/add_like
        else if(req.params.type === "addlike")
        {
            addLike(cookie, req, res);
        }
        // if the path is /review/removelike
        else if(req.params.type === "removelike")
        {
            removeLike(cookie, req, res);
        }
        // if the path is /review/getlikes
        else if(req.params.type === "getlikes")
        {
            getLikes(cookie, req, res);
        }
        // if the path is /review/postcomment
        else if(req.params.type === "postcomment")
        {
            postComment(req, res, cookie);
        }
        // if the path is /review/updatecomment
        else if(req.params.type === "updatecomment")
        {
            updateComment(req, res, cookie);
        }
        // if the path is /review/removecomment
        else if(req.params.type === "removecomment")
        {
            removeComment(req, res, cookie);
        }
        // if the path is /review/removepost
        else if(req.params.type === "removepost")
        {
            removePost(req, res, cookie);
        }
        else
        {
            // if the route was invalid for the POST request
            res.status(404).send({
                message:"The review path sent to the server does not exist",
                requester: cookie.name
            });
        }
    }
    // some unknow path given that was not a get or post request
    else
    {
        res.status(404).send({
            message:"The review path sent to the server does not exist",
            requester: cookie.name});
    }
};


// function to update a review
// body of request must include:
// title - title of movie
// rating - rating for movie
// review - review for movie
// reviewId - id of the review being updated
// good - a comma seperated string of good tags
// bad - a comma seperated string of bad tags
const updateReview = (cookie, req, res) =>
{
    // get the review
    models.Review.findOne({
        where: {id: req.body.reviewId}
    }).then((review) => {
        if(review === undefined)
        {
            res.status(404).send(["Review id does not match any reviews", null]);
        }
        if(review.userId !== cookie.id)
        {
            res.status(401).send(["You cannot update another users review", null]);
        }
        // update the values
        review.title = req.body.title;
        review.rating = req.body.rating;
        review.review = req.body.review;
        review.save()
        .then(async (updatedReview) => {
            // should do if(updatedReview === undefined)
            // get the id's of the good tags
            let goodTagArr = await getTagIds(req.body.good, "good");
            // get the id's of the bad tags
            let badTagArr = await getTagIds(req.body.bad, "bad");
            // update the good tags
            updatedReview.setGoodTags(goodTagArr, {through: {userID: updatedReview.userId}})
            .then((result) => {
                // update the bad tags
                updatedReview.setBadTags(badTagArr, {through: {userID: updatedReview.userId}})
                .then((result2) => {
                    models.Review.findByReviewId(models,req.body.reviewId)
                    .then((finalReview) =>
                    {
                        if(finalReview === undefined)
                        {
                            res.status(404).send(["Reviw updated but could not be found", null]);
                        }
                        else
                        {
                            console.log(finalReview);
                            res.status(201).send(["Review successfully updated!", finalReview]);
                        }
                    });
                });
            });
        });
    });
};

// function to get id's of a string of tags(ex. too short, funny, acting) and return them
// in a array
// this will handle if duplicate tags are passed in or a tag that does not exist is passed in
// also handles if the tag string has a extra , at the end
const getTagIds = async (tagString, type) =>{
    // get each of the good tags
    let tags = tagString.split(",");
    let tagArray = [];
    let returnArray = [];
    // iterate through the array of good tags
    tags.forEach(tag => {
        tagArray.push(tag);
    });
    if(type === "good")
    {
        let result = await models.GoodTag.findAll({
            where: {
                value: tagArray
            },
            attribute:["id"]
        });
        result.forEach((tag) => {
            returnArray.push(tag.id);
        });
        console.log(returnArray);
        return returnArray;
    }
    else
    {
        let result = await models.BadTag.findAll({
            where: {
                value: tagArray
            },
            attribute:["id"]
        })
        result.forEach((tag) => {
            returnArray.push(tag.id);
        });
        return returnArray;
    }
};

// function to create a review
// the body of the request should include:
// title - the title of the movie
// rating - the rating for the movie
// review - the review for the movie
// good - a comma seperated string of good tags
// bad - a comma seperated string of bad tags
const createReview = async (cookie, req, res) =>
{
    let userId = cookie.id;
    // need to verify this exists
    let movieId = req.body.movie;

    console.log(userId);
    models.Review.create({
            rating: req.body.rating,
            userId: userId,
            review: req.body.review,
            movieId: movieId
            }
    ).then((review)=> {
        addGoodTags(req.body.good, review, userId);
        addBadTags(req.body.bad, review, userId);
        res.status(201).send("Review successfully created!");
    }).catch((err)=> {
      console.log("Error creating review post: ");
      if(err.original !== undefined)
      {
          // this works if trying to add review for movie that does not exist
          console.log(err.original.detail);
      }
      else
      {
          console.log(err);
      }
      res.status(404).send("Review creation failed");
    });
    // review created
};

// function to remove a review
// the body of the request must include:
// reviewId - the id the post
const removePost = async (req, res, cookie) =>
{
    // also need to verify this is the user that posted the comment...
    let reviewId = req.body.reviewId;
    let valid = validateIntegerParameter(res, reviewId, cookie.name, "The review ID is invalid");
    if(!valid) return;

    // try to get the review
    let review = await models.Review.getReviewWithCreator(reviewId, models);
    console.log("Review: ");
    console.log(review);
    if(review === null)
    {
        res.status(404).send({
            message: "Review could not be found",
            requester: cookie.name
        });
    }
    else
    {
        // currently only let the user who posted the review remove it
        if(cookie.id !== review.user.id)
        {
            res.status(401).send({
                message: "You cannot remove another users post",
                requester: cookie.name
            });
        }
        else
        {
            let result = await review.destroy();
            if(result === undefined)
            {
                res.status(500).send({
                    message: "Server failed to delete review for some unkown reason",
                    requester: cookie.name
                });
            }
            else
            {
                res.status(200).send({
                    message: "Review successfully removed",
                    requester: cookie.name
                });
            }
        }
    }
};

// function to add a like to a review post
// the body of the request must include:
// reviewId - the id of the review being liked
const addLike = (cookie, req, res) =>
{
    // get the requesters id
    let userId = cookie.id;
    let reviewId = req.body.reviewId;
    let valid = validateIntegerParameter(res, reviewId, cookie.name, "The review ID is invalid");
    if(!valid) return;
    // get the review
    models.Review.getReviewWithLikedUser(reviewId, userId, models)
    .then((review) => {
        if(review === null)
        {
            res.status(404).send({
                message: "The review could not be found",
                requester: cookie.name
            });
            return;
        }
        else if(review.dataValues.likes.length < 1)
        {
            // may want to only let a user like their friends posts???
            // add the like to the review based off the users id
            review.addLike(userId)
            .then((result) => {
                // if undefined, a association already exists
                if(result === undefined)
                {
                    res.status(500).send({
                        message: "Some error occurred trying to like the post",
                        requester: cookie.name
                    });
                }
                else
                {
                    res.status(200).send({
                        message: "Post liked",
                        requester: cookie.name
                    });
                }
            });
        }
        else
        {
            res.status(400).send({
                message: "Post already liked",
                requester: cookie.name
            });
        }
    });
};


// function to remove a like from a review post
// the body of the request must include:
// reviewId - the id of the review being unliked
const removeLike = (cookie, req, res) =>
{
    // the id of the requester
    let userId = cookie.id;
    let reviewId = req.body.reviewId;
    let valid = validateIntegerParameter(res, reviewId, cookie.name, "The review ID is invalid");
    if(!valid) return;
    // get the review
    models.Review.getReviewWithLikedUser(reviewId, userId, models)
    .then((review) => {
        console.log("Movie review");
        console.log(review);
        if(review === null)
        {
            res.status(404).send({
                message: "The review could not be found",
                requester: cookie.name
            });
            return;
        }
        else if(review.dataValues.likes.length > 0)
        {
            // may want to only let a user unlike their friends posts???
            // remove the like from the post based off the requesters id
            review.removeLike(userId)
            .then((result) => {
                // if undefined, a association already exists
                if(result === undefined)
                {
                    res.status(500).send({
                        message: "Some error occurred trying to remove like from the post",
                        requester: cookie.name
                    });
                }
                else
                {
                    res.status(200).send({
                        message: "Post like removed",
                        requester: cookie.name
                    });
                }
            });
        }
        else
        {
            res.status(400).send({
                message: "Post already not liked",
                requester: cookie.name
            });
        }

    });
}

// function to add good tags to a review
// goodString is a comma seperarted string of good tags
// review is the review to add the tags to
// userId is user id of the author of the review
const addGoodTags = (goodString, review, userId) =>{
    // get each of the good tags
    let goodTags = goodString.split(",");
    // iterate through the array of good tags
    goodTags.forEach(tag => {
        // find the tag in the database
        // should probably replace this with the getTagIds function above and then use set
        models.GoodTag.findOne({ where: {value: tag }})
        // then associate the tag with the review
        // will want to do some error handling if tag not found
        .then((foundTag) => {
            review.addGoodTag(foundTag.id, { through: {userID: userId }});
        });
    });
};

// function to add bad tags to a review
// badString is a comma seperated string of bad tags
// review is the review to add the tags to
// userId is the user id of the author of the review
const addBadTags = (badString, review, userId) => {
    // get each of the bad tags
    let badTags = badString.split(",");
    // iterate through the array of bad tags
    badTags.forEach(tag => {
        // find the tag in the database
        models.BadTag.findOne({ where: {value: tag }})
        // then associate the tag with the review
        // will want to do some error handling if tag not found
        .then((foundTag) => {
            review.addBadTag(foundTag.id, { through: {userID: userId }});
        });
    });
};

// this function gets the users who liked a post
// the request must include the reviewId in the body
// the user must also be logged in to access the likes of a review
const getLikes = async (cookie, req, res) =>
{
    let reviewId = req.body.reviewId;
    let valid = validateIntegerParameter(res, reviewId, cookie.name, "The review ID is invalid");
    if(!valid) return;
    // test to make sure valid number as well
    // holds the ids of the users who are already followed
    let usersWhoLiked = await models.Review.getLikes(reviewId, cookie.id, models);
    if(usersWhoLiked === null)
    {
        res.status(404).send({
            message: "The review could not be found",
            requester: cookie.name
         });
    }
    else
    {
        res.status(200).send({
            message: "Review likes found",
            requester: cookie.name,
            users: usersWhoLiked
         });
    }

}


// function to add a comment to a review post
// the body of the request must include:
// reviewId - the id of the review being comment on
// comment - the comment to add to the post
const postComment = async (req, res, cookie) =>
{
    let comment = req.body.comment;
    let requester = cookie.name;
    // for now, comments can be as long as possible but should limit in future..
    let valid = validateStringParameter(res, comment, undefined, requester, "You cannot post a empty comment");
    if(!valid) return;
    let reviewId = req.body.reviewId;
    valid = validateIntegerParameter(res, reviewId, requester, "The review ID for the comment is invalid");
    if(!valid) return;
    let review = await models.Review.getReviewForComment(reviewId, cookie.id, undefined, models);
    if(review === null)
    {
        res.status(404).send({
            message: "The review could not be found",
            requester: requester
        });
        return;
    }
    else
    {
        let newComment;
        try
        {
            newComment = await models.Comment.create({
                value: comment,
                userId: cookie.id,
                reviewId: reviewId,
            });
        }
        catch(err) {
            let errorObject = JSON.parse(JSON.stringify(err));
            // may want to make this a reusable error function?
            if(errorObject.name === "SequelizeForeignKeyConstraintError")
            {
                if(errorObject.original.constraint === "comments_userId_fkey")
                {
                    res.status(401).send({
                        message: "User could not be found",
                        requester: requester
                    });
                }
                else if(errorObject.original.constraint === "comments_reviewId_fkey")
                {
                    res.status(404).send({
                        message: "The review could not be found",
                        requester: requester
                    });
                }
                else
                {
                    res.status(500).send({
                        message: "A unknown error occurred trying to post a comment to the review",
                        requester: requester
                    });
                    console.log("Some unknown constraint error occurred: " + errorObject.original.constraint);
                }
            }
            else
            {
                console.log("Some unknown error occurred during posting a comment: " + errorObject.name);
                res.status(500).send({
                    message: "A unknown error occurred trying to post a comment to the review",
                    requester: requester
                });
            }
            return;
        }
        res.status(201).send({
            message: "Comment successfully posted",
            requester: requester
        });
    }
};

// function to update an existing comment on a review post
// the body of the request must include:
// commentId - the id the comment
// comment - the comment to add to the post
const updateComment = async (req, res, cookie) =>
{
    let commentId = req.body.commentId;
    let updatedComment = req.body.comment;
    let requester = cookie.name;
    let valid = validateStringParameter(res, updatedComment, undefined, requester, "You cannot post a empty comment");
    if(!valid) return;
    valid = validateIntegerParameter(res, commentId, requester, "The comment ID to update is invalid");
    if(!valid) return;
    // try to get the comment
    let comment = await models.Comment.findById(models, commentId);
    if(comment === null)
    {
        res.status(404).send({
            message: "Comment could not be found",
            requester: requester
        });
    }
    else
    {
        // if you are not the user that posted the comment
        if(cookie.name !== comment.user.username)
        {
            res.status(401).send({
                message: "You cannot update another users comment",
                requester: requester
            });
        }
        else
        {
            let result;
            try
            {
                result = await comment.update({value: updatedComment});
            }
            catch(err)
            {
                res.status(500).send({
                    message: "Comment update failed due to a server issue",
                    requester: requester
                });
                return;
            }
            if(result === undefined || result === null)
            {
                // update returns a updated instance of the comment
                // if undefined, comment cannot be found
                res.status(404).send({
                    message: "Comment could not be found",
                    requester: requester
                });
            }
            else
            {
                // could also return the comment which is the result
                res.status(200).send({
                    message: "Comment successfully updated",
                    requester: requester
                });
            }
        }
    }
};


// function to remove an existing comment from a review post
// the body of the request must include:
// commentId - the id the comment
const removeComment = async (req, res, cookie) =>
{
    let commentId = req.body.commentId;
    let requester = cookie.name;
    let valid = validateIntegerParameter(res, commentId, requester, "The comment ID to remove is invalid");
    if(!valid) return;
    // try to get the comment
    let comment = await models.Comment.findById(models, commentId);
    if(comment === null)
    {
        res.status(404).send({
            message: "Comment could not be found",
            requester: requester
        });
    }
    else
    {
        // if you are not the user that posted the comment
        if(cookie.name !== comment.user.username)
        {
            // get the review to see who posted it
            let review = await models.Review.findOne({
                where: {id: comment.reviewId},
                attributes: ["userId"]
            });
            if(review === null)
            {
                // review could not be found...
                res.status(404).send({
                    message: "The review the comment was associated with could not be found",
                    requester: requester
                });
            }
            else if(review.userId === cookie.id)
            {
                commentRemoval(res, comment, requester);
            }
            else
            {
                res.status(401).send({
                    message: "You cannot remove another users comment",
                    requester: requester
                });
            }
        }
        else
        {
            commentRemoval(res, comment, requester);
        }
    }
};

const commentRemoval = async (res, comment, requester) =>
{
    let result;
    try
    {
        result = await comment.destroy();
    }
    catch(err)
    {
        res.status(500).send({
            message: "Comment removal failed due to a server issue",
            requester: requester
        });
        return;
    }
    if(result === undefined || result === null)
    {
        // update returns a updated instance of the comment
        // if undefined, comment cannot be found
        res.status(404).send({
            message: "Comment could not be found",
            requester: requester
        });
    }
    else
    {
        // could also return the comment which is the result
        res.status(200).send({
            message: "Comment successfully removed",
            requester: requester
        });
    }
};


// function to get comments for a review post
// the body of the request must include:
// reviewId - the id of the review to get its comments
const getComments = async(req, res, cookie) =>
{
    let requester = cookie.name;
    let reviewId = req.params.reviewId;
    let valid = validateIntegerParameter(res, reviewId, requester, "The review ID to get the comments is invalid");
    if(!valid) return;
    let comments = await models.Review.getReviewComments(reviewId, cookie.id, models);
    if(comments === null)
    {
        res.status(404).send({
            message: "Review could not be found",
            requester: requester
        });
    }
    else
    {
        res.status(200).send({
            message: "Comments successfully found",
            requester: requester,
            comments: comments
        });
    }
};

export {review};
