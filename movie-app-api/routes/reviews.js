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
                createReview(JSON.parse(cookie), req, res);
            }
            // cookie not valid
            else
            {
                console.log("Failed 1");
                res.status(401).send("You are not logged in");
            }
        });
    }
    // if no cookie was found
    else
    {
        console.log("Failed 2");
        res.status(401).send("You are not logged in");
    }

};

const createReview = (cookie, req, res) =>
{
    console.log("HERE");
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

const addGoodTags = (goodString, review, userId) =>{
    // get each of the good tags
    let goodTags = goodString.split(",");
    // iterate through the array of good tags
    goodTags.forEach(tag => {
        // find the tag in the database
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
