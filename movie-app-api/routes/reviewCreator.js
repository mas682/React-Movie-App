import {validateIntegerParameter, validateStringParameter} from './globals.js';
import models, { sequelize } from '../src/models';


// function to create a review
// the body of the request should include:
// rating - the rating for the movie
// review - the review for the movie
// good - a comma seperated string of good tags
// bad - a comma seperated string of bad tags
const createReview = async (cookie, req, res) =>
{
    let userId = cookie.id;
    let requester = cookie.name;
    let rating = req.body.rating;
    let reviewText = req.body.review;
    let goodTags = req.body.goodTags;
    let goodTagStrings = req.body.goodTagStrings;
    let badTags = req.body.badTags;
    let badTagStrings = req.body.badTagStrings;
    let movieId = req.body.movie;
    // check to make sure the rating is a actual number
    let valid = validateIntegerParameter(res, rating, requester, "The rating for the review is invalid");
    if(!valid) return;
    // check the review itself
    valid = validateStringParameter(res, reviewText, 0, 6000, requester, "The review field is invalid");
    if(!valid) return;
    // check the movie id
    valid = validateIntegerParameter(res, movieId, requester, "The movie ID is invalid");
    if(!valid) return;
    // check the number of tags provided
    let goodTagCount = goodTags.length + goodTagStrings.length;
    valid = validateReviewTagCount(res, goodTagCount, requester, "More than 5 good tags were found");
    if(!valid) return;
    let badTagCount = badTags.length + badTagStrings.length;
    valid = validateReviewTagCount(res, goodTagCount, requester, "More than 5 bad tags were found");
    if(!valid) return;
    // check the goodTags passed
    valid = validateReviewTags(res, goodTags, requester);
    if(!valid) return;
    // check the badTags passed
    valid = validateReviewTags(res, badTags, requester);
    if(!valid) return;
    // check the goodTagStrings
    valid = validateReviewTagStrings(res, goodTagStrings, requester);
    if(!valid) return;
    // check the badTagStrings
    valid = validateReviewTagStrings(res, badTagStrings, requester);
    if(!valid) return;

    let review;
    try {
        review = await models.Review.create({
            rating: rating,
            userId: userId,
            review: reviewText,
            movieId: movieId
        });
    } catch(err)
    {
        let errorResult = reviewErrorHandler(err);
        res.status(errorResult.status).send({
            message: errorResult.message,
            requester: requester
        });
        return;
    }
    if(review === null)
    {
        // review creation failed, should just about never occur
        res.status(500).send({
            message: "Review creation failed for some unexpected reason",
            requester: requester
        });
    }
    else
    {
        let usedGoodTags = {};
        let usedBadTags = {};
        let warnings = {
            duplicate: false,
            tagCreationFailure: false,
            tagAlreadyAssociated: false,
            userNotFound: false,
            reviewNotFound: false,
            tagAssociationFailure: false,
            serverError: false
        };
        // add any good tag strings
        await addTagsToReview(goodTagStrings, "good", review, userId, usedGoodTags, warnings);
        let failed = validateAddTagResult(warnings, res, requester);
        if(failed) return;
        // add any bad tag strings
        await addTagsToReview(badTagStrings, "bad", review, userId, usedBadTags, warnings);
        failed = validateAddTagResult(warnings, res, requester);
        if(failed) return;
        // add any good tags with id's
        await addTagsToReview(goodTags, "good", review, userId, usedGoodTags, warnings);
        failed = validateAddTagResult(warnings, res, requester);
        if(failed) return;
        // add any bad tags with id's
        await addTagsToReview(badTags, "bad", review, userId, usedBadTags, warnings);
        failed = validateAddTagResult(warnings, res, requester);
        if(failed) return;
        let errorMessages = generateAddTagErrorMessages(warnings);
        console.log(warnings);
        res.status(201).send({
            message: "Review successfully created",
            requester: requester,
            errors: errorMessages
        });
    }
};

// function to validate tags that are passed to the server that have a id and value
const validateReviewTags = (res, tags, requester) =>
{
    let valid = true;
    // check the tags passed
    for(let tag of tags){
        // check the tag ID
        valid = validateIntegerParameter(res, tag.id, requester, "Invalid tag ID found");
        if(!valid) break;
        // check the tag value passed
        valid = validateStringParameter(res, tag.value, 1, 20, requester, "Invalid tag value found");
        if(!valid) break;
    };
    return valid;
};

