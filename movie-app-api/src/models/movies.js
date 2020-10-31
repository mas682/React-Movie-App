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

    // function to handle the releaseDateFilters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    // releaseDateArrayGtLt is the array holding the greater than and less than times
    // releaseDateArray is the array to hold exact date matches
    // returns true if the key passed in is one that can be used
    // returns false if the key is invalid
    const releaseDateHandler = (key, value, releaseDateArrayGtLt, releaseDateArrayEq, releaseDateArrayNe, greaterThanDate, lessThanDate) =>
    {
        if(key === "release_date_gte")
        {
            let values = value.split(",");
            if(values.length > 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            value = values[0];

            // validate the date
            let valid = moment(value, "YYYY-MM-DD", true).isValid();
            if(!valid)
            {
                return [false, "Invalid release date format for: " + key + "=" + value];
            }
            releaseDateArrayGtLt.push({[Op.gte]: value});
            let date = new Date(value);
            date.setUTCHours(12);
            greaterThanDate.push(date);
        }
        else if(key === "release_date_lte")
        {
            let values = value.split(",");
            if(values.length > 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            value = values[0];
            // validate the date
            let valid = moment(value, "YYYY-MM-DD", true).isValid();
            if(!valid)
            {
                return [false, "Invalid release date format for: " + key + "=" + value];
            }
            let date = new Date(value);
            date.setUTCHours(12);
            lessThanDate.push(date);
            releaseDateArrayGtLt.push({[Op.lte]: value});
        }
        else if(key === "release_date_eq")
        {
            let valid;
            let values = value.split(",");
            for(let date of values){
                // validate the date
                let valid = moment(date, "YYYY-MM-DD", true).isValid();
                if(!valid)
                {
                    return [false, "Invalid release date format for: " + key + "=" + value];
                }
                releaseDateArrayEq.push({[Op.eq]: date});
            };
        }
        else if(key === "release_date_ne")
        {
            let valid;
            let values = value.split(",");
            for(let date of values){
                // validate the date
                valid = moment(date, "YYYY-MM-DD", true).isValid();
                if(!valid)
                {
                    return [false, "Invalid release date format for: " + key + "=" + value];
                }
                releaseDateArrayNe.push({[Op.ne]: date});
            };
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    // function to handle the title search filters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    // titleEqualsValue is used for exact matches
    // titleContainsArray is used for to hold filters for titles start with, contain, or end with
    const titleHandler = (key, value, titleEqualsValue, titleContainsArray) =>
    {
        if(key === "title_equals")
        {
            let values = value.split(",");
            values.forEach((title) => {
                titleEqualsValue.push({[Op.iLike]: title});
            });
        }
        else if(key === "title_starts_with")
        {
            let values = value.split(",");
            values.forEach((title) => {
                titleContainsArray.push({[Op.iLike]: title + "%"});
            });
        }
        else if(key === "title_contains")
        {
            let values = value.split(",");
            values.forEach((title) => {
                titleContainsArray.push({[Op.iLike]: "%" + title + "%"});
            });
        }
        else if(key === "title_ends_with")
        {
            let values = value.split(",");
            values.forEach((title) => {
                titleContainsArray.push({[Op.iLike]: "%" + title});
            });
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    // function to handle the director search filters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    // directorEqualsArray is used for exact matches
    // directoryContainsArray is used for to hold filters for director start with, contain, or end with
    const directorHandler = (key, value, directorContainsArray, directorEqualsArray) => {
        if(key === "director_equals")
        {
            let values = value.split(",");
            for(let director of values) {
                directorEqualsArray.push({[Op.iLike]: director});
            };
        }
        else if(key === "director_starts_with")
        {
            let values = value.split(",");
            for(let director of values) {
                directorContainsArray.push({[Op.iLike]: director + "%"});
            };
        }
        else if(key === "director_contains")
        {
            let values = value.split(",");
            for(let director of values) {
                directorContainsArray.push({[Op.iLike]: "%" + director + "%"});
            };
        }
        else if(key === "director_ends_with")
        {
            let values = value.split(",");
            for(let director of values) {
                directorContainsArray.push({[Op.iLike]: "%" + director});
            };
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    // function to handle the rating search filters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    // ratingMatchArray is used for exact matches
    // ratingNotEqualsArray is used for exact matches that are not wanted
    // ratingNull is used to filter showing null/not null ratings
    // showNull holds a boolean as to whether or not to show null or not null
    const ratingHandler = (key, value, ratingMatchArray, ratingNotEqualsArray, ratingNull, showNull) => {
        if(key === "rating_equals")
        {
            let values = value.split(",");
            for(let rating of values) {
                ratingMatchArray.push({[Op.iLike]: rating});
            }
        }
        else if(key === "rating_ne")
        {
            let values = value.split(",");
            for(let rating of values) {
                ratingNotEqualsArray.push({[Op.notILike]: rating});
            }
        }
        else if(key === "ratings_include_null")
        {
            let values = value.split(",");
            if(values.length > 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            value = values[0];
            if(value === "true")
            {
                ratingNull.push({[Op.is]: null});
                showNull.push(true);
            }
            else if(value === "false")
            {
                ratingNull.push({[Op.not]: null});
                showNull.push(false);
            }
            else
            {
                return [false, "Invalid value for " + key + "=" + value];
            }
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    // function to handle the runtime search filters based off the query string passed in
    // key is the type of filter
    // value is the value to filter for
    const runTimeHandler = (key, value, runTimeArray, lessThanTime, greaterThanTime) => {
        if(key === "runtime_lte")
        {
            let values = value.split(",");
            if(values.length > 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            // need the first one for cases like '123a', need the second one for empty strings
            if(isNaN(value) || value.length < 1)
            {
                return [false, "The value found for " + key + " is not a valid number: " + value];
            }
            runTimeArray.push({[Op.lte]: value});
            lessThanTime.push(parseInt(value));
        }
        else if(key === "runtime_gte")
        {
            let values = value.split(",");
            if(values.length > 1  || value.length < 1)
            {
                return [false, "Multiple values for " + key + " found: " + value];
            }
            if(isNaN(value))
            {
                return [false, "The value found for " + key + " is not a valid number: " + value];
            }
            runTimeArray.push({[Op.gte]: value});
            greaterThanTime.push(parseInt(value));
        }
        else
        {
            return [false, key + " is not a valid query parameter"];
        }
        return [true];
    }

    const generateReleaseDateFilter = (releaseDateArrayEq, releaseDateArrayNe, releaseDateArrayGtLt, lessThanDate, greaterThanDate, releaseDateArray) =>
    {
        // if there are exact dates to match
        if(releaseDateArrayEq.length > 0)
        {
            releaseDateArray.push({[Op.or]: releaseDateArrayEq});
        }
        // if there are exact dates to ignore
        if(releaseDateArrayNe.length > 0)
        {
            releaseDateArray.push({[Op.and]: releaseDateArrayNe});
        }
        if(lessThanDate.length > 0 || greaterThanDate.length > 0)
        {
            if(lessThanDate.length > 0 && greaterThanDate.length > 0)
            {
                if(greaterThanDate[0].getTime() <= lessThanDate[0].getTime())
                {
                    releaseDateArray.push({[Op.and]: releaseDateArrayGtLt});
                }
                else
                {
                    releaseDateArray.push({[Op.or]: releaseDateArrayGtLt});
                }
            }
            else
            {
                // if here, only 1 of the two dates specified
                releaseDateArray.push({[Op.or]: releaseDateArrayGtLt});
            }
        }
    }

    const generateTitleFilter = (titleEqualsValue, titleArray, titleContainsArray) =>
    {
        let tempArray = [];
        // if looking for a exact title
        if(titleEqualsValue.length > 0)
        {
            if(titleContainsArray.length > 0)
            {
                tempArray.push({[Op.or]: titleContainsArray});
            }
            tempArray.push({[Op.or]: titleEqualsValue});
            titleArray.push({title: {[Op.and]: tempArray}});
        }
        else if(titleContainsArray.length > 0)
        {
            titleArray.push({title: {[Op.or]: titleContainsArray}});
        }
    }

    const generateDirectorFilter = (directorEqualsArray, directorArray, directorContainsArray) =>
    {
        let tempArray = [];
        // if looking for a exact director
        if(directorEqualsArray.length > 0)
        {
            if(directorContainsArray.length > 0)
            {
                tempArray.push({[Op.or]: directorContainsArray});
            }
            tempArray.push({[Op.or]: directorEqualsArray});
            directorArray.push({director: {[Op.and]: tempArray}});
        }
        else if(directorContainsArray.length > 0)
        {
            directorArray.push({director: {[Op.or]: directorContainsArray}});
        }
    }

    const whereGenerator = (query, ids) =>
    {
        let filters = [];
        let keys = Object.keys(query);
        let numKeys = keys.length;
        let counter = 0;
        let key = "";
        let value = "";
        // release date variables
        let releaseDateArray = [];
        let releaseDateArrayEq = [];
        let releaseDateArrayNe = [];
        let releaseDateArrayGtLt = [];
        let lessThanDate = [];
        let greaterThanDate = [];
        // title variables
        let titleArray = [];
        let titleContainsArray = [];
        let titleEqualsValue = [];
        // director variables
        let directorArray = [];
        let directorContainsArray = [];
        let directorEqualsArray = [];
        // rating variables
        let ratingArray = [];
        let ratingMatchArray = [];
        let ratingNotEqualsArray = [];
        let ratingNull = [];
        let showNull = [];
        // runtime variables
        let runTimeArray = [];
        let lessThanTime = [];
        let greaterThanTime = [];
        let result = false;
        while(counter < numKeys)
        {
            key = keys[counter];
            value = decodeURIComponent(query[key]);
            if(key.startsWith("release"))
            {
                result = releaseDateHandler(key, value, releaseDateArrayGtLt, releaseDateArrayEq, releaseDateArrayNe, greaterThanDate, lessThanDate);
                if(!result[0])
                {
                    console.log(result[1]);
                }
            }
            else if(key.startsWith("title"))
            {
                result = titleHandler(key, value, titleEqualsValue, titleContainsArray);
                if(!result[0])
                {
                    console.log(result[1]);
                }
            }
            else if(key.startsWith("director"))
            {
                result = directorHandler(key, value, directorContainsArray, directorEqualsArray);
                if(!result[0])
                {
                    console.log(result[1]);
                }
            }
            else if(key.startsWith("rating"))
            {
                result = ratingHandler(key, value, ratingMatchArray, ratingNotEqualsArray, ratingNull, showNull);
                if(!result[0])
                {
                    console.log(result[1]);
                }
            }
            else if(key.startsWith("runtime"))
            {
                result = runTimeHandler(key, value, runTimeArray, lessThanTime, greaterThanTime);
                if(!result[0])
                {
                    console.log(result[1]);
                }
            }
            else
            {
                // not always a issue...
                console.log(key + " is not a valid query parameter");
            }
            counter = counter + 1;
        }

        // returns value in releaseDateArray
        generateReleaseDateFilter(releaseDateArrayEq, releaseDateArrayNe, releaseDateArrayGtLt, lessThanDate, greaterThanDate, releaseDateArray);
        if(releaseDateArray.length > 0)
        {
            filters.push({releaseDate: {[Op.and]: releaseDateArray }});
        }
        generateTitleFilter(titleEqualsValue, titleArray, titleContainsArray);
        if(titleArray.length > 0)
        {
            filters.push(titleArray[0]);
        }
        generateDirectorFilter(directorEqualsArray, directorArray, directorContainsArray);
        if(directorArray.length > 0)
        {
            filters.push(directorArray[0]);
        }

        // if specifiying null or not null movies
        if(ratingNull.length > 0)
        {
            ratingArray.push({[Op.or]: ratingMatchArray});
            ratingArray.push({[Op.and]: ratingNotEqualsArray});
            ratingArray.push({[Op.and]: ratingNull});
            if(showNull[0])
            {
                filters.push({rating: {[Op.or]: ratingArray}});
            }
            else
            {
                filters.push({rating: {[Op.and]: ratingArray}});
            }
        }
        else
        {
            ratingArray.push({[Op.or]: ratingMatchArray});
            ratingArray.push({[Op.and]: ratingNotEqualsArray});
            filters.push({rating: {[Op.or]: ratingArray}});
        }
        if(greaterThanTime.length > 0 && lessThanTime.length > 0)
        {
            if(greaterThanTime[0] < lessThanTime[0])
            {
                filters.push({runTime: {[Op.and]: runTimeArray}});
            }
            else
            {
                filters.push({runTime: {[Op.or]: runTimeArray}});
            }
        }
        else if(greaterThanTime.length > 0 || lessThanTime.length > 0)
        {
            filters.push({runTime: {[Op.or]: runTimeArray}});
        }
        if(ids.length > 0)
        {
            filters.push({id: {[Op.in]: ids}});
        }

        return filters;
    }

    // function to generate the where values to get the movies
    // with the specified genres
    const genreWhereGenerator = (query) =>
    {
        let containsFilters = [];
        let keys = Object.keys(query);
        let numKeys = keys.length;
        let counter = 0;
        let key = "";
        let valueString = "";
        let genreContainsArray = [];

        while(counter < numKeys)
        {
            key = keys[counter];
            valueString = query[key];
            if(!key.startsWith("genre"))
            {
                counter = counter + 1;
                continue;
            }
            else
            {
                let values = valueString.split(",");
                values.forEach((value) => {
                    if(key === "genre_contains")
                    {
                        genreContainsArray.push({[Op.iLike]: value});
                    }
                });
            }
            counter = counter + 1;
        }

        if(genreContainsArray.length > 0)
        {
            containsFilters = [{value: {[Op.or]: genreContainsArray} }];
        }

        return containsFilters;
    }

    const sortGenerator = (query) =>
    {
        let sortingArray = [];
        let keys = Object.keys(query);
        let numKeys = keys.length;
        let counter = 0;
        let key = "";
        let valueString = "";

        while(counter < numKeys)
        {
            key = keys[counter];
            valueString = query[key];
            if(!key.startsWith("sort"))
            {
                counter = counter + 1;
                continue;
            }
            else
            {
                let values = valueString.split(",");
                values.forEach((value) => {
                    if(value === "release_date_asc")
                    {
                        sortingArray.push(['releaseDate', 'ASC'])
                    }
                    else if(value === "release_date_desc")
                    {
                        sortingArray.push(['releaseDate', 'DESC']);
                    }
                    else if(value === "title_asc")
                    {
                        sortingArray.push(['title', 'ASC']);
                    }
                    else if(value === "title_desc")
                    {
                        sortingArray.push(['title', 'DESC']);
                    }
                    else if(value === "runtime_asc")
                    {
                        sortingArray.push(['runTime', 'ASC']);
                    }
                    else if(value === "runtime_desc")
                    {
                        sortingArray.push(['runTime', 'DESC']);
                    }
                    else if(value === "rating_asc")
                    {
                        sortingArray.push(['rating', 'ASC']);
                    }
                    else if(value === "rating_desc")
                    {
                        sortingArray.push(['rating', 'DESC']);
                    }
                    else if(value === "director_asc")
                    {
                        sortingArray.push(['director', 'ASC']);
                    }
                    else if(value === "director_desc")
                    {
                        sortingArray.push(['director', 'DESC']);
                    }
                    else
                    {
                        console.log("Sorting value invalid");
                    }
                });
                // may want to check if multiple sort values found???
                break;
            }
            counter = counter + 1;
        }
        return sortingArray;
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
            //genre_contains: "Drama,Family"
            //sort=title_asc,release_date_desc

        };
        // first check to see if looking for specific genres
        let genreWhere = genreWhereGenerator(query);
        // movie ids that contain the genres
        let movieIds = [];
        // if genre filters
        if(genreWhere.length > 0)
        {
            // get the movies with the specified genres
            let movies = await Movie.findAll({
                attributes: ["id"],
                include: [
                    {
                        model: models.Genre,
                        as: "Genres",
                        attributes: ["value"],
                        through: {attributes: []},
                        where: genreWhere
                    }
                ],
            });
            // get the movie ids that contain that genre
            movies.forEach((movie) => {
                movieIds.push(movie.id);
            });
        }
        console.log("movie ids");
        console.log(movieIds);
        // generate the filters for all other options
        let whereQueries = whereGenerator(query, movieIds);
        let order = sortGenerator(query);
        let newquery = {[Op.and]: whereQueries};
        let params = {
            include: [
                {
                    model: models.Genre,
                    as: "Genres",
                    attributes: ["id", "value"],
                    through: {
                        attributes: [],
                        where: {}
                    }
                }
            ],
            order: order,
            where: newquery
        }

        let movies2 = await Movie.findAll(params);
        return movies2;
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
