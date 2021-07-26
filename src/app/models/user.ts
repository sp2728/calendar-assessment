export class User {
    id:number;
    username: string;
    fullName:string;
    email: string;

    constructor({id= Math.floor(Math.random()*89999+10000), username='', fullName='', email=''}){
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        return this;
    }
}