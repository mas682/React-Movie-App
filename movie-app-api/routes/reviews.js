import models, { sequelize } from '../src/models';


// function to post a reviews
const review = (req, res, next) =>
{
    models.Review.create({
            title: req.body.title,
            rating: req.body.rating,
            userId: req.body.userId,
            review: req.body.review,
            }
    ).then((review)=> {
        addGoodTags(req.body.good, review, req.body.userId);
        addBadTags(req.body.bad, review, req.body.userId);
    });
    // review created
    res.status(201).send({message:"Review successfully created!"});
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
