import models, { sequelize } from './src/models';

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var app = express();
const fetch = require('node-fetch');
/*
// connect to the database
sequelize.sync().then(() => {
  app.listen(9000, () => {
    console.log(`Example app listening on port 9000!`);
  });
});
*/
// restart db each time
const eraseDatabaseOnSync = false;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
        createUsers();
        createGoodTags();
        createBadTags();
        sampleReview();
        sampleReview2();
        addComment();
        addComment2();
        addComment3();
        getMovies();
    //    getFriends();
    }
    else
    {
    }

    app.listen(9000, () =>
        console.log(`Example app listening on port 9000!`),
    );
});

const getMovies = async () => {
    let response = await fetch("https://api.themoviedb.org/3/discover/movie?"
    + "api_key=9687aa5fa5dc35e0d5aa0c2a3c663fcc&language=en-US&region=US&sort_by=popularity.desc&"
    + "certification_country=US&include_adult=false&include_video=false&page=1&"
    + "release_date.gte=2020-09-03&release_date.lte=2020-09-05&with_original_language=en");
    if(response.status === 200)
    {
        let data = await(response.json());
        console.log(data);
        /*
        may eventually want to get move info about each movie...
        let movies = [];
        data.results.forEach(movie) => {
            let response =
        });
        */
        data.results.forEach(movie => {
            models.Movies.create({
                id: movie.id,
                title: movie.title,
                releaseDate: movie.release_date,
                poster: movie.poster_path,
                overview: movie.overview
            });
        });
    }
    else
    {
        console.log("Failed to get movies");
    }
}

// create the good tags in the database
const createGoodTags = async () => {
    await models.GoodTag.bulkCreate([
        {
            value: 'Acting',
        },
        {
            value: 'Jokes'
        },
        {
            value: 'Too short'
        },
        {
            value: 'Too long'
        },
        {
            value: 'Story'
        },
        {
            value: 'Theme'
        }
    ]);
};

// create the good tags in the database
const createBadTags = async () => {
    await models.BadTag.bulkCreate([
        {
            value: 'Acting',
        },
        {
            value: 'Jokes'
        },
        {
            value: 'Too short'
        },
        {
            value: 'Too long'
        },
        {
            value: 'Story'
        },
        {
            value: 'Theme'
        }
    ]);
};

// create a admin user on database creation
const createUsers = async () => {
    await models.User.create(
        {
            username: 'admin',
            email: 'admin@email.com',
            password: 'password',
            firstName: 'admin',
            lastName: 'admin',
        },
    );
    await models.User.create(
        {
            username: 'steelcity',
            email: 'steel@email.com',
            password: 'password',
            firstName: 'Matt',
            lastName: 'Stropkey',
        },
        );
        // below is a example of adding a follower to a user and
        // how to check who follows who
        /*
        ).then((user) => {
            user.addFollow(1).then(() => {
            models.User.findOne({
                where: {username: 'steelcity'},
                }).then((friend) => {
                    friend.getFollowing().then((r)=>{
                        console.log("Following 1: ");
                        console.log(r);
                        }).then(()=>{
                            models.User.findOne({
                                where: {username: 'admin'},
                                }).then((friend) => {
                                    //friend.addFollow(2);
                                    friend.getFollowers().then((r)=>{
                                        console.log("Followers 2: ");
                                        console.log(r);
                                    });
                                });
                            friend.getFollowers().then((b)=>{
                                console.log("Follwers 1: ");
                                console.log(b);
                            });
                        });
            });
        });
    });
    */

    await models.User.create(
        {
            username: '_theonenonly',
            email: 'theonenonly@email.com',
            password: 'password',
            firstName: 'Shawn',
            lastName: 'Talbert',
        },
    ).then(addComment);
};

// for testing
// create a sampleReview to add to the database
const sampleReview = async () => {
    await models.Review.create(
        {
            title: 'Movie',
            rating: "2.5",
            userId: 1,
            review: "Sublimely funny, particularly in the first half-hour, with a gorgeous running gag about the band TLC and a fabulously moronic death scene for The Rock and Sam Jackson, "
                        +"who play a couple of hero-cops with a propensity for wrecking half the city in pursuit of small-time cannabis dealers."
                        +"\nWahlberg is excellent - as unexpectedly good as Channing Tatum was in 21 Jump Street, though here the Max Payne and The Departed actor plays a coiled,"
                        +"perpetually furious bundle of resentment and frustration, ground down by the everyday humiliations that come with having accidentally shot Derek Jeter",
        }
    ).then((review)=> {
        //console.log(Object.keys(models.Review.__proto__));
        review.addGoodTag(2, { through: { userID: 1 } });
        review.addLike(1);
        review.addGoodTag(3, { through: { userID: 1 } });
        review.addBadTag(6, { through: { userID: 1 } });
        review.addBadTag(4, { through: { userID: 1 } });
        review.addBadTag(5, { through: { userID: 1 } });
        review.addGoodTag(1, { through: { userID: 1 } })
        .then((review)=>{
            models.Review.findOne({
                    where: { title: 'Movie' }, include: models.GoodTag
            }).then((r)=>{
                console.log(r);
                console.log("Tag: ");
                console.log(r.goodTags[0].value);
                });
        });
    });

};

// for testing
// create a sampleReview to add to the database
const sampleReview2 = async () => {
    await models.Review.create(
        {
            title: 'another movie',
            rating: "2.5",
            userId: 1,
            review: "",
        }
    ).then((review)=> {
        //console.log(Object.keys(models.Review.__proto__));
        review.addLike(1);
        review.addGoodTag(2, { through: { userID: 1 } })
        .then((review)=>{
            models.Review.findOne({
                    where: { title: 'Movie' }, include: models.GoodTag
            }).then((r)=>{
                console.log(r);
                console.log("Tag: ");
                console.log(r.goodTags[0].value);
                });
        });
    });

};

// create a admin user on database creation
const addComment = async () => {
    await models.Comment.create(
        {
            value: "This is the test comment for the 1st post",
            userId: 1,
            reviewId: 1,
        },
    );
};

// create a admin user on database creation
const addComment2 = async () => {
    await models.Comment.create(
        {
            value: "This is another comment to test the look of comments associated with this post.  I completely "
                    +"agree with you on this review but I would give it 5 stars.",
            userId: 1,
            reviewId: 1,
        },
    );
};


const addComment3 = async () => {
    await models.Comment.create(
        {
            value: "The scene where they talk about the lion and the tuna has to be my favorite part."
                    +" Will Ferrell's face during the whole seen is too funny.",
            userId: 1,
            reviewId: 1,
        },
    );
};

const getFriends = async() => {
    await models.User.findOne({
        where: {username: 'steelcity'},
    }).then((friend) => {
        console.log("user: " + friend);
        console.log(friend.getFollowers());
        console.log(friend.getFollowed());
    });
};


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('somesecrettosigncookie'));
app.use(express.static(path.join(__dirname, 'public')));

// all routes to the server will go through this router
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
