"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValidator = void 0;
const ajv_1 = __importDefault(require("ajv"));
const fs_1 = __importDefault(require("fs"));
/**
 *
 */
class JsonValidator {
    constructor(validatorMap) {
        this.validatorMap = validatorMap;
    }
    /**
     *
     * @param key
     * @returns
     */
    hasValidatorForKey(key) {
        return this.validatorMap.has(key);
    }
    /**
     *
     * @param validator
     * @param object
     */
    validateObject(validatorKey, data) {
        // Get the validator from the validator map
        const validator = this.getValidatorForSchema(validatorKey);
        // If no validator was found, return undefined
        if (validator === undefined) {
            return undefined;
        }
        // Return the result of the validator function
        return validator(data);
    }
    /**
     *
     */
    getValidatorForSchema(schemaKey) {
        // Get the validator from the validator map
        return this.validatorMap.get(schemaKey);
    }
    static _validateObject(validator, data) {
        // Create a new ValidationResult object
        const result = {
            validatorFound: true,
            validationSuccess: false,
            errors: []
        };
        // Calidator the data
        const isValid = validator(data);
        // If the data was not valid, push the errors onto the result
        if (!isValid) {
            result.errors.push(validator.errors);
        }
        // Else we set the validationSuccess flag to true
        else {
            result.validationSuccess = true;
        }
        // Return the final result
        return result;
    }
    /**
     *
     * @param schemaFilePaths
     * @returns
     */
    static fromSchemaFilePaths(schemaFilePaths, feedback) {
        // Create a new instance of the AJV object
        const ajv = new ajv_1.default();
        const commonMap = new Map();
        for (let i = 0; i < schemaFilePaths.length; i++) {
            // Get the filepath
            const filepath = schemaFilePaths[i];
            // Check if a file exists for the given path
            const exists = fs_1.default.existsSync(filepath);
            if (!exists) {
                feedback("warn", `No json schema found for path: ${filepath}! skipping...`);
                continue;
            }
            // Read the contents of the file and convert the contents to a json object
            const fileContents = fs_1.default.readFileSync(filepath, 'utf-8');
            const jsonSchema = JSON.parse(fileContents);
            // Get the title of the schema from the json object
            const schemaTitle = jsonSchema.title;
            // Check if a title was given, if not skip this json schema and log a warning
            if (schemaTitle === undefined) {
                feedback("warn", `No title found for json schema for path: ${filepath}! skipping...`);
                continue;
            }
            // Check if the validator already has an entry for the given title
            if (commonMap.has(schemaTitle)) {
                feedback("warn", `Duplicate schema title '${schemaTitle}' for path: ${filepath}! skipping...`);
                continue;
            }
            // Add the schema to the common map
            commonMap.set(schemaTitle, jsonSchema);
            feedback("log", `Found json schema '${schemaTitle}' in '${filepath}'`);
        }
        // Add all the found schema's as a common schema to the ajv instance
        commonMap.forEach((schema, key) => ajv.addSchema(schema, `#${key}`));
        // Create a validator map
        const validatorMap = new Map();
        let successCount = 0;
        let errorCount = 0;
        // Iterate through the commonMap entries
        for (const [schemaTitle, jsonSchema] of commonMap.entries()) {
            try {
                const validateFunc = ajv.compile(jsonSchema);
                validatorMap.set(schemaTitle, (data) => JsonValidator._validateObject(validateFunc, data));
                feedback("log", `Added json validator schema: ${schemaTitle}`);
                successCount++;
            }
            catch (e) {
                feedback("error", `Error while compiling json schema validator function: ${e}`);
                errorCount++;
            }
        }
        feedback("info", `Found ${commonMap.size} schemas...`);
        feedback("info", `Added ${successCount} schemas.`);
        feedback("info", `${errorCount} schema's resulted in errors.`);
        // Return a new instance of the JsonValidator
        return new JsonValidator(validatorMap);
    }
}
exports.JsonValidator = JsonValidator;
