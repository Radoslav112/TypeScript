import { CommaFoundException } from "./helpers/comma-found-exception";
import { CustomSeparatorFoundException } from "./helpers/custom-separator-found-exception";
import { EndOfLineFoundException } from "./helpers/eol-found-exception";
import { LastNumberMissedException } from "./helpers/last-number-exception";
import { NegativeNumberException } from "./helpers/negative-number-exception";
import { NumberNotNumericException } from "./helpers/number-not-numberic-exception";

enum ErrorCode {
    CommaFoundErrorCode,
    CustomSeparatorFoundErrorCode,
    EndOfLineFoundErrorCode,
    LastNumberMissedErrorCode,
    NegativeNumberErrorCode,
    NumberNotNumericErrorCode
};

export class StringCalculator {

    private numberList: string;
    private customSep: string;
    private errorMessage: string;
    private lastErrorCode: ErrorCode = null;
    private isUnexpectedEOLAdded: boolean = false;
    private map = new Map<ErrorCode, any>([
        [ErrorCode.CommaFoundErrorCode, (): string => {
            let position: number = this.getIndexOfUnexpectedComma();
            if (this.errorMessage.trim().length != 0) {
                this.errorMessage = this.errorMessage.concat('\n');
            }
            this.errorMessage = this.errorMessage.concat(`Number expected but \',\' found at position ${position}.`);
            this.lastErrorCode = ErrorCode.CommaFoundErrorCode;
            return this.errorMessage;
        }],
        [ErrorCode.CustomSeparatorFoundErrorCode, (): string => {
            let position: number = this.getIndexOfUnexpectedCustomSeparator();
            if (this.errorMessage.trim().length != 0) {
                this.errorMessage = this.errorMessage.concat('\n');
            }
            this.errorMessage = this.errorMessage.concat(`Number expected but \'${this.customSep}\' found at position ${position}.`);
            this.lastErrorCode = ErrorCode.CustomSeparatorFoundErrorCode;
            return this.errorMessage;
        }],
        [ErrorCode.EndOfLineFoundErrorCode, (): string => {
            let position: number = this.getIndexOfUnexpectedEndOfLine();
            if (this.errorMessage.trim().length != 0) {
                this.errorMessage = this.errorMessage.concat('\n');
            }
            this.errorMessage = this.errorMessage.concat(`Number expected but \'\\n\' found at position ${position}.`);
            this.lastErrorCode = ErrorCode.EndOfLineFoundErrorCode;
            return this.errorMessage;
        }],
        [ErrorCode.LastNumberMissedErrorCode, (): string => {
            if (!this.isUnexpectedEOLAdded) {
                if (this.errorMessage.trim().length != 0) {
                    this.errorMessage = this.errorMessage.concat('\n');
                }
                this.errorMessage = this.errorMessage.concat(`Number expected but EOF found.`);
                this.isUnexpectedEOLAdded = true;
            }
            this.lastErrorCode = ErrorCode.LastNumberMissedErrorCode;
            return this.errorMessage;
        }],
        [ErrorCode.NegativeNumberErrorCode, (number: string): string => {
            if (this.lastErrorCode === ErrorCode.NegativeNumberErrorCode) {
                this.errorMessage = this.errorMessage.concat(", " + number);
            } else {
                if (this.errorMessage.trim().length != 0) {
                    this.errorMessage = this.errorMessage.concat('\n');
                }
                this.errorMessage = this.errorMessage.concat(`Negative not allowed : ` + number);
            }
            this.lastErrorCode = ErrorCode.NegativeNumberErrorCode;
            return this.errorMessage;
        }],
        [ErrorCode.NumberNotNumericErrorCode, (number: string): string => {
            let unexpectedChar = this.getUnexpectedChar(number);
            let position = this.numberList.indexOf(unexpectedChar);

            if (this.errorMessage.trim().length != 0) {
                this.errorMessage = this.errorMessage.concat('\n');
            }
            this.errorMessage = this.errorMessage.concat(`'${this.customSep}' expected but '${unexpectedChar}' found at position ${position}.`)

            this.lastErrorCode = ErrorCode.NumberNotNumericErrorCode;
            return this.errorMessage;
        }]
    ]);

