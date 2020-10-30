
import { Gender } from './interfaces.ts';

export default class Person {
    id: string;
    first_name: string;
    last_name: string;
    gender: Gender;
    age: number; 
    email: string; 
    phone: string;

    constructor(id: string, firstName: string, lastName: string,  
        gender: Gender, age:number,email: string, phone: string) {
      this.id = id;
      this.first_name = firstName;
      this.last_name = lastName;
      this.gender = gender;
      this.age = age;
      this.email = email;
      this.phone = phone;
    }    
}

