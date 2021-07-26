var winston = require('winston');
const { format } = require('winston');
require('winston-daily-rotate-file');
const moment = require('moment');

const LEVEL = Symbol.for('level');
console.log(LEVEL);


const levels = {
  error: 0,
  warn: 1,
  info: 2,
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
  http: 'cyan',
  debug: 'grey',
}

winston.addColors(colors)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)


function fileFormat(levels) {
    return winston.format.combine(
        filterOnly(levels),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.printf(info =>
             `${JSON.stringify({timestamp: info.timestamp, level: info.level, message: info.message})}`
        )
    );
}

//Log only the messages the match `level`.
function filterOnly(levels) {
    // info is the message and it's related information
    return format(function (info) {
        // if the message is of type level, return it
        console.log(info[LEVEL])
        if (levels.includes(info[LEVEL])) {
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
        maxFiles: '30',
        level: 'error'
    }),
    // logs for the requests that come in
    new winston.transports.DailyRotateFile({
        dirname: './logs/RequestLogs',
        filename: 'requests-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30',
        level: 'http',
        format: fileFormat(['http']),
    }),
    // logs for anything else
    // may need to create multiple transports for this to cover
    new winston.transports.DailyRotateFile({
        dirname: './logs/InfoLogs',
        filename: 'movie-app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30',
        level: 'warn',
        // add a filter only here but let it be warn, info, debug
        format:filterOnly(['warn', 'info', 'debug'])
    })
]

console.log(moment(new Date()).add(360, 'minutes'));

const Logger = winston.createLogger({
  level: level(),
  levels,
//  format,
  transports,
})

export default Logger;
