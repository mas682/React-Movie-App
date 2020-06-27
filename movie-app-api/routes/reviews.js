import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;

var express = require('express');
var router = express.Router();

router.post("/", function(req, res, next){
    models.Review.create({
            title: req.body.title,
            rating: req.body.rating,
            userId: req.body.userId,
            review: req.body.review,
            }
    ).then((review)=> {
        // get each of the good tags
        let goodTags = req.body.good.split(",");
        // iterate through the array of good tags
        goodTags.forEach(tag => {
            // find the tag in the database
            models.GoodTag.findOne({ where: {value: tag }})
            // then associate the tag with the review
            // will want to do some error handling if tag not found
            .then((foundTag) => {
                review.addGoodTag(foundTag.id, { through: {userID: req.body.userId }});
            });
        });
    });
});

module.exports=router;
