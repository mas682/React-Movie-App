import winston from 'winston'

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


const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const transports = [
  new winston.transports.Console({
      format: consoleFormat
  }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat
  }),
  new winston.transports.File({
      filename: `logs/${new Date().toLocaleDateString().replace(/\//g, '-')}.log`,
      format: fileFormat
  }),
]

const Logger = winston.createLogger({
  level: level(),
  levels,
//  format,
  transports,
})

export default Logger;
