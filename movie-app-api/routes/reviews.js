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
                res.status(401).send("You are not logged in");
            }
        });
    }
    // if no cookie was found
    else
    {
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
    // some unknow path given
    else
    {
        res.status(404).send("The review path sent to the server does not exist");
    }
};


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
            // may want to do if(updatedReview === undefined)
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

const deleteReview = (cookie, req, res) =>
{

};

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

const addLike = (cookie, req, res) =>
{
    let userId = cookie.id;
    // get the review
    models.Review.findOne({
        where: {id: req.body.reviewId}
    }).then((review) => {
        if(review === undefined)
        {
            res.status(404).send("Review id does not match any reviews");
        }
        /* may want to only let a user like their friends posts???
        if(review.userId !== cookie.id)
        {
            res.status(401).send(["You cannot update another users review", null]);
        }
        */
        review.addLike(userId)
        .then((result) => {
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

const removeLike = (cookie, req, res) =>
{
    let userId = cookie.id;
    // get the review
    models.Review.findOne({
        where: {id: req.body.reviewId}
    }).then((review) => {
        if(review === undefined)
        {
            res.status(404).send("Review id does not match any reviews");
        }
        /* may want to only let a user unlike their friends posts???
        if(review.userId !== cookie.id)
        {
            res.status(401).send(["You cannot update another users review", null]);
        }
        */
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

export {review};
