
const models = require('./sequelize.js').getClient().models;
const moment = require('moment');
const config = require('../../Config.json');
const Op = require('Sequelize').Op;
let redisStore = require('./redisStore.js');
let redis = require('./redis.js');


const createSession = async(user, req, res, expires) =>
{
    console.log("Creating session...")
    res.locals.function = "createSession";
    res.locals.file = "sessions.js";

    let counter = 0;
    let newSession;
    // try to generate the session up to 5 times if the session id is in use
    res.locals.regeneratingSession = true;
    while(counter < 5)
    {
        try{
            newSession = await models.UserSessions.create({
                session: req.session.id,
                userId: user.id
            });
            // break out of loop
            counter = 5;
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            if(errorObject.name === 'SequelizeUniqueConstraintError'
            && errorObject.original.constraint === "UserSessions_session_key"
            && counter < 4)
            {
                console.log("Regenerating session id as previous id was in use");
                await sessionGenerator(req);
            }
            else
            {
                counter = 5;
                throw err;
            }
        }
        counter = counter + 1;
    }
    res.locals.regenerateSession = false;
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let duration = config.sessions.maxExpiringDuration * -1;
    req.session.userId = user.id;
    req.session.user = user.username;
    req.session.created = (moment(req.session.cookie._expires).add(duration, 'ms')).toDate();
    req.session.admin = user.admin;
    req.session.expires = expires;
    req.session.ip = ip;
    // if the user wants a non expiring token
    if(!expires)
    {
        req.session.cookie.maxAge = config.sessions.maxNonExpiringDuration;
    }
    console.log(req.session);
    let expiration = moment(req.session.cookie._expires).toString();
    console.log("Session created: " + moment(req.session.created).toString());
    console.log("Session expires: " + expiration);
    req.session.sessionId = newSession.id;
    console.log("New session id in database: " + req.session.sessionId);
    // save the session now so the session creation time is right
    await saveSession(req);
}

const regenerateSession = async(req, res) =>
{
    console.log("Regenerating session...");
    res.locals.function = "regenerateSession";
    res.locals.file = "sessions.js";
    // used for error handling to keep track if session should be destroyed
    res.locals.regeneratingSession = true;
    // extract the values out of the session to put in the new session
    let sessionUserId = req.session.userId;
    if(sessionUserId === undefined) return;
    let sessionUser = req.session.user;
    let created = req.session.created;
    let admin = req.session.admin;
    let oldSessionId = req.session.sessionId;
    let expires = req.session.expires;
    // may want to validate what ip this came from...
    let ip = req.session.ip;

    // regenerate the session
    await sessionGenerator(req);

    let counter = 0;
    let newSession;
    // try to generate the session up to 5 times if the session id is in use
    while(counter < 5)
    {
        try{
            // store the new session in the database
            newSession = await models.UserSessions.create({
                session: req.session.id,
                userId: sessionUserId
            });
            // break out of loop
            counter = 5;
        }
        catch (err)
        {
            let errorObject = JSON.parse(JSON.stringify(err));
            if(errorObject.name === 'SequelizeUniqueConstraintError'
            && errorObject.original.constraint === "UserSessions_session_key"
            && counter < 4)
            {
                console.log("Regenerating session id as previous id was in use");
                await sessionGenerator(req);
            }
            else
            {
                counter = 5;
                throw err;
            }
        }
        counter = counter + 1;
    }

    // at this point, have a session with a new id
    req.session.userId = sessionUserId;
    req.session.user = sessionUser;
    req.session.created = created;
    req.session.admin = admin;
    req.session.expires = expires;
    req.session.sessionId = newSession.id;
    if(!expires)
    {
        req.session.cookie.maxAge = config.sessions.maxNonExpiringDuration;
    }
    // used for error handling to keep track if session should be destroyed
    res.locals.regeneratingSession = false;



    // need to delete the old session in the database
    let result = await models.UserSessions.destroy({
        where: {
            id:oldSessionId
        }
    });
    if(result !== 1)
    {
        console.log("(Error code: 2100) Some unexpected result was returned when removing a users session: ");
        console.log(result);
    }
}

async function destroySession(req)
{
    let promise = await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
                if(err)
                {
                    reject(err);
                }
                resolve();
            });
    })
    .catch((err) => {
        throw err;
    });
    return promise;
}

async function sessionGenerator(req)
{
    let promise = await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
                if(err)
                {
                    reject(err);
                }
                resolve();
            });
    })
    .catch((err) => {
        throw err;
    });
    return promise;
}

async function saveSession(req)
{
    let promise = await new Promise((resolve, reject) => {
        req.session.save((err) => {
                if(err)
                {
                    reject(err);
                }
                resolve();
            });
    })
    .catch((err) => {
        throw err;
    });
    return promise;
}

async function getSessions(store)
{
    let promise = await new Promise((resolve, reject) => {
        store.ids((err, keys) => {
                if(err)
                {
                    reject(err);
                }
                resolve(keys);
            });
    })
    .catch((err) => {
        throw err;
    });
    return promise;
}

// function to remove a single session
// store is the redisStore
async function removeSession(store, session)
{
    let promise = await new Promise((resolve, reject) => {
        store.destroy(session, (err, result) => {
                if(err)
                {
                    reject(err);
                }
                resolve(result);
            });
    })
    .catch((err) => {
        throw err;
    });
    return promise;
}

// function to remove multiple sessions from redis
// client is a client to redis
async function removeSessions(client, sessions)
{
    let promise = await new Promise((resolve, reject) => {
        client.del(sessions, (err, result) => {
                if(err)
                {
                    reject(err);
                }
                resolve(result);
            });
    })
    .catch((err) => {
        throw err;
    });
    return promise;
}

// remove all the sessions for a specific user
// userId is the id of the user whose session should be removed
// excluded is an array of session id's to not remove
//     - this is mainly for when regenerating a users session due to some account update
// returns number of sessions removed from redis
async function removeAllSessions(req, res, userId, excluded)
{
    res.locals.function = "removeAllSessions";
    res.locals.file = "sessions.js";
    let result = 0;
    // get the users sessions
    let sessions = await models.UserSessions.findAll({
        where: {
            [Op.and]: [
                {userId: userId},
                {session: {[Op.notIn]: excluded}}
            ]
        }
    });
    if(sessions.length > 0)
    {
        let sessionsToRemove = [];
        let dbSessionsToRemove = [];
        let store = redisStore.getStore();
        for(let session of sessions)
        {
            sessionsToRemove.push(store.prefix + session.session);
            dbSessionsToRemove.push(session.session);
        }
        console.log(sessionsToRemove);
        let client = redis.getClient();
        // returns the number of sessions removed
        let result = await removeSessions(client, sessionsToRemove);
        // remove the sessions from the database
        await models.UserSessions.destroy({
            where: {
                session: {[Op.in]: dbSessionsToRemove}
            }
        });
        return result;
    }
}

// const getSessions

//




export {createSession, regenerateSession, removeAllSessions, destroySession};
