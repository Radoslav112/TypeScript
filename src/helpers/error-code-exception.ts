import { ErrorCode } from "./error-code";

export class ErrorCodeExeption extends Error {
    private errorCode: ErrorCode;
    constructor(errorCode:ErrorCode, msg?: string) {
        super(msg);
        this.errorCode=errorCode;

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, new.target.prototype);
    }

    public getErrorCode():ErrorCode {
        return this.errorCode;
    }
}