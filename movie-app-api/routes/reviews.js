const models = require('../src/shared/sequelize.js').getClient().models;
import { loggers } from 'winston';
import {validateIntegerParameter, validateStringParameter} from './globals.js';
import {createReview, updateReview} from './reviewCreator.js';
const Logger = require("../src/shared/logger.js").getLogger();


// function to post a reviews
const review = (req, res, next) =>
{
    let requester = (req.session.user === undefined) ? "" : req.session.user;
    res.locals.file = "reviews";
    if(requester !== "")
    {
        // get the reviews and pass the cookie
        selectPath(requester, req, res, next);
    }
    // if no cookie was found
    else
    {
        res.status(401).sendResponse({
            message: "You are not logged in",
            requester: requester});
    }

};

const selectPath = (requester, req, res, next) =>
{
    res.locals.function = "selectPath";
    let routeFound = false;
    if(req.method === "GET")
    {
        if(req.params.reviewId !== undefined)
        {
            if(req.params.type === "getcomments")
            {
                routeFound = true;
                getComments(req, res, requester)
                .catch((err) => {
                    next(err)
                });
            }
        }
    }
    else if(req.method === "POST")
    {
        if(Object.keys(req.params).length == 0)
        {
            routeFound = true;
            createReview(requester, req, res)
            .catch((err) => {next(err)});
        }
        // if the path is /review/update
        else if(req.params.type === "update")
        {
            routeFound = true;
            updateReview(requester, req, res)
            .catch((err) => {next(err)});
        }
        // if the path is /review/add_like
        else if(req.params.type === "addlike")
        {
            routeFound = true;
            addLike(requester, req, res)
            .catch((err) => {next(err)});
        }
        // if the path is /review/removelike
        else if(req.params.type === "removelike")
        {
            routeFound = true;
            removeLike(requester, req, res)
            .catch((err) => {next(err)});
        }
        // if the path is /review/getlikes
        else if(req.params.type === "getlikes")
        {
            routeFound = true;
            getLikes(requester, req, res)
            .catch((err) => {next(err)});
        }
        // if the path is /review/postcomment
        else if(req.params.type === "postcomment")
        {
            routeFound = true;
            postComment(req, res, requester)
            .catch((err) => {next(err)});
        }
        // if the path is /review/updatecomment
        else if(req.params.type === "updatecomment")
        {
            routeFound = true;
            updateComment(req, res, requester)
            .catch((err) => {next(err)});
        }
        // if the path is /review/removecomment
        else if(req.params.type === "removecomment")
        {
            routeFound = true;
            removeComment(req, res, requester)
            .catch((err) => {next(err)});
        }
        // if the path is /review/removepost
        else if(req.params.type === "removepost")
        {
            routeFound = true;
            removePost(req, res, requester)
            .catch((err) => {next(err)});
        }
    }

    // if the route was invalid for the GET request
    if(!routeFound)
    {
        res.status(404).sendResponse({
            message:"The review path sent to the server does not exist",
            requester: requester
        });
    }

};

// function to remove a review
// the body of the request must include:
// reviewId - the id the post
const removePost = async (req, res, requester) =>
{
    res.locals.function = "removePost";
    // also need to verify this is the user that posted the comment...
    let reviewId = req.body.reviewId;
    let valid = validateIntegerParameter(res, reviewId, requester, "The review ID is invalid");
    if(!valid) return;

    // try to get the review
    let review = await models.Reviews.getReviewWithCreator(reviewId, models);
    if(review === null)
    {
        res.status(404).sendResponse({
            message: "Review could not be found",
            requester: requester
        });
    }
    else
    {
        // currently only let the user who posted the review remove it
        if(req.session.userId !== review.user.id)
        {
            res.status(401).sendResponse({
                message: "You cannot remove another users post",
                requester: requester
            });
        }
        else
        {
            let result = await review.destroy();
            if(result === undefined)
            {
                let message = "Server failed to delete review for some unkown reason.  Error code: 1200";
                Logger.error("Server failed to delete review for some unkown reason.",
                    {errorCode: 1200, function: "removePost", file: "reviews.js", requestId: req.id});
                res.status(500).sendResponse({
                    message: message,
                    requester: requester
                });
            }
            else
            {
                res.status(200).sendResponse({
                    message: "Review successfully removed",
                    requester: requester
                });
            }
        }
    }
};

