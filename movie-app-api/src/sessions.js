
import models, { sequelize } from '../src/models';
const moment = require('moment');
import {encrypt, decrypt} from '../src/crypto.js';
const config = require('../Config.json');



const createSession = async(user, req) =>
{
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let duration = config.sessions.maxDuration * -1;
    req.session.userId = user.id;
    req.session.user = user.username;
    req.session.created = (moment(req.session.cookie._expires).add(duration, 'ms')).toDate();
    req.session.admin = user.admin;
    // get the number of minutes to subtract from the expiration
    let minutesToSubtract = (config.sessions.maxDurationMinutes - config.sessions.refreshMinutes) * -1;
    // _expires refers to when the cookie expires here
    // refreshAt is when the session should be regenerated, which is before the cookie will expire
    req.session.refreshAt = moment(req.session.cookie._expires).add(minutesToSubtract, 'm').toDate();
    console.log(req.session);
    let expiration = moment(req.session.cookie._expires).toString();
    console.log("Cookie created: " + moment(req.session.created).toString());
    console.log("Cookie expires: " + expiration)
    console.log("Refresh at: " + (moment(req.session.cookie._expires).add(minutesToSubtract, 'm')).toString());
    // encrypt the session to store in the database
    let encryptedRes = encrypt(req.session.id, "session");
    console.log(encryptedRes);
    await models.UserSessions.create({
        session: encryptedRes.encryptedData,
        iv: encryptedRes.iv,
        userId: user.id,
        expiresAt: req.session._expires
    });
}

// function to check if a session needs to be regenerated
// const checkSession


// const regenerateSession
/* see movies.js...
let sessionUserId = req.session.userId;
let sessionUser = req.session.user;
let created = req.session.created;
let admin = req.session.admin;
let expires = req.session.expires;
// _expires here refers to when the cookie was created
console.log(moment(req.session._expires).toString());
let movies = await models.FeaturedMovies.getMovies(models);
let maxage = req.session.cookie.originalMaxAge;
req.session.regenerate(() => {

    console.log(requester);
    if(requester !== "")
    {
        req.session.userId = sessionUserId;
        req.session.user = sessionUser;
        req.session.created = created;
        req.session.admin = admin;
        // when the session should be refreshed
        req.session.refreshAt = (moment(req.session._expires).add(1,'m')).toDate();
        //req.session._expires = moment(new Date()).add(2, 'h');
        req.session.cookie.originalMaxAge = 600000;
    }
    //need to determine if just using maxAge is okay as setting expires works both times..
    console.log(req.session);
    // see what the new cookie expires at value should be
    console.log("Cookie expires: " + (moment(req.session._expires).add(600000,'ms')).toString());
    console.log("Refresh at: " + (moment(req.session._expires).add(1,'m')).toString())
    // returns an empty array if no movies found that are associated with the user even if the userid doesn't exist
    res.status(200).send({
        message: "Featured movies successfully found",
        requester: requester,
        movies: movies
    });

})


*/


// may want to make this a reusable function to remove multiple sessions?
// const removeSession


// const getSessions

//




export {createSession};
