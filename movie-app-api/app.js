import models, { sequelize } from './src/models';

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var app = express();
/*
// connect to the database
sequelize.sync().then(() => {
  app.listen(9000, () => {
    console.log(`Example app listening on port 9000!`);
  });
});
*/
// restart db each time
const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
        createUsers();
        createGoodTags();
        createBadTags();
        sampleReview();
        sampleReview2();
    }

    app.listen(9000, () =>
        console.log(`Example app listening on port 9000!`),
    );
});

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
};

// for testing
// create a sampleReview to add to the database
const sampleReview = async () => {
    await models.Review.create(
        {
            title: 'Movie',
            rating: "2.5",
            userId: 1,
            review: "",
        }
    ).then((review)=> {
        //console.log(Object.keys(models.Review.__proto__));
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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
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
