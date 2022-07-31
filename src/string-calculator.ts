import { CommaFoundException } from "./helpers/comma-found-exception";
import { CustomSeparatorFoundException } from "./helpers/custom-separator-found-exception";
import { EndOfLineFoundException } from "./helpers/eol-found-exception";
import { LastNumberMissedException } from "./helpers/last-number-exception";
import { NegativeNumberException } from "./helpers/negative-number-exception";
import { NumberNotNumericException } from "./helpers/number-not-numberic-exception";

export class StringCalculator{

    public summation(numberList:string): string {

        if(numberList.length=="".length){
            return "0";
        }

        let regex = this.createRegex(numberList);
        let listOfNumbers: string[] = numberList.split(regex);
        
        listOfNumbers.forEach(number => {
            try{
                this.checkForErros(numberList,number);
            } catch(Error) {
                if(Error instanceof CommaFoundException) {

                } else if(Error instanceof CustomSeparatorFoundException) {

                } else if(Error instanceof EndOfLineFoundException) {

                } else if(Error instanceof LastNumberMissedException) {

                } else if(Error instanceof NegativeNumberException) {

                } else if(Error instanceof NumberNotNumericException) {

                }
            }
        });

        return "";
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
        if(!number.match("\\d+?\\.?\\d*")) {
            throw new NumberNotNumericException();
        }        
    }

    private isLastNumberEmpty(numberList: string) {
        const customSep = this.getCustomSeparator(numberList);
        if(numberList.endsWith(",")||numberList.endsWith("\n")||(numberList.endsWith(customSep)&&customSep.trim().length!=0)) {
            throw new LastNumberMissedException();
        }
    }
}