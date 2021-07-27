import morgan from "morgan";
import Logger from "./logger";

// Override the stream method by telling
// Morgan to use our custom logger instead of the console.log.
const stream ={
  // Use the http severity
  write: (message) => {
      Logger.http(message)
  },
};

// Skip all the Morgan http log if the
// application is not running in development mode.
// This method is not really needed here since
// we already told to the logger that it should print
// only warning and error messages in production.
const skip = () => {
  const env = process.env.NODE_ENV || "dev";
  return env !== "dev";
};

const format = (morgan, req, res)=> {
    //console.log("HERE")
    //console.log(morgan);
    let method = morgan.method(req);
    let url = morgan.url(req);
    let status = morgan.status(req, res, 10);
    let responseTime = morgan['response-time'](req, res);
    let requester = undefined;
    if(req.session !== undefined)
    {
        requester = req.session.userId;
    }
    let result = {
        method: method,
        url: url,
        status: status,
        responseTime: responseTime,
        requesterId: requester
    };
    return JSON.stringify(result);
}

// Build the morgan middleware
const morganMiddleware = morgan(
  format,
  //":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export default morganMiddleware;
