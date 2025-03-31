export class ApiError extends Error {
  statusCode: number;
  message: string;
  cause?: Error;

  constructor(statusCode: number, message: string, cause?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.cause = cause instanceof Error ? cause : new Error(String(cause));
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

  static fromError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(500, error.message, error);
    }

    return new ApiError(500, "Internal Server Error", new Error(String(error)));
  }

  static badRequest(message: string = "Bad Request", cause?: unknown): ApiError {
    return new ApiError(400, message, cause);
  }

  static unauthorized(message: string = "Unauthorized", cause?: unknown): ApiError {
    return new ApiError(401, message, cause);
  }

  static forbidden(message: string = "Forbidden", cause?: unknown): ApiError {
    return new ApiError(403, message, cause);
  }

  static notFound(message: string = "Not Found", cause?: unknown): ApiError {
    return new ApiError(404, message, cause);
  }

  static conflict(message: string = "Conflict", cause?: unknown): ApiError {
    return new ApiError(409, message, cause);
  }

  static internal(message: string = "Internal Server Error", cause?: unknown): ApiError {
    return new ApiError(500, message, cause);
  }
}
