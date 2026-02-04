export class ErrorResponseDTO {
    message: string;
    statusCode: number;
    timestamp: string;
    path?: string;
  
    constructor(message: string, statusCode: number = 500, path?: string) {
      this.message = message;
      this.statusCode = statusCode;
      this.timestamp = new Date().toISOString();
      this.path = path;
    }
  }
  
  // Validation Error DTO
  export class ValidationErrorResponseDTO extends ErrorResponseDTO {
    errors: string[];
  
    constructor(errors: string[], path?: string) {
      super('Validation failed', 400, path);
      this.errors = errors;
    }
  }