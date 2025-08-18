export class RepositoryError extends Error {
  public readonly name: string;
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends RepositoryError {}
export class DuplicateError extends RepositoryError {}
export class DatabaseError extends RepositoryError {}
