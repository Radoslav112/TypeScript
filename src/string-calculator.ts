import { ErrorCode } from "./helpers/error-code";
import { escapeRegExp } from 'lodash';
import { ErrorCodeExeption } from "./helpers/error-code-exception";

export class StringCalculator {

    private numberList: string;
    private customSeparator: string;
    private errorMessage: string;
    private lastErrorCode: ErrorCode = null;
    private isUnexpectedEOLAdded: boolean = false;
    private map = new Map<ErrorCode, any>([
        [ErrorCode.CommaFound, () => {
            let position: number = this.getIndexOfUncexpectedSeparator();
            if (this.errorMessage.trim().length != 0) {
                this.errorMessage = this.errorMessage.concat('\n');
            }
            this.errorMessage = this.errorMessage.concat(`Number expected but \',\' found at position ${position}.`);
            this.lastErrorCode = ErrorCode.CommaFound;
        }],
        [ErrorCode.CustomSeparatorFound, () => {
            let position: number = this.getIndexOfUncexpectedSeparator();
            if (this.errorMessage.trim().length != 0) {
                this.errorMessage = this.errorMessage.concat('\n');
            }
            this.errorMessage = this.errorMessage.concat(`Number expected but \'${this.customSeparator}\' found at position ${position}.`);
            this.lastErrorCode = ErrorCode.CustomSeparatorFound;
        }],
        [ErrorCode.EndOfLineFound, () => {
            let position: number = this.getIndexOfUncexpectedSeparator();
            if (this.errorMessage.trim().length != 0) {
                this.errorMessage = this.errorMessage.concat('\n');
            }
            this.errorMessage = this.errorMessage.concat(`Number expected but \'\\n\' found at position ${position}.`);
            this.lastErrorCode = ErrorCode.EndOfLineFound;
        }],
        [ErrorCode.LastNumberMissed, () => {
            if (!this.isUnexpectedEOLAdded) {
                if (this.errorMessage.trim().length != 0) {
                    this.errorMessage = this.errorMessage.concat('\n');
                }
                this.errorMessage = this.errorMessage.concat(`Number expected but EOF found.`);
                this.isUnexpectedEOLAdded = true;
            }
            this.lastErrorCode = ErrorCode.LastNumberMissed;
        }],
        [ErrorCode.NegativeNumber, (number: string) => {
            if (this.lastErrorCode === ErrorCode.NegativeNumber) {
                this.errorMessage = this.errorMessage.concat(", " + number);
            } else {
                if (this.errorMessage.trim().length != 0) {
                    this.errorMessage = this.errorMessage.concat('\n');
                }
                this.errorMessage = this.errorMessage.concat(`Negative not allowed : ` + number);
            }
            this.lastErrorCode = ErrorCode.NegativeNumber;
        }],
        [ErrorCode.NumberNotNumeric, (number: string) => {
            let unexpectedChar = this.getUnexpectedChar(number);
            let position = this.numberList.indexOf(unexpectedChar);

            if (this.errorMessage.trim().length != 0) {
                this.errorMessage = this.errorMessage.concat('\n');
            }
            this.errorMessage = this.errorMessage.concat(`'${this.customSeparator}' expected but '${unexpectedChar}' found at position ${position}.`)

            this.lastErrorCode = ErrorCode.NumberNotNumeric;
        }]
    ]);

    public summation(numberList: string): string {
        this.numberList = numberList;

        if (!this.numberList) {
            return "0";
        }

        let result: number = 0;
        let separatorRegex = this.formSeparatorRegex();
        let listOfNumbers: string[] = this.numberList.split(new RegExp(separatorRegex));

        listOfNumbers.forEach(number => {
            try {
                this.checkForErrors(number);
                result += Number(number);
            } catch (error) {
                if(error instanceof ErrorCodeExeption) {
                    this.map.get(error.getErrorCode());
                }
            }
        });


        if (this.errorMessage) {
            return this.errorMessage;
        }
        return result.toString();
    }

    private formSeparatorRegex(): string {
        let res = ',|\n';
        if (this.numberList.includes("//")) {
            this.customSeparator = this.getCustomSeparator();
            res = escapeRegExp(this.customSeparator);
            this.numberList = this.numberList.substring(this.customSeparator.length + 3); // remove custom separator from number list, must add 3 because the separator start from the third char
        }

        return res;
    }

    private getCustomSeparator(): string {
        let beginOfSep: number = this.numberList.indexOf("//"); // if there is no "//" in number list the position will be -1 (falsy)
        let endOfSep: number = this.numberList.indexOf("\n");
        if (beginOfSep) {
            beginOfSep += 2; // make position of separator start after "//"
            return this.numberList.substring(beginOfSep, endOfSep);
        }

        return "";
    }

    private checkForErrors(number: string) {
        this.isNumberNegative(number);
        this.isNumberMissed(number);
        this.isNumberNumeric(number);
    }

    private isNumberNegative(number: string) {
        if (number.startsWith("-")) {
            throw new ErrorCodeExeption(ErrorCode.NegativeNumber);
        }
    }

    private isNumberMissed(number: string) {
        if (!number) {
            if (this.numberList.includes(",,") || this.numberList.includes("\n,")) {
                throw new ErrorCodeExeption(ErrorCode.CommaFound);
            }
            if (this.numberList.includes(",\n") || this.numberList.includes("\n\n")) {
                throw new ErrorCodeExeption(ErrorCode.EndOfLineFound);
            }
            if (this.customSeparator && this.numberList.includes(this.customSeparator.concat(this.customSeparator))) {
                throw new ErrorCodeExeption(ErrorCode.CustomSeparatorFound);
            }
            if (this.numberList.endsWith(",") || this.numberList.endsWith("\n") || (this.numberList.endsWith(this.customSeparator) && this.customSeparator.trim().length != 0)) {
                throw new ErrorCodeExeption(ErrorCode.LastNumberMissed);
            }
        }
    }

    private isNumberNumeric(number: string) {
        if (!(/^\d+?(\.\d+)?$/.test(number))) {
            throw new ErrorCodeExeption(ErrorCode.NumberNotNumeric);
        }
    }

    private getIndexOfUncexpectedSeparator(): number {
        if(this.customSeparator) {
            return this.numberList.indexOf(this.customSeparator.concat(this.customSeparator)) + 1;
        }
        if (this.numberList.includes(',\n')) {
            return this.numberList.indexOf(',\n') + 1;
        }
        if (this.numberList.includes('\n\n')) {
            return this.numberList.indexOf('\n\n') + 1;
        }
        if (this.numberList.includes(",,")) {
            return this.numberList.indexOf(",,") + 1;
        }
        if (this.numberList.includes("\n,")) {
            return this.numberList.indexOf("\n,") + 1;
        }
    }

    private getUnexpectedChar(number: string): string {
        let chars: string[] = number.split(/\d+?(\.\d+)?/).filter(Boolean);
        let unexpectedChar: string = "";
        chars.forEach(char => {
            try {
                this.isNumberNumeric(char);
            } catch (Error) {
                if (Error instanceof ErrorCodeExeption) {
                    unexpectedChar = char;
                }
            }
        });

        return unexpectedChar;
    }
}