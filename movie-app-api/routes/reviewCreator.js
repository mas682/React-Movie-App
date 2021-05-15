import {validateIntegerParameter, validateStringParameter} from './globals.js';
import models, { sequelize } from '../src/models';


// function to run all the checks when a new review comes in or if a review update comes in
const validateReviewParameters = (res, requester, userId, rating, reviewText, goodTags, goodTagStrings, badTags, badTagStrings, movieId, checkReviewId, reviewId, updateReview) =>
{
    // check to make sure the rating is a actual number
    let valid = validateIntegerParameter(res, rating, requester, "The rating for the review is invalid", 0, 5);
    if(!valid) return valid;
    // check the review itself
    valid = validateStringParameter(res, reviewText, 0, 6000, requester, "The review field is invalid");
    if(!valid) return valid;
    if(!updateReview)
    {
        // check the movie id
        valid = validateIntegerParameter(res, movieId, requester, "The movie ID is invalid");
        if(!valid) return valid;
    }
    // check the number of tags provided
    let goodTagCount = goodTags.length + goodTagStrings.length;
    valid = validateReviewTagCount(res, goodTagCount, requester, "More than 5 good tags were found");
    if(!valid) return valid;
    let badTagCount = badTags.length + badTagStrings.length;
    valid = validateReviewTagCount(res, goodTagCount, requester, "More than 5 bad tags were found");
    if(!valid) return valid;
    // check the goodTags passed
    valid = validateReviewTags(res, goodTags, requester);
    if(!valid) return valid;
    // check the badTags passed
    valid = validateReviewTags(res, badTags, requester);
    if(!valid) return valid;
    // check the goodTagStrings
    valid = validateReviewTagStrings(res, goodTagStrings, requester);
    if(!valid) return valid;
    // check the badTagStrings
    valid = validateReviewTagStrings(res, badTagStrings, requester);
    if(!valid) return valid;
    // optional check: check the reviewId
    if(checkReviewId)
    {
        valid = validateIntegerParameter(res, reviewId, requester, "The review ID is invalid");
    }
    return valid;
}

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
    let valid = validateReviewParameters(res, requester, userId, rating, reviewText, goodTags, goodTagStrings, badTags, badTagStrings, movieId, false, undefined, false);
    if(!valid) return;

    let review;
    try {
        review = await models.Review.findOrCreate({
            where: {
                userId: userId,
                movieId: movieId
            },
            defaults: {
                rating: rating,
                review: reviewText,
            }
        });
        // if the review was not created
        if(!review[1])
        {
            res.status(400).send({
                message: "A review for this movie by the current user already exists.",
                requester: requester
            });
            return;
        }
        review = review[0];
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
        let message = "Review creation failed for some unexpected reason.  Error code: 1101"
        // review creation failed, should just about never occur
        res.status(500).send({
            message: message,
            requester: requester
        });
        console.log(message);
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


// function to update a review
// body of request must include:
// movieId - movie to associate with the review
// rating - rating for movie
// review - review for movie
// reviewId - id of the review being updated
// goodTags - a array of objects containing {value: value, id: id} of existing tags
// badTags - a array of objects containing {value: value, id: id} of existing tags
// goodTagStrings - array of tag strings to add
// badTagStrings - array of tag strings to add
const updateReview = async (cookie, req, res) =>
{
    let userId = cookie.id;
    let requester = cookie.name;
    let rating = req.body.rating;
    let reviewText = req.body.review;
    let goodTags = req.body.goodTags;
    let goodTagStrings = req.body.goodTagStrings;
    let badTags = req.body.badTags;
    let badTagStrings = req.body.badTagStrings;
    let reviewId = req.body.reviewId;
    let valid = validateReviewParameters(res, requester, userId, rating, reviewText, goodTags, goodTagStrings, badTags, badTagStrings, undefined, true, reviewId, true);
    if(!valid) return;

    let review = await models.Review.findByIdForUpdate(models, reviewId);
    if(review === null || review === undefined || review.length < 1)
    {
        res.status(404).send({
            message: "Review could not be found",
            requester: requester
        });
        return;
    }
    review = review[0];
    if(userId !== review.userId)
    {
        res.status(401).send({
            message: "You cannot update another users review",
            requester: requester
        });
        return;
    }
    // may want to set a boolean client side to see if this changed at all for efficiency
    // otherwise, will just about always have to update..
    let reviewChange = (review.review.legnth === 0 && reviewText.length === 0) ? false : true;
    let result;
    if(reviewChange)
    {
        try
        {
            result = await review.update({
                review: reviewText,
                userId: userId,
                rating: rating
            });
        }
        catch(err)
        {
            let errorResult = reviewErrorHandler(err);
            res.status(errorResult.status).send({
                message: errorResult.message,
                requester: requester
            });
            return;
        }
        if(result === undefined || result === null)
        {
            // update should return a updated instance of the review
            res.status(404).send({
                message: "Review could not be found",
                requester: requester
            });
            return;
        }
    }
    // if here, the review exists and was successfully updated if applicable
    // now update the tags
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
    // get the tags to remove and the new ones to associate
    let newGoodTags = getTagsToUpdate(review.goodTags, goodTags, goodTagStrings, usedGoodTags, warnings);
    let newBadTags = getTagsToUpdate(review.badTags, badTags, badTagStrings, usedBadTags, warnings);
    // remove any tags that should no longer be associated
    if(newGoodTags.tagsToRemove.length > 0)
    {
        // returns the number of associations removed
        // if the number is off, it means the association didn't exist so nothing to worry about
        // if the review does not exist, it will return 0 as well
        await review.removeGoodTags(newGoodTags.tagsToRemove);
    }
    if(newBadTags.tagsToRemove.length > 0)
    {
        await review.removeBadTags(newBadTags.tagsToRemove);
    }
    // add any good tag strings
    await addTagsToReview(newGoodTags.newTagStrings, "good", review, userId, usedGoodTags, warnings);
    let failed = validateAddTagResult(warnings, res, requester);
    if(failed) return;
    // add any bad tag strings
    await addTagsToReview(newBadTags.newTagStrings, "bad", review, userId, usedBadTags, warnings);
    failed = validateAddTagResult(warnings, res, requester);
    if(failed) return;
    // add any good tags with id's
    await addTagsToReview(newGoodTags.newTagsWithId, "good", review, userId, usedGoodTags, warnings);
    failed = validateAddTagResult(warnings, res, requester);
    if(failed) return;
    // add any bad tags with id's
    await addTagsToReview(newBadTags.newTagsWithId, "bad", review, userId, usedBadTags, warnings);
    failed = validateAddTagResult(warnings, res, requester);
    if(failed) return;
    let errorMessages = generateAddTagErrorMessages(warnings);
    console.log(warnings);
    let updatedReview = await models.Review.findByIdWithLikes(models, review.id, userId);
    if(updatedReview === null || updatedReview === undefined || updatedReview.length < 1)
    {
        updatedReview = undefined;
    }
    else
    {
        updatedReview = updatedReview[0];
    }
    // create the output so the user Id is not sent
    let output = {
            id: updatedReview.dataValues.id,
            rating: updatedReview.dataValues.rating,
            review: updatedReview.dataValues.review,
            movieId: updatedReview.dataValues.movieId,
            createdAt: updatedReview.dataValues.createdAt,
            updatedAt: updatedReview.dataValues.updatedAt,
            likeCount: updatedReview.dataValues.likeCount,
            liked: updatedReview.dataValues.liked,
            user: {
                username: updatedReview.dataValues.user.dataValues.username
            },
            goodTags: updatedReview.dataValues.goodTags,
            badTags: updatedReview.dataValues.badTags,
            movie: updatedReview.dataValues.movie
    };

    res.status(201).send({
        message: "Review successfully updated",
        review: output,
        requester: requester,
        errors: errorMessages
    });
};


// function to get the tags to remove and add to the review
// used to prevent duplicates, prevent tag associations that already exist from being attempted,
// and finds which existing tags to remove
// existingTags are the good or bad tags that already are assocaited with the review
// tags with id's are the tags passed in by the user that have ids
// tagStrings are the tags passed in by the user that are string values only
// usedTags keeps track of which tags are staying associated with the review
// warnings is used if there are duplicate tags
const getTagsToUpdate = (existingTags, tagsWithIds, tagStrings, usedTags, warnings) =>
{
    let tagsToRemove = {};
    // get all of the good tags that previously existed
    for(let tag of existingTags)
    {
        tagsToRemove[tag.value] = {value: tag.value, id: tag.id}
    }

    // hold the new tags with ID's to associate
    let newTagsWithId = [];
    for(let tag of tagsWithIds)
    {
        if(usedTags.hasOwnProperty(tag.value))
        {
            warnings.duplicate = true;
            continue;
        }
        // if the tag previously existed, remove it from the tagsToRemove
        if(tagsToRemove.hasOwnProperty(tag.value))
        {
            usedTags[tag.value] = tag.value;
            delete tagsToRemove[tag.value]
            // 2 options: call function to remove 1 by 1
            // or try to remove all at once?
        }
        else
        {
            if(usedTags.hasOwnProperty(tag.value))
            {
                warnings.duplicate = true;
                continue;
            }
            // the tag did not exist, so add it to the array
            // should actually call function to add tag here...
            newTagsWithId.push(tag);
        }
    }

    let newTagStrings = [];
    for(let tag of tagStrings)
    {
        if(tagStrings.hasOwnProperty(tag))
        {
            usedTags[tag] = tag;
            delete tagsToRemove[tag]
        }
        else
        {
            if(usedTags.hasOwnProperty(tag))
            {
                warnings.duplicate = true;
                continue;
            }
            newTagStrings.push(tag);
        }
    }

    // get the id's of the tags to remove
    let tagsToRemoveKeys = Object.keys(tagsToRemove);
    let tagsToRemoveIds = [];
    for(let key of tagsToRemoveKeys)
    {
        let id = tagsToRemove[key].id;
        tagsToRemoveIds.push(id);
    }
    return {tagsToRemove: tagsToRemoveIds, newTagsWithId: newTagsWithId, newTagStrings: newTagStrings};
}

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
    console.log("Error occured during review creation or update");
    let errorObject = JSON.parse(JSON.stringify(err));
    if(errorObject.name === "SequelizeForeignKeyConstraintError")
    {
        if(errorObject.original.constraint === "reviews_userId_fkey")
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
            console.log("Some unexpected foreign key constraint error occurred (Error code: 1101): " + errorObject.original.constraint);
            console.log(err);
            status = 500;
            message = "Some unexpected constraint error occurred on the server. Error code: 1101";
        }
    }
    else if(errorObject.name === "SequelizeUniqueConstraintError")
    {
        if(errorObject.original.constraint === "reviews_userId_movieId_key")
        {
            status = 400;
            message = "A review for this movie by the current user already exists."
        }
        else
        {
            console.log("Some unexpected unique key constraint error occurred (Error code: 1102): " + errorObject.original.constraint);
            console.log(err);
            status = 500;
            message = "Some unexpected constraint error occurred on the server.  Error code: 1102";
        }
    }
    else
    {
        console.log("Some unknown error occurred (Error code: 1103): " + errorObject.name);
        console.log(err);
        status = 500;
        message = "Some unexpected error occurred on the server.  Error code: 1103";
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
        errors.push("Duplicate tag(s) were found during when associating them with the review");
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

export {createReview, updateReview};
