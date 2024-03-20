export interface IValidationResult {
    validatorFound: boolean;
    validationSuccess: boolean;
    errors: any[];
}
type LogFunc = (level: string, message: string) => void;
type ValidationFunction = (data: any) => IValidationResult;
/**
 *
 */
export declare class JsonValidator {
    private readonly validatorMap;
    private constructor();
    /**
     *
     * @param key
     * @returns
     */
    hasValidatorForKey(key: string): boolean;
    /**
     *
     * @param validator
     * @param object
     */
    validateObject(validatorKey: string, data: any): IValidationResult | undefined;
    /**
     *
     */
    getValidatorForSchema(schemaKey: string): ValidationFunction | undefined;
    private static _validateObject;
    /**
     *
     * @param schemaFilePaths
     * @returns
     */
    static fromSchemaFilePaths(schemaFilePaths: string[], feedback: LogFunc): JsonValidator;
}
export {};
