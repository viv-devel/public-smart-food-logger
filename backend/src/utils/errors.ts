export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends CustomError {
  constructor(
    message: string = "Authentication failed",
    statusCode: number = 401,
  ) {
    super(message, statusCode);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = "Validation failed", statusCode: number = 400) {
    super(message, statusCode);
  }
}

export class NotFoundError extends CustomError {
  constructor(
    message: string = "Resource not found",
    statusCode: number = 404,
  ) {
    super(message, statusCode);
  }
}

export class FitbitApiError extends CustomError {
  constructor(message: string = "Fitbit API error", statusCode: number = 500) {
    super(message, statusCode);
  }
}

export class MethodNotAllowedError extends CustomError {
  constructor(
    message: string = "Method Not Allowed",
    statusCode: number = 405,
  ) {
    super(message, statusCode);
  }
}
