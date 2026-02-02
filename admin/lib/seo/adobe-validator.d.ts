declare module "@adobe/structured-data-validator" {
  export interface ValidationError {
    message: string;
    path?: string;
    property?: string;
    type?: string;
  }

  export interface ValidationWarning {
    message: string;
    path?: string;
    property?: string;
    recommendation?: string;
  }

  export interface ValidationResult {
    valid: boolean;
    errors?: ValidationError[];
    warnings?: ValidationWarning[];
  }

  export default class Validator {
    constructor(schema: unknown);
    validate(data: unknown): Promise<ValidationResult>;
    debug?: boolean;
  }
}
