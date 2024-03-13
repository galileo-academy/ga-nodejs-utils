"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileScanner = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class FileScanner {
    constructor(options) {
        this.options = options;
        this.filterFiletypes = options.fileTypes.length > 0;
    }
    /**
     *
     */
    scan() {
        return this.scanImpl(this.options.directory);
    }
    /**
     *
     * @param dir
     * @returns
     */
    scanImpl(dir) {
        const files = [];
        // Read all entries for our current directory
        const entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
        // Loop trough all the found entries
        for (const entry of entries) {
            const fullPath = path_1.default.join(dir, entry.name);
            // Check if the entry is a directory and if the reccursive flag has beens set
            if (entry.isDirectory() && this.options.recursive) {
                // If so, recusrivly call this function
                const nestedFiles = this.scanImpl(fullPath);
                // And push all the found files for that directory onto our current array of files
                files.push(...nestedFiles);
            }
            else {
                // Check if we need to filter file types
                if (this.filterFiletypes) {
                    // Get the file extension from the filepath
                    const ext = path_1.default.extname(fullPath);
                    // If the extension is not part of our filetypes, we skip
                    if (!this.options.fileTypes.includes(ext))
                        continue;
                }
                // Push the path to the array of files
                files.push(fullPath);
            }
        }
        // Return the found files
        return files;
    }
}
exports.FileScanner = FileScanner;
