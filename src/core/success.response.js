const statusCode = {
  OK: 200,
  CREATED: 201,
};

const reasonStatusCode = {
  OK: "OK",
  CREATED: "Created",
};

class SuccessResponse {
  constructor({
    message,
    code = statusCode.OK,
    reasonSC = reasonStatusCode.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonSC : message;
    this.statusCode = code;
    this.metadata = metadata;
  }

  send(res) {
    res.status(this.statusCode).json(this);
  }
}

export class OkResponse extends SuccessResponse {
  constructor({ message, metadata = {} }) {
    super({
      message,
      metadata,
    });
  }
}
export class CreatedResponse extends SuccessResponse {
  constructor({
    message,

    metadata = {},
  }) {
    super({
      message,
      statusCode: statusCode.CREATED,
      reasonStatusCode: reasonStatusCode.CREATED,
      metadata,
    });
  }
}
