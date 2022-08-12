import { CommaFoundException } from "./helpers/comma-found-exception";
import { CustomSeparatorFoundException } from "./helpers/custom-separator-found-exception";
import { EndOfLineFoundException } from "./helpers/eol-found-exception";
import { LastNumberMissedException } from "./helpers/last-number-exception";
import { NegativeNumberException } from "./helpers/negative-number-exception";
import { NumberNotNumericException } from "./helpers/number-not-numberic-exception";

export class StringCalculator{

    public summation(numberList:string): string {

        if(numberList.length===0){
            return "0";
        }

        let result:number = 0;
        let errorMessage:string = "";

        let regexToSplitListIntoNumbers = this.createRegex(numberList);
        let customSep: string = "";
        if(numberList.includes("//")){ //dont know how not to double the logic
            customSep = this.getCustomSeparator(numberList);
            numberList = numberList.substring(customSep.length+3); // remove custom separator from number list
        }

        let listOfNumbers: string[] = numberList.split(new RegExp(regexToSplitListIntoNumbers));
        let lastError: Error = null;
        let isUnexpectedEOLAdded: boolean = false;
        
        listOfNumbers.forEach(number => {
            try{
                this.checkForErros(numberList,number,customSep);
                result += Number(number);
            } catch(Error) {
                if(Error instanceof CommaFoundException) {
                    let position:number = this.getIndexOfUnexpectedComma(numberList);
                    if(errorMessage.trim().length!=0) {
                        errorMessage=errorMessage.concat('\n');
                    }
                    errorMessage=errorMessage.concat(`Number expected but \',\' found at position ${position}.`);
                    lastError = new CommaFoundException;

                } else if(Error instanceof CustomSeparatorFoundException) {
                    let position:number = this.getIndexOfUnexpectedCustomSeparator(numberList);
                    if(errorMessage.trim().length!=0) {
                        errorMessage=errorMessage.concat('\n');
                    }
                    errorMessage=errorMessage.concat(`Number expected but \'${customSep}\' found at position ${position}.`);
                    lastError = new CustomSeparatorFoundException;

                } else if(Error instanceof EndOfLineFoundException) {
                    let position:number = this.getIndexOfUnexpectedEndOfLine(numberList);
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
                    let position = numberList.indexOf(unexpectedChar);

                    if(errorMessage.trim().length!=0) {
                        errorMessage=errorMessage.concat('\n');
                    }
                    errorMessage=errorMessage.concat(`'${customSep}' expected but '${unexpectedChar}' found at position ${position}.`)

                    lastError = new NumberNotNumericException;
                }
            }
        });


        if(errorMessage.trim().length!=0) {
            return errorMessage;
        }
        return result.toString();
    }

    private createRegex(numberList: string): string {
        let res = ',|\n';
        if(numberList.includes("//")){
            let sep = this.getCustomSeparator(numberList);
            if(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(sep)) {
                res = "\\".concat(sep);
            } else {
                res = sep;
            }
        }

        return res;
    }
    
    private getCustomSeparator(numberList:string):string {
        let beginOfSep:number = numberList.indexOf("//")+2;
        let endOfSep:number = numberList.indexOf("\n");
        if(beginOfSep!=-1){
            return numberList.substring(beginOfSep,endOfSep);
        }
        
        return "";
    }

    private checkForErros(numberList: string, number: string, customSep: string) {
        this.isNumberNegative(number);
        this.isNumberMissed(numberList,number,customSep);
        this.isNumberNumeric(number);
    }

    private isNumberNegative(number: string) {
        if(number.startsWith("-")) {
            throw new NegativeNumberException();
        }        
    }

    private isNumberMissed(numberList: string, number: string, customSep: string) {
        if(number.trim().length == 0){
            if(numberList.includes(",,")||numberList.includes("\n,")) {
                throw new CommaFoundException();
            }
            if(numberList.includes(",\n")||numberList.includes("\n\n")) {
                throw new EndOfLineFoundException();
            }
            if(customSep.trim().length!=0 && numberList.includes(customSep.concat(customSep))){
                throw new CustomSeparatorFoundException();                
            }
            if(numberList.endsWith(",")||numberList.endsWith("\n")||(numberList.endsWith(customSep)&&customSep.trim().length!=0)) {
                throw new LastNumberMissedException();
            }
        }
    }

    private isNumberNumeric(number: string) {
        if(!(/^\d+?(\.\d+)?$/.test(number))) { //does not throw exception when number is not numeric example 2,3
            throw new NumberNotNumericException();
        }        
    }

    private getIndexOfUnexpectedComma(numberList:string) :number {
        if(numberList.includes(",,")) {
            return numberList.indexOf(",,")+1;
        }

        return numberList.indexOf("\n,")+1;
    }

    private getIndexOfUnexpectedCustomSeparator(numberList:string) :number {
        const customSep = this.getCustomSeparator(numberList);          //may throw err cuz custom separator is removed at one point from number list
        return numberList.indexOf(customSep.concat(customSep))+1;
    }

    private getIndexOfUnexpectedEndOfLine(numberList:string) :number {
        if(numberList.includes(',\n')) {
            return numberList.indexOf(',\n')+1;
        }

        return numberList.indexOf("\n\n")+1;
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