    public summation(numberList: string): string {
        this.numberList = numberList;

        if (this.numberList.length === 0) {
            return "0";
        }

        let result: number = 0;
        let regexToSplitListIntoNumbers = this.createRegex();
        let listOfNumbers: string[] = this.numberList.split(new RegExp(regexToSplitListIntoNumbers));

        listOfNumbers.forEach(number => {

            let err: ErrorCode = this.checkForErrors(number);
            if(!err) {
                result += Number(number);
            }
            else {
                this.errorMessage = this.map.get(err);
            }

        });


        if (this.errorMessage) {
            return this.errorMessage;
        }
        return result.toString();
    }

    private createRegex(): string {
        let res = ',|\n';
        const _ = require('lodash');
        if (this.numberList.includes("//")) {
            let sep: string = this.getCustomSeparator();
            res = _.escapeRegExp(sep);
            this.customSep = sep;
            this.numberList = this.numberList.substring(sep.length + 3); // remove custom separator from number list
        }

        return res;
    }

    private getCustomSeparator(): string {
        let beginOfSep: number = this.numberList.indexOf("//") + 2;
        let endOfSep: number = this.numberList.indexOf("\n");
        if (beginOfSep != -1) {
            return this.numberList.substring(beginOfSep, endOfSep);
        }

        return "";
    }

    private checkForErrors(number: string):ErrorCode {
        let err: ErrorCode;
        
        err = this.isNumberNegative(number);
        if(err) {
            return err;
        }
        err = this.isNumberMissed(number);
        if(err) {
            return err;
        }
        err = this.isNumberNumeric(number);
        if(err) {
            return err;
        }
        return null;
    }

    private isNumberNegative(number: string): ErrorCode {
        if (number.startsWith("-")) {
            //throw new NegativeNumberException();
            return ErrorCode.NegativeNumberErrorCode;
        }
        return null;
    }

    private isNumberMissed(number: string) {
        if (number.trim().length == 0) {
            if (this.numberList.includes(",,") || this.numberList.includes("\n,")) {
                //throw new CommaFoundException();
                return ErrorCode.CommaFoundErrorCode;
            }
            if (this.numberList.includes(",\n") || this.numberList.includes("\n\n")) {
                //throw new EndOfLineFoundException();
                return ErrorCode.EndOfLineFoundErrorCode;
            }
            if (this.customSep && this.numberList.includes(this.customSep.concat(this.customSep))) {
                //throw new CustomSeparatorFoundException();
                return ErrorCode.CustomSeparatorFoundErrorCode;
            }
            if (this.numberList.endsWith(",") || this.numberList.endsWith("\n") || (this.numberList.endsWith(this.customSep) && this.customSep.trim().length != 0)) {
                //throw new LastNumberMissedException();
                return ErrorCode.LastNumberMissedErrorCode;
            }
        }

        return null;
    }

    private isNumberNumeric(number: string) {
        if (!(/^\d+?(\.\d+)?$/.test(number))) {
            //throw new NumberNotNumericException();
            return ErrorCode.NumberNotNumericErrorCode;
        }

        return null;
    }

    private getIndexOfUnexpectedComma(): number {
        if (this.numberList.includes(",,")) {
            return this.numberList.indexOf(",,") + 1;
        }

        return this.numberList.indexOf("\n,") + 1;
    }

    private getIndexOfUnexpectedCustomSeparator(): number {
        return this.numberList.indexOf(this.customSep.concat(this.customSep)) + 1;
    }

    private getIndexOfUnexpectedEndOfLine(): number {
        if (this.numberList.includes(',\n')) {
            return this.numberList.indexOf(',\n') + 1;
        }

        return this.numberList.indexOf("\n\n") + 1;
    }

    private getUnexpectedChar(number: string): string {
        let chars: string[] = number.split(/\d+?(\.\d+)?/).filter(Boolean);
        let unexpectedChar: string = "";
        chars.forEach(char => {
            try {
                this.isNumberNumeric(char);
            } catch (Error) {
                if (Error instanceof NumberNotNumericException) {
                    unexpectedChar = char;
                }
            }
        });

        return unexpectedChar;
    }
}