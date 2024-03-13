import fs from 'fs';
import path from 'path';

/**
 * 
 */
export interface IFileScannerOptions {
    readonly directory: string;
    readonly fileTypes: string[];
    readonly recursive: boolean;
}

export class FileScanner {

    private readonly options: IFileScannerOptions;
    private readonly filterFiletypes: boolean;

    constructor(options: IFileScannerOptions) {
        this.options = options;
        this.filterFiletypes = options.fileTypes.length > 0;
    }

    /**
     * 
     */
    scan(): string[] {
        return this.scanImpl(this.options.directory);
    }

    /**
     * 
     * @param dir 
     * @returns 
     */
    private scanImpl(dir: string): string[] {
        const files: string[] = [];

        // Read all entries for our current directory
        const entries = fs.readdirSync(dir, {withFileTypes: true});
        
        // Loop trough all the found entries
        for(const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            // Check if the entry is a directory and if the reccursive flag has beens set
            if(entry.isDirectory() && this.options.recursive) {
                // If so, recusrivly call this function
                const nestedFiles = this.scanImpl(fullPath);
                // And push all the found files for that directory onto our current array of files
                files.push(...nestedFiles);
            }
            else {
                // Check if we need to filter file types
                if(this.filterFiletypes) {
                    // Get the file extension from the filepath
                    const ext = path.extname(fullPath);

                    // If the extension is not part of our filetypes, we skip
                    if(!this.options.fileTypes.includes(ext)) continue;
                }
                
                // Push the path to the array of files
                files.push(fullPath);
            }
        }

        // Return the found files
        return files;
    }
}