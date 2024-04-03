"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const customLoggerLevels = {
    levels: {
        critical: 0,
        error: 1,
        warn: 2,
        info: 3,
        debug: 4,
    },
    colors: {
        critical: 'orange',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
    }
};
/**
 * Custom logger class using the winston npm package
 */
class Logger {
    constructor(loggerInstance, outputFile) {
        this.logger = loggerInstance;
        this.outputFile = outputFile;
    }
    /**
     *
     * @param outputFile
     * @returns
     */
    static createLogger(outputFile) {
        const winstonLogger = winston_1.default.createLogger({
            level: 'info',
            levels: customLoggerLevels.levels,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.metadata({ key: "meta", fillExcept: ['message', 'level', 'timestamp'] }), winston_1.default.format.simple()),
            transports: [
                // Add a console transport to log up to the debug log level
                new winston_1.default.transports.Console({
                    level: 'info',
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp }) => {
                        return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
                    }))
                }),
                // Add a daily rotator file transport
                new winston_1.default.transports.DailyRotateFile({
                    dirname: "./logs",
                    filename: `${outputFile}-%DATE%.log`,
                    datePattern: "YYYY-MM-DD",
                    zippedArchive: true,
                    maxSize: "20m",
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.metadata({ key: "metadata", fillExcept: ['message', 'level', 'timestamp'] }), winston_1.default.format.json())
                })
            ]
        });
        winston_1.default.addColors(customLoggerLevels.colors);
        // TODO: when a ciritcal log was logged, send an email or something to notify the developers of the critical error!
        return new Logger(winstonLogger, outputFile);
    }
    /**
     *
     * @param args
     */
    error(message, metadata) {
        this.logger.log("error", message, metadata);
    }
    /**
     *
     * @param args
     */
    warn(message, metadata) {
        this.logger.log("warn", message, metadata);
    }
    /**
     *
     * @param args
     */
    info(message, metadata) {
        this.logger.log("info", message, metadata);
    }
    /**
     *
     * @param args
     */
    debug(message, metadata) {
        this.logger.log("debug", message, metadata);
    }
    /**
     *
     */
    critical(message, metadata) {
        this.logger.log("critical", message, metadata);
    }
}
exports.Logger = Logger;
