export class ApiError extends Error {
  code: number;

  constructor(message: string, code: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