// function to validate tags that are passed to the server that are just the value
const validateReviewTagStrings = (res, tags, requester) =>
{
    let valid = true;
    // check the tags passed
    for(let tag of tags)
    {
        valid = validateStringParameter(res, tag, 1, 20, requester, "Invalid tag value found");
    };
    return valid;
};

const validateReviewTagCount = (res, tagCount, requester, message) =>
{
    if(tagCount > 5)
    {
        res.status(400).send({
            message: message,
            requester: requester
        });
        return false;
    }
    return true;
};

// function to handle catch block of review creation or update
const reviewErrorHandler = (err) =>
{
    let status;
    let message;
    console.log("Error occured adding tag to review");
    let errorObject = JSON.parse(JSON.stringify(err));
    if(errorObject.name === "SequelizeForeignKeyConstraintError")
    {
        if(errorObject.original.constraint === "reviews_userId_fkey" || errorObject.original.constraint === "ReviewBadTags_userId_fkey")
        {
            status = 401;
            message = "User associated with the review does not exist";
        }
        else if(errorObject.original.constraint === "reviews_movieId_fkey")
        {
            status = 404;
            message = "Movie associated with the review does not exist";
        }
        else
        {
            console.log("Some unexpected constraint error occurred: " + errorObject.original.constraint);
            console.log(err);
            status = 500;
            message = "Some unexpected constraint error occurred on the server";
        }
    }
    else
    {
        console.log("Some unknown error occurred during posting a comment: " + errorObject.name);
        console.log(err);
        status = 500;
        message = "Some unexpected error occurred on the server";
    }
    return {status: status, message: message};
}

// function to add good tags to a review
// goodString is a comma seperarted string of good tags
// review is the review to add the tags to
// userId is user id of the author of the review
// usedTags is a object containing the tags that have been added already
// warnins is a object containing true/false values for what errors occurred
// ex. duplicate, tagCreationFailure, userNotFound, etc.
const addTagsToReview = async (tags, type, review, userId, usedTags, warnings) =>{
    /* for testing
    if(type !== "good" && typeof(tags) !== "string")
    {
        tags = [{id: 1, value: "test1"}, {id: 1, value: "test1"}]
    }
    */
    // iterate through the tags
    for(let tag of tags)
    {
        let tagValue = (typeof(tag) === "string") ? tag : tag.value;
        // if the tag was already added to the review on a previous iteration, skip to the next tag string
        if(usedTags.hasOwnProperty(tagValue))
        {
            warnings["duplicate"] = true;
            continue;
        }
        // remove getTagIds function above?
        // find the tag or create it if it does not exist
        let tagCreationResult = await findOrCreateTag(models, tag, review.id, type);
        let newTag = tagCreationResult.newTag;
        if(newTag === null || newTag === undefined)
        {
            warnings["tagCreationFailure"] = true;
            continue;
        }
        else if(tagCreationResult.tagAssocaionFound)
        {
            warnings["tagAlreadyAssociated"] = true;
            usedTags[newTag.value] = newTag.value;
            continue;
        }

        // then associate the tag with the review
        // need try catch here if one of the id's is deleted already...
        let associationResult = await createReviewTagAssociation(review, newTag.id, userId, type);
        if(!associationResult.successful)
        {
            let keys = Object.keys(associationResult);
            // add the new erros to the warning object
            for(let key of keys)
            {
                if(key === "successful" || key === "result") continue;
                warnings[key] = associationResult[key];
            }
            break;
        }
        let result = associationResult.result;
        if(result === undefined)
        {
            // if undefined I belive it means this already exists?
             warnings["tagAlreadyAssociated"] = true;
        }
        else
        {
            // add the tag to the used tags
            usedTags[newTag.value] = newTag.value;
        }
    };
};

