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
    );
    // idea is that once review is created to you will have to
    // find the tags in the database
    // then do review.addTag(tag, {through: {userId: req.body.userId }})
    // https://sequelize.org/master/manual/advanced-many-to-many.html
});

module.exports=router;
