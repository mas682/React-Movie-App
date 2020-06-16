import models, { sequelize } from '../src/models';
const Op = require('Sequelize').Op;

var express = require('express');
var router = express.Router();

router.post("/", function(req, res, next){
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
});

module.exports=router;
