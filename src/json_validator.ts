import Ajv, { ValidateFunction } from "ajv";
import fs from "fs";

export interface IValidationResult {
    validatorFound: boolean;
    validationSuccess: boolean;
    errors: any[];
}

type LogFunc = (level: string, message: string) => void;

/**
 * 
 */
export class JsonValidator {

    private readonly validatorMap: Map<string,ValidateFunction<unknown>>;

    private constructor(validatorMap: Map<string,ValidateFunction<unknown>>) {
        this.validatorMap = validatorMap;
    }

    /**
     * 
     * @param key 
     * @returns 
     */
    hasValidatorForKey(key: string) {
        return this.validatorMap.has(key);
    }

    /**
     * 
     * @param validator 
     * @param object 
     */
    validateObject(validatorKey: string, data: any): IValidationResult {
        // Create a new ValidationResult object
        const result: IValidationResult = {
            validatorFound: true,
            validationSuccess: false,
            errors: []
        };

        // Get the validator from the validator map
        const validator = this.validatorMap.get(validatorKey);

        // If no validator was found, return the result with the validatorFound flag to false
        if(validator === undefined) {
            result.validatorFound = false;
            return result;
        }

        // Calidator the data
        const isValid = validator(data);

        // If the data was not valid, push the errors onto the result
        if(!isValid) {
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
    static fromSchemaFilePaths(schemaFilePaths: string[], feedback: LogFunc): JsonValidator {

        // Create a new instance of the AJV object
        const ajv = new Ajv();

        const commonMap = new Map<string,Object>();

        for(let i = 0; i < schemaFilePaths.length; i++) {
            // Get the filepath
            const filepath = schemaFilePaths[i];

            // Check if a file exists for the given path
            const exists = fs.existsSync(filepath);
            if(!exists) {
                feedback("warn", `No json schema found for path: ${filepath}! skipping...`);
                continue;
            }

            // Read the contents of the file and convert the contents to a json object
            const fileContents = fs.readFileSync(filepath, 'utf-8');
            const jsonSchema = JSON.parse(fileContents);

            // Get the title of the schema from the json object
            const schemaTitle = jsonSchema.title;

            // Check if a title was given, if not skip this json schema and log a warning
            if(schemaTitle === undefined) {
                feedback("warn", `No title found for json schema for path: ${filepath}! skipping...`);
                continue;
            }

            // Check if the validator already has an entry for the given title
            if(commonMap.has(schemaTitle)) {
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
        const validatorMap = new Map<string,ValidateFunction<unknown>>();

        let successCount = 0;
        let errorCount = 0;
        // Iterate through the commonMap entries
        for(const [schemaTitle,jsonSchema] of commonMap.entries()) {
            try {
                const validateFunc: ValidateFunction<unknown> = ajv.compile(jsonSchema);
                validatorMap.set(schemaTitle, validateFunc);
                feedback("log", `Added json validator schema: ${schemaTitle}`);
                successCount++;
            }
            catch(e) {
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