import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;

var express = require('express');
var router = express.Router();

router.post("/", function(req, res, next){
    models.Review.create({
            title: req.body.title,
            rating: req.body.rating,
            userId: req.body.userId,
            good: req.body.good,
            bad: req.body.bad,
            review: req.body.review,
            }
    );
});

module.exports=router;