// tag is the value of the tag
// reviewId is a reviews Id to associate with the tag
// type if good or bad
// function creates a tag or finds it and returns a boolean with the tag
// indicating if the review is associated with the tag
const findOrCreateTag = async (models, tag, reviewId, type) =>{
    // boolean to send back to indicate if the the tag either was not created or a association exists
    let tagAssocaionFound = false;
    let result;
    // find the tag or create it if it does not exist
    if(typeof(tag) === "string")
    {
        result = await models.MovieTag.findOrCreateByValue(models, tag, reviewId, type);
    }
    else
    {
        // the type of the tag is a object with {value: "tagValue", id: tagId(int)}
        result = await models.MovieTag.findOrCreateById(models, tag, reviewId, type);
    }
    let newTag;
    // if the tag is already associated with the review
    if(!result[1])
    {
        let reviewCount = (type === "good") ? result[0].dataValues.goodReviews.length : result[0].dataValues.badReviews.length;
        if(reviewCount > 0)
        {
            tagAssocaionFound = true;
        }
    }
    if(result !== undefined && result !== null)
    {
        newTag = result[0].dataValues;
    }
    return {tagAssocaionFound: tagAssocaionFound, newTag: newTag};
};


// function to associatie a tag with a review and user
const createReviewTagAssociation = async (review, tagId, userId, type) => {
    let result;
    let successful = true;
    let userNotFound = false;
    let reviewNotFound = false;
    let tagAssocaionFailure = false;
    let serverError = false;
    try {
        if(type === "good")
        {
            result = await review.addGoodTag(tagId, { through: {userId: userId }});
        }
        else
        {
            result = await review.addBadTag(tagId, { through: {userId: userId }});
        }
    } catch (err)
    {
        console.log("Error occured adding tag to review");
        let errorObject = JSON.parse(JSON.stringify(err));
        if(errorObject.name === "SequelizeForeignKeyConstraintError")
        {
            if(errorObject.original.constraint === "ReviewGoodTags_userId_fkey" || errorObject.original.constraint === "ReviewBadTags_userId_fkey")
            {
                userNotFound = true;
            }
            else if(errorObject.original.constraint === "ReviewGoodTags_reviewId_fkey" || errorObject.original.constraint === "ReviewBadTags_reviewId_fkey")
            {
                reviewNotFound = true;
            }
            else if(errorObject.original.constraint === "ReviewGoodTags_movieTagId_fkey" || errorObject.original.constraint === "ReviewBadTags_movieTagId_fkey")
            {
                tagAssocaionFailure = true;
            }
            else
            {
                serverError = true;
                console.log("Some unknown constraint error occurred: " + errorObject.original.constraint);
                console.log(err);
            }
        }
        else
        {
            serverError = true;
            console.log("Some unknown error occurred during posting a comment: " + errorObject.name);
            console.log(err);
        }
        successful = false;
    }
    return {successful: successful, result: result, userNotFound: userNotFound, reviewNotFound: reviewNotFound, tagAssocaionFailure: tagAssocaionFailure, serverError: serverError};
};


// function to check the results of the addTagsToReview functions and determine if it should
// continue to the next step
const validateAddTagResult = (warnings, res, requester) => {
     let message = "";
     let failed = false;
     let status;
     if(warnings.userNotFound)
     {
         failed = true;
         status = 401;
         // if user could not be found, review should not exist
         message = "User could not be found when associating tags with the review";
     }
     else if(warnings.reviewNotFound)
     {
         failed = true;
         status = 404;
         message = "Review could not be found when associating tags with the review";
     }
     if(failed)
     {
        res.status(status).send({
            message: message,
            requester: requester
        });
     }
     return failed;
}

// function to return an array of messages to send back to the client
// based off the tag creation results
const generateAddTagErrorMessages = (warnings) => {
    let errors = [];
    if(warnings.duplicate || warnings.tagAlreadyAssociated)
    {
        errors.push("Duplicate tag(s) were found during review creation");
    }
    if(warnings.tagCreationFailure)
    {
        errors.push("At least one tag was not able to be created.  Please try to add the tag again.");
    }
    else if(warnings.tagAssociationFailure)
    {
        errors.push("At least one tag could not be found when associating the tags with the review");
    }
    else if(warnings.serverError)
    {
        errors.push("There was a issue with the server when trying to add some or all of the tags to the review");
    }
    return errors;
}

export {createReview};
