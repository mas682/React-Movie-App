
import models, { sequelize } from '../src/models';
const moment = require('moment');
const config = require('../Config.json');
const Op = require('Sequelize').Op;
let redisStore = require('../src/redisStore.js');
let redis = require('../src/redis.js');




const createSession = async(user, req, res, expires) =>
{
    res.locals.function = "createSession";
    res.locals.file = "sessions.js";
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
        req.session.cookie.maxAge = maxNonExpiringDuration;
    }
    console.log(req.session);
    let expiration = moment(req.session.cookie._expires).toString();
    console.log("Session created: " + moment(req.session.created).toString());
    console.log("Session expires: " + expiration);
    let newSession = await models.UserSessions.create({
        session: req.session.id,
        userId: user.id
    });
    req.session.sessionId = newSession.id;
    console.log("New session id in database: " + req.session.sessionId);
    // save the session now so the session creation time is right
    await saveSession(req);
}

const regenerateSession = async(req, res) =>
{
    res.locals.function = "regenerateSession";
    res.locals.file = "sessions.js";
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
    console.log("Old session expires: " + moment(req.session.cookie._expires).toString());

    await sessionGenerator(req);
    // at this point, have a session with a new id
    req.session.userId = sessionUserId;
    req.session.user = sessionUser;
    req.session.created = created;
    req.session.admin = admin;
    req.session.expires = expires;
    if(!expires)
    {
        req.session.cookie.maxAge = config.sessions.maxNonExpiringDuration;
    }
    // may not need this part?
    req.session.cookie.maxAge = config.sessions.maxExpiringDuration;
    // when the session should be refreshed
    console.log("New session expires at: " + (moment(req.session.cookie._expires).toString()));

    // need to delete the old session in the database and add the new one...
    console.log("Old session id: " + oldSessionId);
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

    let newSession = await models.UserSessions.create({
        session: req.session.id,
        userId: sessionUserId
    });
    req.session.sessionId = newSession.id;
    console.log("New session id: " + req.session.sessionId);
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

async function removePart2(client, sessions)
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
const removeAllSessions = async(req, res, userId, excluded) =>
{
    res.locals.function = "removeAllSessions";
    res.locals.file = "sessions.js";
    //1. get the users sessions
    let sessions = await models.UserSessions.findAll({
        where: {
            [Op.and]: [
                {userId: userId},
                {id: {[Op.notIn]: excluded}}
            ]
        }
    });
    console.log("Users sessions: ");
    console.log(sessions);
    let store = redisStore.getStore();
    let ses = await getSessions(store);
    console.log("All sessions: ");
    console.log(ses);
    //let removed = await removeSession(store, 'g08so2giZs7cRNBc29Qp68m9ith4-M_E');
    //console.log("Removal result: ");
    // returns 1 if removed, 0 if not there, error if something else happens
    //console.log(removed);

    let client = redis.getClient();
    let remove = ["sess:S8fNU2YjJaRdKaPGJRoCvo5H4Idt1w2L","sess:BYcU4dlrT1ykBwRY8dkUr9xV3QcjmvAb",
                    "sess:-MJYd-B5sVqBVIj7cxjz-1LItloAQ16P", "g08so2giZs7cRNBc29Qp68m9ith4-M_E"];
    // returns number of keys removed, if not found, 0 returned for value
    let result = await removePart2(client, remove);
    console.log("Removal result: ");
    console.log(result);
    //2. remove the sessions from redis
        // for deletion...you may want to delete multiple at a time so you
            // are doing less calls to redis
            // will save a little overhead...
            // but you may lose the 1/0 result that is output for each one..
            // but as long as no error may be fine..


    //3. try to remove the sessions that were successfully removed from redis from the db
    //4. make sure to inform of any errors...

}

// const getSessions

//




export {createSession, regenerateSession, removeAllSessions};
