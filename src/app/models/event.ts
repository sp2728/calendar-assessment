export enum Status{
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    RUNNING = "RUNNIG"
}

export class Event{
    id:number;
    name:string;
    location:string;
    date: string;
    time: EventTime;
    invitees:string[];
    owner:string;
    status: Status;

    constructor({id=Math.floor(Math.random()*899999+100000), name='', location='', date=new Date().toLocaleDateString().split('/').reverse().join('-'), time=new EventTime(), invitees=null, owner=''}){
        this.id = id;
        this.name = name;
        this.location = location;
        this.date = date;
        this.time = time;
        this.invitees = invitees;
        this.owner = owner;
        this.status = this.checkEventStatus(this.date, this.time);;
        return this;
    }

    checkEventStatus(date, time){
        let [fromHours, fromMinutes] = time.from.split(':');
        let fromDate = new Date(date);
        fromDate.setHours(parseInt(fromHours), parseInt(fromMinutes),0 ,0);

        let [toHours, toMinutes ] = time.to.split(':');
        let toDate = new Date(date);
        toDate.setHours(parseInt(toHours), parseInt(toMinutes),0 ,0);

        if(new Date() < fromDate ){
            return Status.OPEN;
        }
        else if(new Date() > toDate){
            return Status.CLOSED;
        }
        else if((fromDate <= new Date()) &&( new Date() <= toDate)){
            return Status.RUNNING;
        }
    }
}

export class EventTime{
    from: string;
    to: string;

    constructor(from='', to=''){
        this.from =from;
        this.to =to;
        return this;
    }
}