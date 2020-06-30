// not sure if this is the best way to do this but this file
// holds variables that are needed specifically for the routing files


var express = require('express');
var cookieParser = require('cookie-parser');
var router = express.Router();
// used to sign the cookie
router.use(cookieParser('somesecrettosigncookie'));
export {router};
