const Logger = require('./logger.js').getLogger();
const models = require('./sequelize.js').getClient().models;
const moment = require('moment');
const config = require('../../Config.json');
const Op = require('sequelize').Op;
let redisStore = require('./redisStore.js');
let redis = require('./redis.js');
const session = require('express-session');


const createSession = async(user, req, res, expires, passwordResetSession) =>
{
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
    // if a password reset session, only good for one use
    if(passwordResetSession)
    {
        req.session.passwordResetSession = true;
        // boolean flag used to mark if session used yet
        req.session.active = true;
        req.session.cookie.maxAge = config.sessions.maxPasswordResetSessionDuration;
    }
    // if the user wants a non expiring token
    else if(!expires)
    {
        req.session.cookie.maxAge = config.sessions.maxNonExpiringDuration;
    }
    req.session.sessionId = newSession.id;
    // save the session now so the session creation time is right
    await saveSession(req, res);
}

// function to create a clean sesssion
// the regenerate function recreates a session so it is saved
// this function creates a new session entirely, but WILL BE SAVED WHETHER EDITED OR NOT
// calls next once finished
const createCleanSession = (req, res, next) =>
{
    // set the cookie options so the browser may remove the cookie
    // needs to match cookie for sessions
    let options = {
        httpOnly: true,
        // should be true
        secure: true,
        sameSite: 'lax',
        path: '/'
    }
    // mark the cookie as expired for now
    res.clearCookie(config.app.cookieName, options);
    // initialize session object, returns a function
    let result = session({
        secret: config.app.cookieKey,
        name: config.app.cookieName,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            // needs to be set to true to prevent javascript from accessing client side
            httpOnly: true,
            // should be true to help avoid man in the middle attacks
            secure: true,
            maxAge: config.sessions.maxExpiringDuration, // Time is in miliseconds,
            //domain: 'http://localhost:3000/',
            sameSite: 'lax'
        },
        store: redisStore.getStore(),
        resave: false
    });
    result(req, res, next);
}


const regenerateSession = async(req, res, restore, passwordResetSession) =>
{
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
    let resetSession = (passwordResetSession) ? req.session.passwordResetSession : undefined;
    // used to keep cookie age the same only for password reset sessions
    let expiresTime = (passwordResetSession) ? req.session.cookie._expires : undefined;
    // may want to validate what ip this came from...
    let ip = req.session.ip;

    // regenerate the session
    await sessionGenerator(req);

    // if restoring old session but just creating a new one
    // otherwise, just destroying old sesion
    if(restore)
    {
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
        req.session.sessionId = newSession.id;
        if(passwordResetSession)
        {
            req.session.passwordResetSession = resetSession;
            req.session.active = true;
            req.session.cookie.maxAge = expiresTime - new Date();
        }
        req.session.expires = expires;
        if(!expires && !passwordResetSession)
        {
            req.session.cookie.maxAge = config.sessions.maxNonExpiringDuration;
        }
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
        Logger.error("Some unexpected result was returned when removing a users session: " + result,
            {errorCode: 2100, function: "regenerateSession", file: "sessions.js", requestId: req.id});
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

async function saveSession(req, res)
{   
    // used for error handling
    res.locals.removeSession = true;
    let promise = await new Promise((resolve, reject) => {
        req.session.save((err) => {
                if(err)
                {
                    reject(err);
                }
                res.locals.removeSession = false;
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
        let client = redis.getClient();
        // returns the number of sessions removed
        result = await removeSessions(client, sessionsToRemove);
        // remove the sessions from the database
        await models.UserSessions.destroy({
            where: {
                session: {[Op.in]: dbSessionsToRemove}
            }
        });
        return result;
    }
}


// remove the current requests session
async function removeCurrentSession(req, res)
{
    res.locals.removeSession = true;
    res.locals.function = "removeCurrentSession";
    res.locals.file = "sessions.js";
    let result = 0;
    let dbSessionsToRemove = req.session.id;

    result = await destroySession(req);
    // set to false as session now destroyed
    // may still be in db but will get removed later
    res.locals.removeSession = false;
    // remove the sessions from the database
    await models.UserSessions.destroy({
        where: {session: dbSessionsToRemove}
    });
    return result;
}


// const getSessions

export {createSession, regenerateSession, removeAllSessions, destroySession, createCleanSession, removeCurrentSession, saveSession};
