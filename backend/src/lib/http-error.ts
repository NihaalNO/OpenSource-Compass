export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Authentication is required") {
    super(401, "unauthorized", message);
  }
}

export class ConfigurationError extends HttpError {
  constructor(message: string) {
    super(500, "configuration_error", message);
  }
}

