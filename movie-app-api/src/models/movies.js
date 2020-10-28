let moment = require('moment');
const Op = require('Sequelize').Op;
const movie = (sequelize, DataTypes) => {
    const Movie = sequelize.define('movie', {
        // create a username field
        id: {
            // set the data type to string
            type: DataTypes.INTEGER,
            // make the value be unique
            unique: true,
            // do not allow this to be empty
            allowNull: true,
            primaryKey: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
        title: {
            // set the data type to string
            type: DataTypes.STRING,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
        revenue: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        director: {
          // set the data type to string
          type: DataTypes.STRING,
          // do not allow this to be empty
          allowNull: true,
          // validate that it is not empty
          validate: {
              notEmpty: true,
          }
        },
        runTime: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        rating: {
            type: DataTypes.STRING,
            allowNull: true
        },
        trailer: {
            // set the data type to string
            type: DataTypes.STRING,
            // do not allow this to be empty
            allowNull: true,
        },
        backgroundImage: {
            // set the data type to string
            type: DataTypes.STRING,
            // do not allow this to be empty
            allowNull: true,
        },
        releaseDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            get() {
                return moment(this.getDataValue('releaseDate')).format('MMMM D, YYYY');
            }
        },
        overview: {
            // set the data type to string
            type: DataTypes.TEXT,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
        poster: {
            // set the data type to string
            type: DataTypes.STRING,
            // make the value be unique
            unique: true,
            // do not allow this to be empty
            allowNull: true,
            // validate that it is not empty
            validate: {
                notEmpty: true,
            }
        },
        /*
        genres: {
            type: DataTypes.STRING,
            allowNull: true
        },
        */
    });

    Movie.associate = models => {
        // each movie can be associated with many reviews
        Movie.hasMany(models.Review, { onDelete: 'CASCADE' });
        // each movie can have many genres
        Movie.belongsToMany(models.Genre, {through: models.MovieGenreTable});
    };

    const orderGenerator = (order) =>
    {
        // the more checks you add, the slower this will be..
        // order by date
            // asc
            // DESC

        // title

        // run time
        console.log("HERE");


    }

    const whereGenerator = (query) =>
    {
        let filters = [];
        let keys = Object.keys(query);
        let numKeys = keys.length;
        let counter = 0;
        let key = "";
        let value = "";
        // array to hold release date filter
        let releaseDateArray = [];
        // array to hold just the release date gt/lt filters
        let releaseDateArrayGtLt = [];
        let lessThanDate = undefined;
        let greaterThanDate = undefined;
        // array to hold title filters
        let titleArray = [];
        // array to hold contains filters
        let titleContainsArray = [];
        // variable to hold filter for equals value
        let titleEqualsValue = undefined;
        let directorArray = [];
        // array to hold director contains filters
        let directorContainsArray = [];
        // variable to hold filter for director equals value
        let directorEqualsValue = undefined;
        let ratingArray = [];
        let ratingMatchArray = [];
        let ratingNull = undefined;
        let runTimeArray = [];
        let lessThanTime = undefined;
        let greaterThanTime = undefined;
        while(counter < numKeys)
        {
            key = keys[counter];
            let value = query[key];
            if(key === "release_date_gte")
            {
                releaseDateArrayGtLt.push({[Op.gte]: value});
                greaterThanDate = new Date(value);
                greaterThanDate.setUTCHours(12);
            }
            else if(key === "release_date_lte")
            {
                releaseDateArrayGtLt.push({[Op.lte]: value});
                lessThanDate = new Date(value);
                lessThanDate.setUTCHours(12);
            }
            else if(key === "release_date_eq")
            {
                releaseDateArray.push({[Op.eq]: value});
            }
            else if(key === "release_date_ne")
            {
                releaseDateArray.push({[Op.ne]: value});
            }
            else if(key === "title_equals")
            {
                titleEqualsValue = {[Op.iLike]: value};
            }
            else if(key === "title_starts_with")
            {
                titleContainsArray.push({[Op.iLike]: value + "%"});
            }
            else if(key === "title_contains")
            {
                titleContainsArray.push({[Op.iLike]: "%" + value + "%"});
            }
            else if(key === "title_ends_with")
            {
                titleContainsArray.push({[Op.iLike]: "%" + value});
            }
            else if(key === "director_equals")
            {
                directorEqualsValue = {[Op.iLike]: value};
            }
            else if(key === "director_stars_with")
            {
                directorContainsArray.push({[Op.iLike]: value + "%"});
            }
            else if(key === "director_contains")
            {
                directorContainsArray.push({[Op.iLike]: "%" + value + "%"});
            }
            else if(key === "director_ends_with")
            {
                directorContainsArray.push({[Op.iLike]: "%" + value});
            }
            else if(key === "rating_equals")
            {
                ratingMatchArray.push({[Op.iLike]: value});
            }
            else if(key === "rating_ne")
            {
                ratingMatchArray.push({[Op.notILike]: value});
            }
            else if(key === "ratings_include_null")
            {
                if(value === "true")
                {
                    ratingNull=({[Op.is]: null});
                }
                else if(value === "false")
                {
                    ratingNull=({[Op.not]: null});
                }
            }
            else if(key === "runtime_lte")
            {
                runTimeArray.push({[Op.lte]: value});
                lessThanTime = parseInt(value);
            }
            else if(key === "runtime_gte")
            {
                runTimeArray.push({[Op.gte]: value});
                greaterThanTime = parseInt(value);
            }

            counter = counter + 1;
        }

        // if both less than and greater than dates given
        if(lessThanDate !== undefined && greaterThanDate !== undefined)
        {
            if(greaterThanDate.getTime() < lessThanDate.getTime())
            {
                releaseDateArray.push({[Op.and]: releaseDateArrayGtLt});
            }
            else
            {
                releaseDateArray.push({[Op.or]: releaseDateArrayGtLt});
            }
        }
        // may want to only do this if releaseDateArray has length? but may not hurt??
        filters.push({releaseDate: {[Op.and]: releaseDateArray }});

        // if looking for a exact title
        if(titleEqualsValue !== undefined)
        {
            titleArray.push({[Op.or]: titleContainsArray});
            titleArray.push(titleEqualsValue);
            filters.push({title: {[Op.and]: titleArray}});

        }
        else
        {
            filters.push({title: {[Op.or]: titleContainsArray}});
        }

        // if looking for a exact director
        if(directorEqualsValue !== undefined)
        {
            directorArray.push({[Op.or]: directorContainsArray});
            directorArray.push(directorEqualsValue);
            filters.push({director: {[Op.and]: directorArray}});
        }
        else
        {
            filters.push({director: {[Op.or]: directorContainsArray}});
        }

        // if specifiying null or not null movies
        if(ratingNull !== undefined)
        {
            ratingArray.push({[Op.and]: ratingMatchArray});
            ratingArray.push(ratingNull);
            filters.push({rating: {[Op.or]: ratingArray}});
        }
        else
        {
            filters.push({rating: {[Op.and]: ratingMatchArray}});
        }
        if(greaterThanTime !== undefined && lessThanTime !== undefined)
        {
            if(greaterThanTime < lessThanTime)
            {
                filters.push({runTime: {[Op.and]: runTimeArray}});
            }
            else
            {
                filters.push({runTime: {[Op.or]: runTimeArray}});
            }
        }
        else if(greaterThanTime !== undefined || lessThanTime !== undefined)
        {
            filters.push({runTime: {[Op.or]: runTimeArray}});
        }

        return filters;

        /* sample of release date
        {
            releaseDate: {
                [Op.and]:[
                    [Op.and]: [
                        [Op.lte]: date,
                        [Op.gte]: date,
                    ],
                    [Op.ne]: "date"
                ]
            }
        }
        */

        // need to do genres in another table
            // contains genre
            // does not contain genres

    }

    Movie.queryMovies = async (models, query) =>
    {
        let queries = {
            //release_date_gte: "2020-09-03",
            //release_date_lte: "2020-09-05",
            //release_date_ne: "2020-09-03",
            //release_date_eq: "2020-09-05",
            //title_equals: "Guest",
            //title_starts_with: "The",
            //title_contains: "The",
            //title_ends_with: "InG",
            //director_equals: "Christopher Nolan",
            //director_stars_with: "Chris",
            //director_contains: "Chris",
            //director_ends_with: "N",
            //rating_equals: "PG-13",
            //rating_ne: "PG-13",
            //ratings_include_null: "false"
            //runtime_gte: "90",
            //runtime_lte: "100",

        };
        let whereQueries = whereGenerator(queries);
        //let abc = { title:{ [Op.iLike]: title + "%", }};
        console.log("queyries");
        console.log(whereQueries);
        let title = {title:{ [Op.iLike]: "The" + "%", }};
        let director = {director:{[Op.iLike]: "James" + "%",}};
        // get by exact date
        //let releaseDate = {releaseDate: "2020-09-04"};
        let releaseDate = {releaseDate: {[Op.gte]: "2020-09-04"}};
        //let whereQueries = [];
        let order = [];
        let orders = ['releaseDate', 'ASC'];
        order.push(orders);
        //whereQueries.push(title);
        //whereQueries.push(director);
        //whereQueries.push(releaseDate);
        let newquery = {[Op.and]: whereQueries};

        //title = "title: \"The\""
        let t = {
            include: [
                {
                    model: models.Genre,
                    as: "Genres",
                    attributes: ["id", "value"],
                    through: {attributes: []}
                }
            ],
            order: order,
            where: newquery
            /*{
               title
                /*
                [Op.and]: [
                  {
                    title: {
                        [Op.iLike]: title + "%",
                    }
                  },
                  {
                    id: {
                      [Op.notIn]: idArray
                    }
                  }
                  */
            //}
        }
        let movies = await Movie.findAll(t);
        return movies;
    }

    // function to get the information for a individual movie
    Movie.getMovieInfo = async (id, models) =>
    {
        let movie = await Movie.findOne({
            where: {
              id: id
            },
            include: [
              {
                  model: models.Genre,
                  as: "Genres",
                  attributes: ["id", "value"],
                  through: {attributes: []}
              }
            ]
        });
        return movie;
    }

    // function to get movies for the review form
    // only want title, id, and picture
    Movie.findByTitle= async (models, title, count) =>
    {
        // get any movie that matches exactly first
        let movies = await Movie.findAll({
            limit: count,
            where: {
                title: title
            },
            order: [
              ['title', 'ASC'],
              // doing this as movies that were added last are newer
              ['id', 'DESC']
            ],
            attributes: ["id", "title", "poster"]
        });
        // holds the movie id's that are already found
        let idArray = [];
        // if more results still needed
        if(movies.length < count)
        {
            movies.forEach((movie) => {
                idArray.push(movie.id);
            });
            // set new temporary query limit
            let tempCount = count - movies.length;
            // get the movies that start with the title
            let movieStartsWith = await Movie.findAll({
                limit: tempCount,
                where: {
                  [Op.and]: [
                    {
                      title: {
                          [Op.iLike]: title + "%",
                      }
                    },
                    {
                      id: {
                        [Op.notIn]: idArray
                      }
                    }
                  ]
                },
                order: [
                  ['title', 'ASC'],
                  ['id', 'DESC']
                ],
                attributes: ["id", "title", "poster"]
            });
            movies = movies.concat(movieStartsWith);
            // add the id's to ignore if another query needed
            if(movies.length < count)
            {
                movieStartsWith.forEach((movie) => {
                    idArray.push(movie.id);
                });
            }
        }
        // if more results still needed
        if(movies.length < count)
        {
            // set new temporary query limit
            let tempCount = count - movies.length;
            // get the movies that end with the value
            let movieEndsWith = await Movie.findAll({
                limit: tempCount,
                where: {
                    [Op.and]: [
                      {
                        title: {
                          [Op.iLike]: "%" + title
                        }
                      },
                      {
                        id: {
                          [Op.notIn]: idArray
                        }
                      }
                    ]
                },
                order: [
                  ['title', 'ASC'],
                  ['id', 'DESC']
                ],
                attributes: ["id", "title", "poster"]
            });
            movies = movies.concat(movieEndsWith);
            // add the id's to ignore if another query needed
            if(movies.length < count)
            {
                movieEndsWith.forEach((movie) => {
                    idArray.push(movie.id);
                });
            }
        }
        // get any movie that contains the value last
        if(movies.length < count)
        {
            let tempCount = count - movies.length;
            let movieContains = await Movie.findAll({
                limit: tempCount,
                where: {
                    [Op.and]: [
                      {
                        title: {
                          [Op.iLike]: "%" + title + "%"
                        }
                      },
                      {
                        id: {
                          [Op.notIn]: idArray
                        }
                      }
                    ]
                },
                order: [
                  ['title', 'ASC'],
                  ['id', 'DESC']
                ],
                attributes: ["id", "title", "poster"]
            });
            movies = movies.concat(movieContains);
        }
        return movies;
    }

    return Movie;
};

export default movie;
