import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;


// function to create an account
const signUp = (req, res, next) => {
    // if the username or email are not found, create the user
    // otherwise, do not create the user
    models.User.findOrCreate({where: {[Op.or]: [{username: req.body.username}, {email: req.body.email}]},
        defaults: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        }}
    ).then(([user, created]) => {
        if(created)
        {
            res.send("username has been created");
        }
        else
        {
            if(user.username == req.body.username)
            {
                res.send("username already in use");
            }
            else if(user.email == req.body.email)
            {
                res.send("email already in use");
            }
            else
            {
                res.send("some other error occurred");
            }
        }
    });
};

export {signUp};
