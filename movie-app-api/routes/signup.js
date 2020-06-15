var express = require('express');
var router = express.Router();

router.post("/", function(req, res, next){
    /*
    models.User.create(
        {
            username: req.body.firstName,
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        },
    );
    */
    res.send(req.body.email);
        /*
        .then(([user, created]) => {
            if(created)
            {
                res.send("Created user");
            }
            else
            {
                res.send("User already existed");
            }
            });
        */
});

module.exports=router;
