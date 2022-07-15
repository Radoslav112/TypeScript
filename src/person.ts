export class Person {
    firstName: string;
    lastName: string;
    age: number;

    constructor(firstName: string, lastName: string, age: number){
        this.firstName=firstName;
        this.lastName=lastName;
        this.age=age; 
    }

    public print(){
        console.log(this.firstName + ' ' + this.lastName + ' ' + this.age);
    }
}