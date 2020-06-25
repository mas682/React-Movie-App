import models, { sequelize } from './src/models';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPIRouter = require('./routes/testAPI');
var signUpRouter = require('./routes/signup');
var reviewRouter = require('./routes/reviews');

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
        createTag();
        sampleReview();
    }

    app.listen(9000, () =>
        console.log(`Example app listening on port 9000!`),
    );
});


const createTag = async () => {
    await models.GoodTag.create(
        {
            value: 'Funny',
        },
    );
};

const createUsers = async () => {
    await models.User.create(
        {
            username: 'admin',
            email: 'admin@email.com',
            password: 'password',
            firstName: 'admin',
            lastName: 'admin',
            /*
            use this to add a review associated with a user
            reviews: [
                {
                    title: 'the other guys',
                    ...
                },
                {
                    review 2
                }
            ],
            */
        },
        /*
        {
            include: [models.Review],
        },
        */
    );
};

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
        let goodTag = models.GoodTag.findOne({where: {id: 1}})
        .then((tag) =>{ console.log(tag)});
        const tag = models.GoodTag.create(
            {
                value: 'Long',
            },
        );
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

const result = async () => {
    await models.Review.findOne({
        where: { title: 'Movie' },
})};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/testAPI', testAPIRouter);
app.use('/signup', signUpRouter);
app.use('/review', reviewRouter);
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
