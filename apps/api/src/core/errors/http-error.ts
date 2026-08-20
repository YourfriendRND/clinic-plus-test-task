export abstract class HttpError extends Error {
  public constructor(
    message: string,
    public readonly code: number,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
