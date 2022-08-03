import { CommaFoundException } from "./helpers/comma-found-exception";
import { CustomSeparatorFoundException } from "./helpers/custom-separator-found-exception";
import { EndOfLineFoundException } from "./helpers/eol-found-exception";
import { LastNumberMissedException } from "./helpers/last-number-exception";
import { NegativeNumberException } from "./helpers/negative-number-exception";
import { NumberNotNumericException } from "./helpers/number-not-numberic-exception";

export class StringCalculator{

    public summation(numberList:string): string {

        if(numberList.length==0){
            return "0";
        }

        let result:number = 0;
        let errorMessage:string = "";

        let regex = this.createRegex(numberList);
        let customSep:string = this.getCustomSeparator(numberList);
        if(customSep.trim().length!=0) {
            numberList = numberList.substring(customSep.length+3); // remove custom separator from number list
        }

        let listOfNumbers: string[] = numberList.split(regex);
        let lastError: Error = null;
        let isUnexpectedEOLAdded: boolean = false;
        
        listOfNumbers.forEach(number => {
            try{
                this.checkForErros(numberList,number);
                result += Number(number);
            } catch(Error) {
                if(Error instanceof CommaFoundException) {
                    let position:number = this.getIndexOfUnexpectedComma(numberList);
                    errorMessage.concat('\nNumber expected but \',\' found at position ${position}.');
                    lastError = new CommaFoundException;

                } else if(Error instanceof CustomSeparatorFoundException) {
                    let position:number = this.getIndexOfUnexpectedCustomSeparator(numberList);
                    errorMessage.concat("\nNumber expected but \'${customSep}\' found at position ${position}.'");
                    lastError = new CustomSeparatorFoundException;

                } else if(Error instanceof EndOfLineFoundException) {
                    let position:number = this.getIndexOfUnexpectedEndOfLine(numberList);
                    errorMessage.concat("\nNumber expected but \'\\n\' found at position ${position}.'");
                    lastError = new LastNumberMissedException;

                } else if(Error instanceof LastNumberMissedException) {
                    if(!isUnexpectedEOLAdded) {
                        errorMessage.concat("\nNumber expected but EOF found.");
                        isUnexpectedEOLAdded = true;
                    }
                    lastError = new LastNumberMissedException;

                } else if(Error instanceof NegativeNumberException) {
                    if(lastError instanceof NegativeNumberException) {
                        errorMessage.concat(", "+number);
                    } else {
                        errorMessage.concat("\nNegative not allowed : ");
                    }

                    lastError = new NegativeNumberException;
                } else if(Error instanceof NumberNotNumericException) {
                    let unexpectedChar = this.getUnexpectedChar(number);
                    let position = numberList.indexOf(unexpectedChar);

                    errorMessage.concat("${sep}")

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
            if(
                sep==="."||sep==="+"||sep==="*"||sep==="?"||
                sep==="^"||sep==="$"||sep==="("||sep===")"||
                sep==="{"||sep==="}"||sep==="["||sep==="]"||
                sep==="|"||sep==="\\"
            ) {
                res = "\\".concat(sep);
            } else {
                res = sep;
            }
        }

        return res;
    }
    
    private getCustomSeparator(numberList:string):string {
        let beginOfSep:number = numberList.indexOf("//")+2;
        let endOfSep:number = numberList.indexOf("\\n");
        if(beginOfSep!=-1){
            return numberList.substring(beginOfSep,endOfSep);
        }
        
        return "";
    }

    private checkForErros(numberList: string, number: string) {
        this.isNumberNegative(number);
        this.isNumberMissed(numberList,number);
        this.isNumberNumeric(number);
        this.isLastNumberEmpty(numberList);
    }

    private isNumberNegative(number: string) {
        if(number.startsWith("-")) {
            throw new NegativeNumberException();
        }        
    }

    private isNumberMissed(numberList: string, number: string) {
        const customSep = this.getCustomSeparator(numberList);
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
        }
    }

    private isNumberNumeric(number: string) {
        if((/^\\d+?\\.?\\d*$/.test(number))) {
            throw new NumberNotNumericException();
        }        
    }

    private isLastNumberEmpty(numberList: string) {
        const customSep = this.getCustomSeparator(numberList);
        if(numberList.endsWith(",")||numberList.endsWith("\n")||(numberList.endsWith(customSep)&&customSep.trim().length!=0)) {
            throw new LastNumberMissedException();
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
        if(numberList.includes(",\n'")) {
            return numberList.indexOf(",\n")+1;
        }

        return numberList.indexOf("\n\n")+1;
    }

    private getUnexpectedChar(number:string) :string {
        let chars:string[] = number.split("");
        chars.forEach(char =>{
            try{
                this.isNumberNumeric(char);
            } catch (Error) {
                if(Error instanceof NumberNotNumericException) {
                    return char;
                }
            }
        });

        return null;
    }
}