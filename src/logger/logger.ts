import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { format as _format, createLogger, transports as _transports } from "winston";
import winstonDaily from "winston-daily-rotate-file";


// logger dir
const logDir = join(__dirname, 'logs');

//If folder dosent exist make it.
if (!existsSync(logDir)) {
    mkdirSync(logDir);
}

/*
 * Log Level
 * error: 0, 
 * warn: 1, 
 * info: 2, 
 * http: 3, 
 * verbose: 4, 
 * debug: 5, 
 * silly: 6
 */


// Define log format
const logFormat = _format.printf(({ timestamp, level, message }) => `${timestamp}: ${level}: ${message}`);


const logger = createLogger({
    format: _format.combine(
      _format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      logFormat,
    ),
    transports: [
      // debug log setting
      new winstonDaily({
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/debug', // log file /logs/debug/*.log in save
        filename: `%DATE%.log`,
        maxFiles: 30, // 30 Days saved
        json: false,
        zippedArchive: true,
      }),
      // error log setting
      new winstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/error', // log file /logs/error/*.log in save
        filename: `%DATE%.log`,
        maxFiles: 30, // 30 Days saved
        handleExceptions: true,
        json: false,
        zippedArchive: true,
      }),
    ],
  });
  

  

  logger.add(
    new _transports.Console({
      format: _format.combine(_format.splat(), _format.colorize()),
    }),
  );
  
  const stream = {
    write: (message: string) => {
      logger.info(message.substring(0, message.lastIndexOf('\n')));
    },
  };
  
  
 export  {logger, stream};
  