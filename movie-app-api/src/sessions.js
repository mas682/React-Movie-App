
import models, { sequelize } from '../src/models';
const moment = require('moment');
const config = require('../Config.json');



const createSession = async(user, req, res) =>
{
    res.locals.function = "regenerateSession";
    res.locals.file = "sessions.js";
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let duration = config.sessions.maxDuration * -1;
    req.session.userId = user.id;
    req.session.user = user.username;
    req.session.created = (moment(req.session.cookie._expires).add(duration, 'ms')).toDate();
    req.session.admin = user.admin;
    req.session.ip = ip;
    // get the number of minutes to subtract from the expiration
    let minutesToSubtract = (config.sessions.maxDurationMinutes - config.sessions.refreshMinutes) * -1;
    // _expires refers to when the cookie expires here
    // refreshAt is when the session should be regenerated, which is before the cookie will expire
    //req.session.refreshAt = moment(req.session.cookie._expires).add(minutesToSubtract, 'm').toDate();
    console.log(req.session);
    let expiration = moment(req.session.cookie._expires).toString();
    console.log("Session created: " + moment(req.session.created).toString());
    console.log("Session expires: " + expiration);
    //console.log("Refresh at: " + (moment(req.session.cookie._expires).add(minutesToSubtract, 'm')).toString());
    let newSession = await models.UserSessions.create({
        session: req.session.id,
        userId: user.id,
        expiresAt: req.session.cookie._expires
    });
    req.session.sessionId = newSession.id;
    console.log("New session id: " + req.session.sessionId);
    // save the session now so the session creation time is right
    await saveSession(req);
}


// function to check if a session needs to be regenerated
// const checkSession
const checkSession = async(req, res, next) =>
{
    let sessionUserId = req.session.userId;
    if(sessionUserId === undefined)
    {
        next();
        return;
    }
    //if(moment(req.session.refreshAt).isSame(moment()) || moment(req.session.refreshAt).isBefore(moment()))
    //{
    //    console.log("Regenerate session!");
    //    await regenerateSession(req, res);
    //}
    //else
    //{
        // this else is for testing...
        //console.log("Not refreshing");
        //console.log("Refreshes at: " + moment(req.session.refreshAt).toString());
        let date = moment();
        console.log("Current time: " + date.toString());
        console.log("Old session expires: " + moment(req.session.cookie._expires).toString());
        console.log("Session id: " + req.session.id);
        console.log("Session creation: " + req.session.created);
        console.log(req.session.cookie);
        // use this for non expiring sessions...
        //req.session.cookie.maxAge = 6000000;
//    }
    next();
}

/*
so redis has a command expires that will expire the key for you which is how connect-redis expires the keys...
you could create hash tables for users -> keys in redis but it would be hard to tell when the user no longer
has the session in the list

whenever a user requests their sessions check for them all...
if one does not exist remove it...
could also schedule a job to do cleanup in user lists every so often????
go through the user lists and see if the sessions exists...if not remove...
could be very costly though...

alternatives:...
use a actual database...


need to figure out how you are going to know which sessions belong to which users...
reverse look up table???
with new model, updating expires time constantly....very costly to update database each time
so either store in redis? or do something else

*/


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
    // may want to validate what ip this came from...
    let ip = req.session.ip;
    console.log("Old session expires: " + moment(req.session.cookie._expires).toString());

    await sessionGenerator(req);
    // at this point, have a session with a new id
    req.session.userId = sessionUserId;
    req.session.user = sessionUser;
    req.session.created = created;
    req.session.admin = admin;
    req.session.cookie.maxAge = config.sessions.maxDuration;
    // when the session should be refreshed
    let minutesToSubtract = (config.sessions.maxDurationMinutes - config.sessions.refreshMinutes) * -1;
    console.log("New session expires at: " + (moment(req.session.cookie._expires).toString()));
    console.log("Refresh at: " + (moment(req.session.cookie._expires).add(minutesToSubtract, 'm')).toString());
    req.session.refreshAt = (moment(req.session.cookie._expires).add(minutesToSubtract, 'm')).toDate();

    // need to delete the old session in the database and add the new one...
    console.log("Old session id: " + oldSessionId);
    let result = await models.UserSessions.destroy({
        where: {
            id:1
        }
    });
    if(result !== 1)
    {
        console.log("(Error code: 2100) Some unexpected result was returned when removing a users session: ");
        console.log(result);
    }

    let newSession = await models.UserSessions.create({
        session: req.session.id,
        userId: sessionUserId,
        expiresAt: req.session.cookie._expires
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




// may want to make this a reusable function to remove multiple sessions?
// const removeSession


// const getSessions

//




export {createSession, regenerateSession, checkSession};
