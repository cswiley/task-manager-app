export class ConditionalCheckFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConditionalCheckFailedError";
  }
}

export const isConditionalCheckFailedError = (
  error: unknown
): error is ConditionalCheckFailedError => {
  if (typeof error === "object" && error !== null && "name" in error) {
    return error.name === "ConditionalCheckFailedError";
  }
  return false;
};
