import 'winston-daily-rotate-file';
/**
 * Custom logger class using the winston npm package
 */
export declare class Logger<T> {
    private readonly logger;
    private readonly outputFile;
    private constructor();
    /**
     *
     * @param outputFile
     * @returns
     */
    static createLogger<T>(outputFile: string): Logger<T>;
    /**
     *
     * @param args
     */
    error(message: string, metadata: T): void;
    /**
     *
     * @param args
     */
    warn(message: string, metadata: T): void;
    /**
     *
     * @param args
     */
    info(message: string, metadata: T): void;
    /**
     *
     * @param args
     */
    debug(message: string, metadata: T): void;
    /**
     *
     */
    critical(message: string, metadata: T): void;
}
