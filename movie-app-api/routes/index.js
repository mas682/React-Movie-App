//var express = require('express');
//var router = express.Router();
import models, { sequelize } from '../src/models';
import {router, verifyLogin} from './globals.js';
import {login} from './login.js';
import {review} from './reviews.js';
import {getProfile} from './profile.js';
import {signUp} from './signup.js';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// used when trying to login
router.get('/login', function(req, res, next) {
    login(req, res, next);
});

// post a review
router.post('/review', function(req, res, next) {
    review(req, res, next);
});

// used to create a account
router.post('/signup', function(req, res, next) {
    signUp(req, res, next);
});

// used to see a users posts
router.get('/profile', function(req, res, next) {
    getProfile(req, res, next);
});

module.exports = router;
