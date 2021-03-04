var DataTypes = require("sequelize").DataTypes;
var _Genres = require("./Genres");
var _MovieGenreTables = require("./MovieGenreTables");
var _MoviesProviders = require("./MoviesProviders");
var _Retailers = require("./Retailers");
var _ReviewBadTags = require("./ReviewBadTags");
var _ReviewGoodTags = require("./ReviewGoodTags");
var _UserVerificationCodes = require("./UserVerificationCodes");
var _UserVerificationQuestions = require("./UserVerificationQuestions");
var _UsersFriends = require("./UsersFriends");
var _VerificationQuestions = require("./VerificationQuestions");
var _comments = require("./comments");
var _likes = require("./likes");
var _movieTags = require("./movieTags");
var _movies = require("./movies");
var _reviews = require("./reviews");
var _userWatchLists = require("./userWatchLists");
var _users = require("./users");
var _usersWhoWatcheds = require("./usersWhoWatcheds");

function initModels(sequelize) {
  var Genres = _Genres(sequelize, DataTypes);
  var MovieGenreTables = _MovieGenreTables(sequelize, DataTypes);
  var MoviesProviders = _MoviesProviders(sequelize, DataTypes);
  var Retailers = _Retailers(sequelize, DataTypes);
  var ReviewBadTags = _ReviewBadTags(sequelize, DataTypes);
  var ReviewGoodTags = _ReviewGoodTags(sequelize, DataTypes);
  var UserVerificationCodes = _UserVerificationCodes(sequelize, DataTypes);
  var UserVerificationQuestions = _UserVerificationQuestions(sequelize, DataTypes);
  var UsersFriends = _UsersFriends(sequelize, DataTypes);
  var VerificationQuestions = _VerificationQuestions(sequelize, DataTypes);
  var comments = _comments(sequelize, DataTypes);
  var likes = _likes(sequelize, DataTypes);
  var movieTags = _movieTags(sequelize, DataTypes);
  var movies = _movies(sequelize, DataTypes);
  var reviews = _reviews(sequelize, DataTypes);
  var userWatchLists = _userWatchLists(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var usersWhoWatcheds = _usersWhoWatcheds(sequelize, DataTypes);

  Genres.belongsToMany(movies, { as: 'movies', through: MovieGenreTables, foreignKey: "GenreId", otherKey: "movieId" });
  Retailers.belongsToMany(movies, { as: 'Movies', through: MoviesProviders, foreignKey: "RetailerId", otherKey: "MovieId" });
  movieTags.belongsToMany(reviews, { as: 'reviews', through: ReviewBadTags, foreignKey: "movieTagId", otherKey: "reviewId" });
  movieTags.belongsToMany(reviews, { as: 'reviews', through: ReviewGoodTags, foreignKey: "movieTagId", otherKey: "reviewId" });
  movies.belongsToMany(Genres, { as: 'Genres', through: MovieGenreTables, foreignKey: "movieId", otherKey: "GenreId" });
  movies.belongsToMany(Retailers, { as: 'Retailers', through: MoviesProviders, foreignKey: "MovieId", otherKey: "RetailerId" });
  movies.belongsToMany(users, { as: 'users', through: userWatchLists, foreignKey: "movieId", otherKey: "userId" });
  movies.belongsToMany(users, { as: 'users', through: usersWhoWatcheds, foreignKey: "movieId", otherKey: "userId" });
  reviews.belongsToMany(movieTags, { as: 'movieTags', through: ReviewBadTags, foreignKey: "reviewId", otherKey: "movieTagId" });
  reviews.belongsToMany(movieTags, { as: 'movieTags', through: ReviewGoodTags, foreignKey: "reviewId", otherKey: "movieTagId" });
  reviews.belongsToMany(users, { as: 'users', through: likes, foreignKey: "reviewId", otherKey: "userId" });
  users.belongsToMany(movies, { as: 'movies', through: userWatchLists, foreignKey: "userId", otherKey: "movieId" });
  users.belongsToMany(movies, { as: 'movies', through: usersWhoWatcheds, foreignKey: "userId", otherKey: "movieId" });
  users.belongsToMany(reviews, { as: 'reviews', through: likes, foreignKey: "userId", otherKey: "reviewId" });
  users.belongsToMany(users, { as: 'followers', through: UsersFriends, foreignKey: "followedId", otherKey: "followerId" });
  users.belongsToMany(users, { as: 'followeds', through: UsersFriends, foreignKey: "followerId", otherKey: "followedId" });
  MovieGenreTables.belongsTo(Genres, { as: "Genre", foreignKey: "GenreId"});
  Genres.hasMany(MovieGenreTables, { as: "MovieGenreTables", foreignKey: "GenreId"});
  MoviesProviders.belongsTo(Retailers, { as: "Retailer", foreignKey: "RetailerId"});
  Retailers.hasMany(MoviesProviders, { as: "MoviesProviders", foreignKey: "RetailerId"});
  UserVerificationQuestions.belongsTo(VerificationQuestions, { as: "VerificationQuestion", foreignKey: "VerificationQuestionId"});
  VerificationQuestions.hasMany(UserVerificationQuestions, { as: "UserVerificationQuestions", foreignKey: "VerificationQuestionId"});
  ReviewBadTags.belongsTo(movieTags, { as: "movieTag", foreignKey: "movieTagId"});
  movieTags.hasMany(ReviewBadTags, { as: "ReviewBadTags", foreignKey: "movieTagId"});
  ReviewGoodTags.belongsTo(movieTags, { as: "movieTag", foreignKey: "movieTagId"});
  movieTags.hasMany(ReviewGoodTags, { as: "ReviewGoodTags", foreignKey: "movieTagId"});
  MovieGenreTables.belongsTo(movies, { as: "movie", foreignKey: "movieId"});
  movies.hasMany(MovieGenreTables, { as: "MovieGenreTables", foreignKey: "movieId"});
  MoviesProviders.belongsTo(movies, { as: "Movie", foreignKey: "MovieId"});
  movies.hasMany(MoviesProviders, { as: "MoviesProviders", foreignKey: "MovieId"});
  reviews.belongsTo(movies, { as: "movie", foreignKey: "movieId"});
  movies.hasMany(reviews, { as: "reviews", foreignKey: "movieId"});
  userWatchLists.belongsTo(movies, { as: "movie", foreignKey: "movieId"});
  movies.hasMany(userWatchLists, { as: "userWatchLists", foreignKey: "movieId"});
  usersWhoWatcheds.belongsTo(movies, { as: "movie", foreignKey: "movieId"});
  movies.hasMany(usersWhoWatcheds, { as: "usersWhoWatcheds", foreignKey: "movieId"});
  ReviewBadTags.belongsTo(reviews, { as: "review", foreignKey: "reviewId"});
  reviews.hasMany(ReviewBadTags, { as: "ReviewBadTags", foreignKey: "reviewId"});
  ReviewGoodTags.belongsTo(reviews, { as: "review", foreignKey: "reviewId"});
  reviews.hasMany(ReviewGoodTags, { as: "ReviewGoodTags", foreignKey: "reviewId"});
  comments.belongsTo(reviews, { as: "review", foreignKey: "reviewId"});
  reviews.hasMany(comments, { as: "comments", foreignKey: "reviewId"});
  likes.belongsTo(reviews, { as: "review", foreignKey: "reviewId"});
  reviews.hasMany(likes, { as: "likes", foreignKey: "reviewId"});
  ReviewBadTags.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(ReviewBadTags, { as: "ReviewBadTags", foreignKey: "userId"});
  ReviewGoodTags.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(ReviewGoodTags, { as: "ReviewGoodTags", foreignKey: "userId"});
  UserVerificationQuestions.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(UserVerificationQuestions, { as: "UserVerificationQuestions", foreignKey: "userId"});
  UsersFriends.belongsTo(users, { as: "followed", foreignKey: "followedId"});
  users.hasMany(UsersFriends, { as: "UsersFriends", foreignKey: "followedId"});
  UsersFriends.belongsTo(users, { as: "follower", foreignKey: "followerId"});
  users.hasMany(UsersFriends, { as: "follower_UsersFriends", foreignKey: "followerId"});
  comments.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(comments, { as: "comments", foreignKey: "userId"});
  likes.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(likes, { as: "likes", foreignKey: "userId"});
  reviews.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(reviews, { as: "reviews", foreignKey: "userId"});
  userWatchLists.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(userWatchLists, { as: "userWatchLists", foreignKey: "userId"});
  usersWhoWatcheds.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(usersWhoWatcheds, { as: "usersWhoWatcheds", foreignKey: "userId"});

  return {
    Genres,
    MovieGenreTables,
    MoviesProviders,
    Retailers,
    ReviewBadTags,
    ReviewGoodTags,
    UserVerificationCodes,
    UserVerificationQuestions,
    UsersFriends,
    VerificationQuestions,
    comments,
    likes,
    movieTags,
    movies,
    reviews,
    userWatchLists,
    users,
    usersWhoWatcheds,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