// function to add a like to a review post
// the body of the request must include:
// reviewId - the id of the review being liked
const addLike = async (requester, req, res) =>
{
    res.locals.function = "addLike";
    // get the requesters id
    let userId = req.session.userId;
    let reviewId = req.body.reviewId;
    let valid = validateIntegerParameter(res, reviewId, requester, "The review ID is invalid");
    if(!valid) return;
    // get the review
    let review = await models.Reviews.getReviewWithLikedUser(reviewId, userId, models);
    if(review === null)
    {
        res.status(404).sendResponse({
            message: "The review could not be found",
            requester: requester
        });
        return;
    }
    else if(review.dataValues.likes.length < 1)
    {
        // may want to only let a user like their friends posts???
        // add the like to the review based off the users id
        let result = await review.addLike(userId, { through: {uid: userId }});
        // if undefined, a association already exists
        if(result === undefined)
        {
            let message = "Some error occurred trying to like the post.  Error code: 1201"
            res.status(500).sendResponse({
                message: message,
                requester: requester
            });
        }
        else
        {
            res.status(200).sendResponse({
                message: "Post liked",
                requester: requester
            });
        }
    }
    else
    {
        res.status(400).sendResponse({
            message: "Post already liked",
            requester: requester
        });
    }
};


// function to remove a like from a review post
// the body of the request must include:
// reviewId - the id of the review being unliked
const removeLike = async (requester, req, res) =>
{
    res.locals.function = "removeLike";
    // the id of the requester
    let userId = req.session.userId;
    let reviewId = req.body.reviewId;
    let valid = validateIntegerParameter(res, reviewId, requester, "The review ID is invalid");
    if(!valid) return;
    // get the review
    let review = await models.Reviews.getReviewWithLikedUser(reviewId, userId, models);
    if(review === null)
    {
        res.status(404).sendResponse({
            message: "The review could not be found",
            requester: requester
        });
        return;
    }
    else if(review.dataValues.likes.length > 0)
    {
        // may want to only let a user unlike their friends posts???
        // remove the like from the post based off the requesters id
        let result = await review.removeLike(userId);
        // if undefined, a association already exists
        if(result === undefined)
        {
            let message = "Some error occurred trying to remove like from the post.  Error code: 1202"
            res.status(500).sendResponse({
                message: message,
                requester: requester
            });
        }
        else
        {
            res.status(200).sendResponse({
                message: "Post like removed",
                requester: requester
            });
        }
    }
    else
    {
        res.status(400).sendResponse({
            message: "Post already not liked",
            requester: requester
        });
    }
}

// this function gets the users who liked a post
// the request must include the reviewId in the body
// the user must also be logged in to access the likes of a review
const getLikes = async (requester, req, res) =>
{
    res.locals.function = "getLikes";
    let reviewId = req.body.reviewId;
    let valid = validateIntegerParameter(res, reviewId, requester, "The review ID is invalid");
    if(!valid) return;
    // test to make sure valid number as well
    // holds the ids of the users who are already followed
    let usersWhoLiked = await models.Reviews.getLikes(reviewId, req.session.userId, models);
    if(usersWhoLiked === null)
    {
        res.status(404).sendResponse({
            message: "The review could not be found",
            requester: requester
         });
    }
    else
    {
        res.status(200).sendResponse({
            message: "Review likes found",
            requester: requester,
            users: usersWhoLiked
         });
    }

}


