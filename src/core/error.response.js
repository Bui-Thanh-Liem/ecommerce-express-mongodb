const statusCode = {
  FORBIDDEN: 403,
  BAD_REQUEST: 400,
  CONFLICT: 409,
};

const reasonStatusCode = {
  FORBIDDEN: "Forbidden error",
  BAD_REQUEST: "Bad request error",
  CONFLICT: "Conflict error",
};

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ConflictRequestError extends ErrorResponse {
  constructor(message = reasonStatusCode.CONFLICT, code = statusCode.CONFLICT) {
    super(message, code);
  }
}

export class ForbiddenRequestError extends ErrorResponse {
  constructor(
    message = reasonStatusCode.FORBIDDEN,
    code = statusCode.FORBIDDEN
  ) {
    super(message, code);
  }
}

export class BadRequestError extends ErrorResponse {
  constructor(
    message = reasonStatusCode.BAD_REQUEST,
    code = statusCode.BAD_REQUEST
  ) {
    super(message, code);
  }
}
