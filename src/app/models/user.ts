export class User {
    id:number;
    username: string;
    email: string;

    constructor({id= Math.floor(Math.random()*89999+10000), username='', email=''}){
        this.id = id;
        this.username = username;
        this.email = email;
        return this;
    }
}