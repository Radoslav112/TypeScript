import { CommaFoundException } from "./helpers/comma-found-exception";
import { CustomSeparatorFoundException } from "./helpers/custom-separator-found-exception";
import { EndOfLineFoundException } from "./helpers/eol-found-exception";
import { LastNumberMissedException } from "./helpers/last-number-exception";
import { NegativeNumberException } from "./helpers/negative-number-exception";
import { NumberNotNumericException } from "./helpers/number-not-numberic-exception";

export class StringCalculator{

    private numberList: string;
    private customSep: string;

    public summation(numberList:string): string {
        this.numberList = numberList;

        if(this.numberList.length===0){
            return "0";
        }

        let result:number = 0;
        let errorMessage:string = "";

        let regexToSplitListIntoNumbers = this.createRegex();

        let listOfNumbers: string[] = this.numberList.split(new RegExp(regexToSplitListIntoNumbers));
        let lastError: Error = null;
        let isUnexpectedEOLAdded: boolean = false;
        
        listOfNumbers.forEach(number => {
            try{
                this.checkForErrors(number);
                result += Number(number);
            } catch(Error) {
                if(Error instanceof CommaFoundException) {
                    let position:number = this.getIndexOfUnexpectedComma();
                    if(errorMessage.trim().length!=0) {
                        errorMessage=errorMessage.concat('\n');
                    }
                    errorMessage=errorMessage.concat(`Number expected but \',\' found at position ${position}.`);
                    lastError = new CommaFoundException;

                } else if(Error instanceof CustomSeparatorFoundException) {
                    let position:number = this.getIndexOfUnexpectedCustomSeparator();
                    if(errorMessage.trim().length!=0) {
                        errorMessage=errorMessage.concat('\n');
                    }
                    errorMessage=errorMessage.concat(`Number expected but \'${this.customSep}\' found at position ${position}.`);
                    lastError = new CustomSeparatorFoundException;

                } else if(Error instanceof EndOfLineFoundException) {
                    let position:number = this.getIndexOfUnexpectedEndOfLine();
                    if(errorMessage.trim().length!=0) {
                        errorMessage=errorMessage.concat('\n');
                    }
                    errorMessage=errorMessage.concat(`Number expected but \'\\n\' found at position ${position}.`);
                    lastError = new LastNumberMissedException;

                } else if(Error instanceof LastNumberMissedException) {
                    if(!isUnexpectedEOLAdded) {
                        if(errorMessage.trim().length!=0) {
                            errorMessage=errorMessage.concat('\n');
                        }
                        errorMessage=errorMessage.concat(`Number expected but EOF found.`);
                        isUnexpectedEOLAdded = true;
                    }
                    lastError = new LastNumberMissedException;

                } else if(Error instanceof NegativeNumberException) {
                    if(lastError instanceof NegativeNumberException) {
                        errorMessage=errorMessage.concat(", "+number);
                    } else {
                        if(errorMessage.trim().length!=0) {
                            errorMessage=errorMessage.concat('\n');
                        }
                        errorMessage=errorMessage.concat(`Negative not allowed : `+number);
                    }

                    lastError = new NegativeNumberException;
                } else if(Error instanceof NumberNotNumericException) {
                    let unexpectedChar = this.getUnexpectedChar(number);
                    let position = this.numberList.indexOf(unexpectedChar);

                    if(errorMessage.trim().length!=0) {
                        errorMessage=errorMessage.concat('\n');
                    }
                    errorMessage=errorMessage.concat(`'${this.customSep}' expected but '${unexpectedChar}' found at position ${position}.`)

                    lastError = new NumberNotNumericException;
                }
            }
        });


        if(errorMessage.trim().length!=0) {
            return errorMessage;
        }
        return result.toString();
    }

    private createRegex(): string {
        let res = ',|\n';
        const _ = require('lodash'); 
        if(this.numberList.includes("//")){
            let sep: string = this.getCustomSeparator();
            res = _.escapeRegExp(sep);
            this.customSep = sep;
            this.numberList = this.numberList.substring(sep.length+3); // remove custom separator from number list
        }

        return res;
    }
    
    private getCustomSeparator():string {
        let beginOfSep:number = this.numberList.indexOf("//")+2;
        let endOfSep:number = this.numberList.indexOf("\n");
        if(beginOfSep!=-1){
            return this.numberList.substring(beginOfSep,endOfSep);
        }
        
        return "";
    }

    private checkForErrors(number: string) {
        this.isNumberNegative(number);
        this.isNumberMissed(number);
        this.isNumberNumeric(number);
    }

    private isNumberNegative(number: string) {
        if(number.startsWith("-")) {
            throw new NegativeNumberException();
        }        
    }

    private isNumberMissed(number: string) {
        if(number.trim().length == 0){
            if(this.numberList.includes(",,")||this.numberList.includes("\n,")) {
                throw new CommaFoundException();
            }
            if(this.numberList.includes(",\n")||this.numberList.includes("\n\n")) {
                throw new EndOfLineFoundException();
            }
            if(this.customSep && this.numberList.includes(this.customSep.concat(this.customSep))){
                throw new CustomSeparatorFoundException();                
            }
            if(this.numberList.endsWith(",")||this.numberList.endsWith("\n")||(this.numberList.endsWith(this.customSep)&&this.customSep.trim().length!=0)) {
                throw new LastNumberMissedException();
            }
        }
    }

    private isNumberNumeric(number: string) {
        if(!(/^\d+?(\.\d+)?$/.test(number))) { //does not throw exception when number is not numeric example 2,3
            throw new NumberNotNumericException();
        }        
    }

    private getIndexOfUnexpectedComma() :number {
        if(this.numberList.includes(",,")) {
            return this.numberList.indexOf(",,")+1;
        }

        return this.numberList.indexOf("\n,")+1;
    }

    private getIndexOfUnexpectedCustomSeparator() :number {
        return this.numberList.indexOf(this.customSep.concat(this.customSep))+1;
    }

    private getIndexOfUnexpectedEndOfLine() :number {
        if(this.numberList.includes(',\n')) {
            return this.numberList.indexOf(',\n')+1;
        }

        return this.numberList.indexOf("\n\n")+1;
    }

    private getUnexpectedChar(number:string) :string {
        let chars:string[] = number.split(/\d+?(\.\d+)?/).filter(Boolean);
        let unexpectedChar:string = "";
        chars.forEach(char =>{
            try{
                this.isNumberNumeric(char);
            } catch (Error) {
                if(Error instanceof NumberNotNumericException) {
                    unexpectedChar = char;
                }
            }
        });

        return unexpectedChar;
    }
}