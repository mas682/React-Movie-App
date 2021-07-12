const models = require('../src/sequelize.js').getClient().models;

// function to get information associated with the user who has the cookie
const getUserInfo = (req, res, next) => {
    let requester = (req.session.user === undefined) ? "" : req.session.user;
    // set which file the request is for
    res.locals.file = "getUserInfo";
    res.locals.function = "getUserInfo";
    // get the signed cookies in the request if there are any
    // if there is a signed cookie in the request
    if(requester !== "")
    {

        if(req.method === "GET")
        {
            // get the reviews and pass the cookie
            getUser(requester, res)
            .catch((err) => {next(err)});
        }
        else
        {
            res.status(404).send({
                message:"The getUserInfo path sent to the server does not exist",
                requester: requester
            });
        }
    }
    // if no cookie was found
    else
    {
        res.status(401).send({
            message: "You are not logged in",
            requester: ""
        });
    }
};

const getUser = async (requester, res) =>
{
    res.locals.function = "getUser";
    // find a user by their login
    let user = await models.Users.findByLogin(requester);
    // if the user was not found
    if(user === null)
    {
        res.status(401).send({
            requester: "",
            message: "Unable to find user associated with cookie",
        });
    }
    // if the user was found
    else
    {
        let userObj = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email
        };
        res.status(200).send({
            requester: requester,
            message: "User info successfully found",
            user: userObj
        });
    }
};

export {getUserInfo};
