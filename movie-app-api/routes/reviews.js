import models, { sequelize } from '../src/models';
import {verifyLogin} from './globals.js';


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
                console.log("HERE1");
                res.status(401).send("You are not logged in");
            }
        });
    }
    // if no cookie was found
    else
    {
        console.log("HERE2");
        res.status(401).send("You are not logged in");
    }

};

const selectPath = (cookie, req, res) =>
{
    // if here, the path is /review
    if(Object.keys(req.params).length == 0)
    {
        createReview(cookie, req, res);
    }
    // if the path is /review/update
    else if(Object.keys(req.params).length == 1 && req.params.type === "update")
    {
        updateReview(cookie, req, res);
    }
    // if the path is /review/delete
    else if(Object.keys(req.params).length == 1 && req.params.type === "delete")
    {
        deleteReview(cookie, req, res);
    }
    // if the path is /review/add_like
    else if(Object.keys(req.params).length == 1 && req.params.type === "addlike")
    {
        addLike(cookie, req, res);
    }
    // if the path is /review/removelike
    else if(Object.keys(req.params).length == 1 && req.params.type === "removelike")
    {
        removeLike(cookie, req, res);
    }
    // if the path is /review/getlikes
    else if(Object.keys(req.params).length == 1 && req.params.type === "getlikes")
    {
        getLikes(cookie, req, res);
    }
    // if the path is /review/postcomment
    else if(Object.keys(req.params).length == 1 && req.params.type === "postcomment")
    {
        postComment(req, res, cookie);
    }
    // if the path is /review/getcomments
    else if(Object.keys(req.params).length == 1 && req.params.type === "getcomments")
    {
        getComments(req, res, cookie);
    }
    // if the path is /review/updatecomment
    else if(Object.keys(req.params).length == 1 && req.params.type === "updatecomment")
    {
        updateComment(req, res, cookie);
    }
    // if the path is /review/removecomment
    else if(Object.keys(req.params).length == 1 && req.params.type === "removecomment")
    {
        removeComment(req, res, cookie);
    }
    // some unknow path given
    else
    {
        res.status(404).send("The review path sent to the server does not exist");
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

// to be implemented
const deleteReview = (cookie, req, res) =>
{

};

// function to create a review
// the body of the request should include:
// title - the title of the movie
// rating - the rating for the movie
// review - the review for the movie
// good - a comma seperated string of good tags
// bad - a comma seperated string of bad tags
const createReview = (cookie, req, res) =>
{
    let userId = cookie.id;
    console.log(userId);
    models.Review.create({
            title: req.body.title,
            rating: req.body.rating,
            userId: userId,
            review: req.body.review,
            }
    ).then((review)=> {
        addGoodTags(req.body.good, review, userId);
        addBadTags(req.body.bad, review, userId);
    });
    // review created
    res.status(201).send("Review successfully created!");
};

// function to add a like to a review post
// the body of the request must include:
// reviewId - the id of the review being liked
const addLike = (cookie, req, res) =>
{
    // get the requesters id
    let userId = cookie.id;
    // get the review
    models.Review.findOne({
        where: {id: req.body.reviewId}
    }).then((review) => {
        if(review === undefined)
        {
            res.status(404).send("Review id does not match any reviews");
        }
        // may want to only let a user like their friends posts???
        // add the like to the review based off the users id
        review.addLike(userId)
        .then((result) => {
            // if undefined, a association already exists
            if(result === undefined)
            {
                res.status(200).send("Post already liked");
            }
            else
            {
                res.status(200).send("Post liked");
            }
        });

    });
};


// function to remove a like from a review post
// the body of the request must include:
// reviewId - the id of the review being unliked
const removeLike = (cookie, req, res) =>
{
    // the id of the requester
    let userId = cookie.id;
    // get the review
    models.Review.findOne({
        where: {id: req.body.reviewId}
    }).then((review) => {
        if(review === undefined)
        {
            res.status(404).send("Review id does not match any reviews");
        }
        // may want to only let a user unlike their friends posts???
        // remove the like from the post based off the requesters id
        review.removeLike(userId)
        .then((result) => {
            if(result === undefined || result === 0)
            {
                res.status(200).send("Post was not previously liked");
            }
            else
            {
                res.status(200).send("Post like removed");
            }
        });

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
    // holds the ids of the users who are already followed
    let followedIds = [];
    // get the users who liked the post that the requester follows
    let followedUsers = await models.Review.getFollowingFromLikes(reviewId, cookie.id, models);
    // this could be very slow....
    followedUsers.forEach((user)=> {
        followedIds.push(user.id);
    });
    // get the users who liked the post taht the requester does not follow
    let notFollowedUsers = await models.Review.getNotFollowingFromLikes(reviewId, cookie.id, followedIds, models);
    // return the followed users, not followed users, and the username of the requesting user
    res.status(200).send([followedUsers, notFollowedUsers, cookie.name]);
}


// function to add a comment to a review post
// the body of the request must include:
// reviewId - the id of the review being comment on
// comment - the comment to add to the post
const postComment = async (req, res, cookie) =>
{
    // may need to also add error checking to make sure review actually exists
    // or that the user can add a comment to this users post
    // may want to add a function in the comment.js database file
    models.Comment.create({
        value: req.body.comment,
        userId: cookie.id,
        reviewId: req.body.reviewId,
    }).then(async (result) => {
        if(result !== undefined)
        {
            let comments = await models.Comment.findByReview(models, req.body.reviewId);
            res.status(201).send([comments, cookie.name]);
            // eventually want to send the comments back to the client along with cookie.name
        }
        else
        {
            res.status(404).send("Review could not be found");
        }
    });
};

// function to update an existing comment on a review post
// the body of the request must include:
// commentId - the id the comment
// comment - the comment to add to the post
const updateComment = async (req, res, cookie) =>
{
    let commentId = req.body.commentId;
    let updatedComment = req.body.comment;
    if(isNaN(commentId))
    {
        res.status(400).send(["Valid comment id not provided"]);
    }
    else if(updatedComment.length === 0)
    {
        res.status(400).send(["Cannot post a empty comment"]);
    }
    else
    {
        // try to get the comment
        let comment = await models.Comment.findOne(
            {
                where: {id: commentId},
                attributes:["id", "value", "createdAt"],
                order: [["createdAt", 'ASC']],
                include:[
                    {
                        model: models.User,
                        attributes: ["username"]
                    }
                ]
            }
        );
        if(comment === undefined)
        {
            res.status(404).send(["Comment could not be found"]);
        }
        else
        {
            // if you are not the user that posted the comment
            if(cookie.name !== comment.user.username)
            {
                res.status(401).send(["You cannot update another users comment"]);
            }
            else
            {
                comment.value = updatedComment;
                let result = await comment.save();
                if(result === undefined)
                {
                    res.status(404).send(["Server failed to update comment for some unkown reason"]);
                }
                else
                {
                    res.status(200).send([result, cookie.name]);
                }
            }
        }
    }
};


// function to remove an existing comment from a review post
// the body of the request must include:
// commentId - the id the comment
const removeComment = async (req, res, cookie) =>
{
    // also need to verify this is the user that posted the comment...
    let commentId = req.body.commentId;
    if(isNaN(commentId))
    {
        res.status(400).send("Valid comment id not provided");
    }
    else
    {
        // try to get the comment
        let comment = await models.Comment.findOne(
            {
                where: {id: commentId},
                attributes:["id", "value", "createdAt"],
                order: [["createdAt", 'ASC']],
                include:[
                    {
                        model: models.User,
                        attributes: ["username"]
                    },
                    {
                        model: models.Review,
                        attributes: ["userId"]
                    }
                ]
            }
        );
        if(comment === undefined)
        {
            res.status(404).send("Comment could not be found");
        }
        else
        {
            // if you are not the user who posted the comment or you are not the user who posted the
            // review, you cannot remove a users comment
            if(cookie.name !== comment.user.username && comment.review.userId !== cookie.id)
            {
                res.status(401).send("You cannot remove another users comment");
            }
            else
            {
                let result = await comment.destroy();
                if(result === undefined)
                {
                    res.status(404).send("Server failed to delete comment for some unkown reason");
                }
                else
                {
                    // returns a empty array on success
                    res.status(200).send("Comment successfully removed");
                }
            }
        }
    }
};


// function to get comments for a review post
// the body of the request must include:
// reviewId - the id of the review to get its comments
const getComments = async(req, res, cookie) =>
{
    let comments = await models.Comment.findByReview(models, req.body.reviewId);
    if(comments === undefined)
    {
        res.status(404).send("Review could not be found");
    }
    res.status(200).send([comments, cookie.name]);
};

export {review};
