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
const skip = () => {
  const env = process.env.NODE_ENV || "dev";
  return env !== "dev";
};


const format = (morgan, req, res)=> {
    let status = morgan.status(req, res, 10);
    let result = {
        type: (status !== undefined) ? "response" : "request",
        method: morgan.method(req),
        url: morgan.url(req),
        status: status,
        responseTime: morgan['response-time'](req, res) + " ms",
        requestId: req.id,
        requesterId: (req.session !== undefined) ? req.session.userId : undefined,
        ip: morgan['remote-addr'](req),
        message: (status === 400 || status > 401) ? res.locals.message : undefined
    };
    // may have to change this if causing performance issues
    return JSON.stringify(result);
}

// middleware for logging requests as they come in
const morganRequestMiddleware = morgan(
  format,
  { stream, skip, immediate: true }
);


// middleware fo logging request responses
const morganResponseMiddleware = morgan(
  format,
  { stream, skip }
);

module.exports.morganRequestMiddleware = morganRequestMiddleware;
module.exports.morganResponseMiddleware = morganResponseMiddleware;
