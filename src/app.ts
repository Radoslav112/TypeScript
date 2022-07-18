import { Person } from "./person";
import { StringCalculator } from "./string-calculator";

function newFunc() :string {
    return "This is my new function message.";
}

console.log(newFunc());
let p = new Person("Ivan","Ivanov",49);
p.print();

let calculator = new StringCalculator();
console.log(calculator.summation(""));