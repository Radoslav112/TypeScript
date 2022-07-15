import { Person } from "./person";

function newFunc() :string {
    return "This is my new function message.";
}

console.log(newFunc());
let p = new Person("Ivan","Ivanov",49);
p.print();