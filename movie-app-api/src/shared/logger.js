var winston = require('winston');
const { format } = require('winston');
require('winston-daily-rotate-file');
const LEVEL = Symbol.for('level');

let Logger;


const levels = {
    error: 0,
    warn: 1,
    info: 2,
    // only to be used to log requests/responses
    http: 3,
    debug: 4,
}

const level = () => {
    const env = process.env.NODE_ENV || 'dev';
    const isDevelopment = env === 'dev';
    return isDevelopment ? 'debug' : 'warn';
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'white',
  debug: 'grey',
}

winston.addColors(colors)

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(
        (info) =>{
            return getConsoleString(info)
        },
    ),
    winston.format.colorize({ all: true })
)

function getConsoleString(info) {
    if(info.level === 'error')
    {
        let message;
        if(typeof(info.message) === "object")
        {
            message = JSON.stringify({"message":info.message.message, "name":info.message.name}) + "\n" + info.message.stack;
        }
        else
        {
            message = info.message;
        }
        return `${info.timestamp}| ${info.level} | File: ${info.file} | Function: ${info.function} | Error code: ${info.errorCode} | Secondary code: ${info.secondaryCode} | ${message}`
    }
    else if(info.level === 'http')
    {
        // this is all for when debugging, not to be used in prod
        let obj = JSON.parse(info.message);
        let color = "";
        if(obj.type === 'response')
        {
            let status = parseInt(obj.status);
            if(status >= 200 && status < 400)
            {
                color = "\x1b[32m";
            }
            else if(status >= 400 && status < 500)
            {
                color = "\x1b[33m";
            }
            else
            {
                color = "\x1b[31m"
            }
            return `${info.timestamp}| ${color}Status: ${obj.status} | Method: ${obj.method} | `
            + `url: ${obj.url} | message: ${obj.message} | response time: ${obj.responseTime} | requester: ${obj.requesterId}`
            + `| ip: ${obj.ip} | request ID: ${obj.requestId}\n`
        }
        else
        {
            color = "\x1b[36m"
            return `${info.timestamp}| ${color}Method: ${obj.method} | url: ${obj.url} | requester: ${obj.requesterId}`
            + ` | ip: ${obj.ip} | request ID: ${obj.requestId}\n`
        }
    }
    else
    {
        return `${info.timestamp}: ${info.level}: ${info.message}`
    }
}


function fileFormat(levels) {
    return winston.format.combine(
        filterOnly(levels),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.json()
    );
}

function requestFormat(levels) {
    return winston.format.combine(
        filterOnly(levels),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.printf(info => {
            let str = (info.message.length > 1) ? info.message.substring(0, info.message.length - 1) : info.message;
            return `{"timestamp":"${info.timestamp}","message":${str}}`
        })
    );
}

//Log only the messages the match `level`.
function filterOnly(levels) {
    // info is the message and it's related information
    return format(function (info) {
        if(levels === undefined)
        {
            return info;
        }
        // if the message is of type level, return it
        else if (levels.includes(info[LEVEL])) {
            return info;
        }
        else
        {
            return false
        }
    })();
}

const transports = [
    new winston.transports.Console({
        format: consoleFormat
    }),
    // error logs
    new winston.transports.DailyRotateFile({
        dirname: './logs/ErrorLogs',
        filename: 'errors-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14',
        level: 'error',
        format: fileFormat(['error'])
    }),
    // logs for the requests that come in
    new winston.transports.DailyRotateFile({
        dirname: './logs/RequestLogs',
        filename: 'requests-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '3',
        level: 'http',
        format: requestFormat(['http']),
    }),
    // logs for anything else
    // may need to create multiple transports for this to cover
    new winston.transports.DailyRotateFile({
        dirname: './logs/InfoLogs',
        filename: 'movie-app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '7',
        level: 'warn',
        // add a filter only here but let it be warn, info, debug
        format:fileFormat(['warn', 'info', 'debug'])
    })
]

function createLogger()
{
    Logger = winston.createLogger({
        level: level(),
        levels,
        transports,
    });
}

function getLogger()
{
    return Logger;
}

module.exports.createLogger = createLogger;
module.exports.getLogger = getLogger;
