import { ErrorCode } from "./helpers/error-code";
import { escapeRegExp } from 'lodash';
import { ErrorCodeExeption } from "./helpers/error-code-exception";

export class StringCalculator {

    private numberList: string;
    private customSeparator: string;
    private errorMessages: string[] = [];
    private lastErrorCode: ErrorCode = null;
    private isUnexpectedEOLAdded: boolean = false;
    private map = new Map<ErrorCode, any>([
        [ErrorCode.CommaFound, (number: string) => {
            let position: number = this.getIndexOfUncexpectedSeparator();
            return `Number expected but \',\' found at position ${position}.`;
        }],
        [ErrorCode.CustomSeparatorFound, (number: string) => {
            let position: number = this.getIndexOfUncexpectedSeparator();
            return `Number expected but \'${this.customSeparator}\' found at position ${position}.`;
        }],
        [ErrorCode.EndOfLineFound, (number: string) => {
            let position: number = this.getIndexOfUncexpectedSeparator();
            return `Number expected but \'\\n\' found at position ${position}.`;
        }],
        [ErrorCode.LastNumberMissed, (number: string) => {
            if (!this.isUnexpectedEOLAdded) {
                this.isUnexpectedEOLAdded = true;
                return `Number expected but EOF found.`;
            }
        }],
        [ErrorCode.NegativeNumber, (number: string) => {
            if (this.lastErrorCode === ErrorCode.NegativeNumber) {
                return ", " + number;
            } else {
                return `Negative not allowed : ` + number;
            }
        }],
        [ErrorCode.NumberNotNumeric, (number: string) => {
            let unexpectedChar = this.getUnexpectedChar(number);
            let position = this.numberList.indexOf(unexpectedChar);
            return`'${this.customSeparator}' expected but '${unexpectedChar}' found at position ${position}.`;
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
                    const func = this.map.get(error.getErrorCode());
                    if(this.lastErrorCode === ErrorCode.NegativeNumber && error.getErrorCode() === ErrorCode.NegativeNumber){ //if last err i negative number and trown err is negative number we get into block
                        this.errorMessages[this.errorMessages.length-1] += func(number); //last error msg in errorMessages is negative number and we know this err is also negative number, so instead of pushing another ms we change last msg in array so it is complete when we are done
                    } else {
                        this.errorMessages.push(func(number));
                    }
                    this.lastErrorCode = error.getErrorCode();
                }
            }
        });


        if (this.errorMessages.length) {
            return this.errorMessages.join('\n');
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
        let beginOfSep: number;
        let endOfSep: number;
        if(this.numberList.startsWith("//")){
            beginOfSep=2; // beggining of separator is 2 because the custom separator starts after "//"
            endOfSep = this.numberList.indexOf("\n");
        } //if numberList does not start with "//" beginOfSep will remain undefined
         
        if (beginOfSep) {
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