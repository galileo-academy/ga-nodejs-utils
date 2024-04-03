import winston from "winston";
import 'winston-daily-rotate-file';

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
export class Logger<T> {

    private readonly logger: winston.Logger;
    private readonly outputFile: string;

    private constructor(loggerInstance: winston.Logger, outputFile: string) {
        this.logger = loggerInstance;
        this.outputFile = outputFile;
    }

    /**
     * 
     * @param outputFile 
     * @returns 
     */
    static createLogger<T>(outputFile: string): Logger<T> {

        const winstonLogger: winston.Logger = winston.createLogger({
            level: 'info',
            levels: customLoggerLevels.levels,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.metadata({ key: "meta", fillExcept: ['message', 'level', 'timestamp'] }),
                winston.format.simple()
            ),
            transports: [
                // Add a console transport to log up to the debug log level
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(({ level, message, timestamp }) => {
                          return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
                        })
                    )
                }),

                // Add a daily rotator file transport
                new winston.transports.DailyRotateFile({
                    dirname: "./logs",
                    filename: `${outputFile}-%DATE%.log`,
                    datePattern: "YYYY-MM-DD",
                    zippedArchive: true,
                    maxSize: "20m",
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.metadata({ key: "metadata", fillExcept: ['message', 'level', 'timestamp'] }),
                        winston.format.json()
                    )
                })
            ]
        });

        winston.addColors(customLoggerLevels.colors);

        // TODO: when a ciritcal log was logged, send an email or something to notify the developers of the critical error!

        return new Logger(winstonLogger, outputFile);
    }

    /**
     * 
     * @param args 
     */
    error(message: string, metadata: T) {
        this.logger.log("error", message, metadata);
    }

    /**
     * 
     * @param args 
     */
    warn(message: string, metadata: T) {
        this.logger.log("warn", message, metadata);
    }

    /**
     * 
     * @param args 
     */
    info(message: string, metadata: T) {
        this.logger.log("info", message, metadata);
    }

    /**
     * 
     * @param args 
     */
    debug(message: string, metadata: T) {
        this.logger.log("debug", message, metadata);
    }

    /**
     * 
     */
    critical(message: string, metadata: T) {
        this.logger.log("critical", message, metadata);
    }
}
