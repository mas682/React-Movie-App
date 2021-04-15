//var express = require('express');
//var router = express.Router();

import {router, verifyLogin} from './globals.js';
import {login} from './login.js';
import {review} from './reviews.js';
import {profileHandler} from './profile.js';
import {signUp} from './signup.js';
import {homePage} from './homePage.js';
import {getUserInfo} from './getUserInfo.js';
import {movieHandler} from './movies.js';
import {searchHandler} from './search.js';
//import {uploads} from './fileHandler.js';

let multer = require('multer');

let storage = multer.diskStorage({
    // store the file in the uploads folder
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    // use the files original name
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});

// holds the storage object
var uploads = multer({storage});

/* GET home page. */
router.get('/', function(req, res, next) {
    homePage(req, res, next);
});

// used when trying to login
router.post('/login/:type', function(req, res, next) {
    login(req, res, next);
});

router.get('/login/:type', function(req, res, next) {
    login(req, res, next);
});

// post a review
router.post('/review', function(req, res, next) {
    review(req, res, next);
});

//update or delete a review
router.post('/review/:type/', function(req, res, next) {
    review(req, res, next);
});

router.get('/review/:reviewId/:type', function(req, res, next) {
    review(req, res, next);
})

// used to create a account
router.post('/signup/:type', function(req, res, next) {
    signUp(req, res, next);
});

router.get('/getuserinfo', function(req, res, next) {
    getUserInfo(req, res, next);
});

// used to see a users posts
// will need to test this
router.get('/profile/query', function(req, res, next) {
    profileHandler(req, res, next);
});

router.get('/profile/:userId/:type', function(req, res, next) {
    profileHandler(req, res, next);
});

// used for all posts routes to /profile/username/some other parameter
router.post('/profile/:userId/:type', uploads.single('file'), function(req, res, next) {
    profileHandler(req, res, next);
});


// used to return the movies from the API call to the screen
router.get('/movies/:type', function(req, res, next) {
    movieHandler(req, res, next);
});

router.post('/movies/:type', function(req, res, next) {
    movieHandler(req, res, next);
});

// used to return the movies from the API call to the screen
router.get('/movie/:type/*', function(req, res, next) {
    movieHandler(req, res, next);
});

router.get('/movie/:id', function(req, res, next) {
    movieHandler(req, res, next);
});

router.get('/search/:type', function(req, res, next) {
    searchHandler(req, res, next);
});

module.exports = router;