// function to add a comment to a review post
// the body of the request must include:
// reviewId - the id of the review being comment on
// comment - the comment to add to the post
const postComment = async (req, res, requester) =>
{
    res.locals.function = "postComment";
    let comment = req.body.comment;
    // for now, comments can be as long as possible but should limit in future..
    let valid = validateStringParameter(res, comment, 1, 1000, requester, "You cannot post a empty comment");
    if(!valid) return;
    let reviewId = req.body.reviewId;
    valid = validateIntegerParameter(res, reviewId, requester, "The review ID for the comment is invalid");
    if(!valid) return;
    let review = await models.Reviews.getReviewForComment(reviewId, req.session.userId, undefined, models);
    if(review === null)
    {
        res.status(404).sendResponse({
            message: "The review could not be found",
            requester: requester
        });
        return;
    }
    else
    {
        let newComment = await models.Comments.create({
            value: comment,
            userId: req.session.userId,
            reviewId: reviewId,
        });
        res.status(201).sendResponse({
            message: "Comment successfully posted",
            requester: requester
        });
    }
};

// function to update an existing comment on a review post
// the body of the request must include:
// commentId - the id the comment
// comment - the comment to add to the post
const updateComment = async (req, res, requester) =>
{
    res.locals.function = "updateComment";
    let commentId = req.body.commentId;
    let updatedComment = req.body.comment;
    let valid = validateStringParameter(res, updatedComment, 1, 1000, requester, "You cannot post a empty comment");
    if(!valid) return;
    valid = validateIntegerParameter(res, commentId, requester, "The comment ID to update is invalid");
    if(!valid) return;
    // try to get the comment
    let comment = await models.Comments.findById(models, commentId);
    if(comment === null)
    {
        res.status(404).sendResponse({
            message: "Comment could not be found",
            requester: requester
        });
    }
    else
    {
        // if you are not the user that posted the comment
        if(requester !== comment.user.username)
        {
            res.status(401).sendResponse({
                message: "You cannot update another users comment",
                requester: requester
            });
        }
        else
        {
            let result = await comment.update({value: updatedComment});
            if(result === undefined || result === null)
            {
                // update returns a updated instance of the comment
                // if undefined, comment cannot be found
                res.status(404).sendResponse({
                    message: "Comment could not be found",
                    requester: requester
                });
            }
            else
            {
                // could also return the comment which is the result
                res.status(200).sendResponse({
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
const removeComment = async (req, res, requester) =>
{
    res.locals.function = "removeComment";
    let commentId = req.body.commentId;
    let valid = validateIntegerParameter(res, commentId, requester, "The comment ID to remove is invalid");
    if(!valid) return;
    // try to get the comment
    let comment = await models.Comments.findById(models, commentId);
    if(comment === null)
    {
        res.status(404).sendResponse({
            message: "Comment could not be found",
            requester: requester
        });
    }
    else
    {
        // if you are not the user that posted the comment
        if(requester !== comment.user.username)
        {
            // get the review to see who posted it
            let review = await models.Reviews.findOne({
                where: {id: comment.reviewId},
                attributes: ["userId"]
            });
            if(review === null)
            {
                // review could not be found...
                res.status(404).sendResponse({
                    message: "The review the comment was associated with could not be found",
                    requester: requester
                });
            }
            else if(review.userId === req.session.userId)
            {
                commentRemoval(res, comment, requester);
            }
            else
            {
                res.status(401).sendResponse({
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
    res.locals.function = "commentRemoval";
    let result = await comment.destroy();
    if(result === undefined || result === null)
    {
        // update returns a updated instance of the comment
        // if undefined, comment cannot be found
        res.status(404).sendResponse({
            message: "Comment could not be found",
            requester: requester
        });
    }
    else
    {
        // could also return the comment which is the result
        res.status(200).sendResponse({
            message: "Comment successfully removed",
            requester: requester
        });
    }
};


// function to get comments for a review post
// the body of the request must include:
// reviewId - the id of the review to get its comments
const getComments = async(req, res, requester) =>
{
    res.locals.function = "getComments";
    let reviewId = req.params.reviewId;
    let valid = validateIntegerParameter(res, reviewId, requester, "The review ID to get the comments is invalid");
    if(!valid) return;
    let comments = await models.Reviews.getReviewComments(reviewId, req.session.userId, models);
    if(comments === null)
    {
        res.status(404).sendResponse({
            message: "Review could not be found",
            requester: requester
        });
    }
    else
    {
        res.status(200).sendResponse({
            message: "Comments successfully found",
            requester: requester,
            comments: comments
        });
    }
};

export {review};
