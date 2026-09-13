export type RepositoryErrorCode = "NOT_FOUND" | "FORBIDDEN" | "VALIDATION_ERROR" | "CONFLICT";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, message: string) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
  }
}
