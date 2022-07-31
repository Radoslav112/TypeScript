export class CustomSeparatorFoundException extends Error {
    constructor(msg?: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, new.target.prototype);
    }
}