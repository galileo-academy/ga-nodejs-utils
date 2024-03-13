/**
 *
 */
export interface IFileScannerOptions {
    readonly directory: string;
    readonly fileTypes: string[];
    readonly recursive: boolean;
}
export declare class FileScanner {
    private readonly options;
    private readonly filterFiletypes;
    constructor(options: IFileScannerOptions);
    /**
     *
     */
    scan(): string[];
    /**
     *
     * @param dir
     * @returns
     */
    private scanImpl;
}
