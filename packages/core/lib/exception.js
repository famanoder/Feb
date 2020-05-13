export const EXCEPTION = Symbol('http:exception');

export class Exception extends Error {
  constructor(code, msg) {
    super(...arguments);
    this.name = EXCEPTION;
    this.code = code;
    this.message = msg;
    this.stack = (new Error()).stack;
  }
}

export class BadRequestException extends Exception {
  constructor(msg) {
    super(400, msg || '[400] bad request exception');
  }
}

export class UnauthorizedException extends Exception {
  constructor(msg) {
    super(401, msg || '[401] unauthorized exception');
  }
}

export class ForbiddenException extends Exception {
  constructor(msg) {
    super(403, msg || '[403] forbidden exception');
  }
}

export class NotFoundException extends Exception {
  constructor(msg) {
    super(404, msg || '[404] not found exception');
  }
}

export class NotAcceptableException extends Exception {
  constructor(msg) {
    super(406, msg || '[406] not acceptable exception');
  }
}

export class RequestTimeoutException extends Exception {
  constructor(msg) {
    super(408, msg || '[408] request timeout exception');
  }
}

export class ConflictException extends Exception {
  constructor(msg) {
    super(409, msg || '[409] conflict exception');
  }
}

export class GoneException extends Exception {
  constructor(msg) {
    super(410, msg || '[410] gone exception');
  }
}

export class PayloadTooLargeException extends Exception {
  constructor(msg) {
    super(413, msg || '[413] payload too large exception');
  }
}

export class UnsupportedMediaTypeException extends Exception {
  constructor(msg) {
    super(415, msg || '[415] unsupported media type exception');
  }
}

export class UnprocessableException extends Exception {
  constructor(msg) {
    super(415, msg || '[415] unprocessable exception');
  }
}

export class InternalServerErrorException extends Exception {
  constructor(msg) {
    super(500, msg || '[500] internal server error exception');
  }
}

export class NotImplementedException extends Exception {
  constructor(msg) {
    super(501, msg || '[501] not implemented exception');
  }
}

export class BadGatewayException extends Exception {
  constructor(msg) {
    super(502, msg || '[502] bad gateway exception');
  }
}

export class ServiceUnavailableException extends Exception {
  constructor(msg) {
    super(503, msg || '[503] service unavailable exception');
  }
}

export class GatewayTimeoutException extends Exception {
  constructor(msg) {
    super(504, msg || '[504] gateway timeout exception');
  }
}