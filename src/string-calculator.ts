export class StringCalculator{

    public summation(numberList:string): string {

        if(numberList.length=="".length){
            return "0";
        }

        let regex = this.createRegex(numberList);
        let listOfNumbers: string[] = numberList.split(regex);

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
        return numberList.substring(beginOfSep,endOfSep);
    }
}
