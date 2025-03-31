export class ApiError extends Error {
  statusCode: number;
  message: string;
  cause?: Error;

  constructor(statusCode: number, message: string, cause?: Error) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.cause = cause;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  jsonObject() {
    return {
      error: {
        statusCode: this.statusCode,
        message: this.message,
        ...(this.cause && { cause: this.cause.message }),
      },
    };
  }

  static fromError(error: Error): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    return new ApiError(500, error.message || "Internal Server Error", error);
  }

  static badRequest(message: string = "Bad Request", cause?: Error): ApiError {
    return new ApiError(400, message, cause);
  }

  static unauthorized(message: string = "Unauthorized", cause?: Error): ApiError {
    return new ApiError(401, message, cause);
  }

  static forbidden(message: string = "Forbidden", cause?: Error): ApiError {
    return new ApiError(403, message, cause);
  }

  static notFound(message: string = "Not Found", cause?: Error): ApiError {
    return new ApiError(404, message, cause);
  }

  static conflict(message: string = "Conflict", cause?: Error): ApiError {
    return new ApiError(409, message, cause);
  }

  static internal(message: string = "Internal Server Error", cause?: Error): ApiError {
    return new ApiError(500, message, cause);
  }
}
