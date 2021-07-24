const express = require('express');
let router;


function createRouter() {
    router = express.Router();
    return router;
}


function getRouter() {
    return router;
}

module.exports.createRouter = createRouter;
module.exports.getRouter = getRouter;
