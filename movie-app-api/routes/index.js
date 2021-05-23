//var express = require('express');
//var router = express.Router();

import {router, verifyLogin, verifyLogin2} from './globals.js';
import {login} from './login.js';
import {review} from './reviews.js';
import {profileHandler} from './profile.js';
import {signUp} from './signup.js';
import {getUserInfo} from './getUserInfo.js';
import {movieHandler} from './movies.js';
import {searchHandler} from './search.js';
import {imageHandler} from './fileHandler.js'

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

router.get('/getuserinfo',function(req, res, next) {
    getUserInfo(req, res, next);
});

// used to see a users posts
// will need to test this
router.get('/profile/query', function(req, res, next) { verifyLogin2(req, res, next, "profile") }, function(req, res, next) {
    profileHandler(req, res, next);
});

router.get('/profile/:username/:type', function(req, res, next) { verifyLogin2(req, res, next, "profile") }, function(req, res, next) {
    profileHandler(req, res, next);
});

router.post('/profile/:username/set_picture', function(req, res, next) { verifyLogin2(req, res, next, "profile") },
    function(req, res, next) {
        // validate requester
        profileHandler(req, res, next);
    },
    function(req, res, next) {
        // upload image
        imageHandler(req, res, next);
    },
    function(req, res, next) {
        res.locals.skipAuthentication = true;
        res.locals.type = "updateImage";
        profileHandler(req, res, next);
    }
);

// used for all posts routes to /profile/username/some other parameter
router.post('/profile/:username/:type', function(req, res, next) { verifyLogin2(req, res, next, "profile") }, function(req, res, next) {
    profileHandler(req, res, next);
});

router.delete('/profile/:username/:type', function(req, res, next) { verifyLogin2(req, res, next, "profile") }, function(req, res, next) {
    profileHandler(req, res, next);
})


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
