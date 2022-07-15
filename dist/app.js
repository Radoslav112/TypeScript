"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const person_1 = require("./person");
function newFunc() {
    return "This is my new function message.";
}
console.log(newFunc());
let p = new person_1.Person("Ivan", "Ivanov", 49);
p.print();
