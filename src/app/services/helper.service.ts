import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Event } from '../models/event';
import { User } from '../models/user';
import { LocalstorageService } from './localstorage.service';


export enum Status {
  LOAD = 1,
  CREATE = 2,
  UPDATE = 3,
  DELETE = 4
}

export interface Response{
  status:boolean;
  message:string;
}

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  events = new Subject<boolean>();

  users = new Subject<boolean>();

  selectedUser = new Subject<boolean>()

  selectedDate = new BehaviorSubject(true);

  constructor( private localStorageService:LocalstorageService ) { }

  getEvents(){
    return this.events.asObservable();
  }

  setEvents(data:Event[], status:Status){

    var events:Event[] = this.localStorageService.getEvents();

    if(status == Status.LOAD){

      if(!events){
        this.localStorageService.setEvents(data);
        this.events.next(true);
        return { success:true, message:"Events have been loaded"};
      }
      this.events.next(true);
      return { success:false, message:"Events already exists"}
    }

    else if(status == Status.CREATE){
      let eventExists = this.findEvent(events, data[0]);
      if(eventExists){
        return {success:false, message:"Event already exists"};
      }

      let {success, message} = this.validateEvent(events, data[0], Status.CREATE);

      if(success){
        events.push(...data);
        this.localStorageService.setEvents(events);
        this.events.next(true);
        return {success:true, message:"Event created successfully"};
      }
      else{
        return {success, message};
      }
    }
    
    else if(status == Status.UPDATE){
      let eventExists = this.findEvent(events, data[0]);
      if(!eventExists){
        return {success:false, message:"Event does not exist"};
      }
      
      else{
        let {success, message} = this.validateEvent(events, data[0], Status.UPDATE);
        if(success){
          events = events.map(event=>{
            if(data[0].id == event.id){
              event = data[0];
            }
            return event;
          });
          this.localStorageService.setEvents(events);
          this.events.next(true);
          return {success:true, message:"Event updated successfully"};
        }
        else{
          return {success, message};
        }
      }
    }

    else if(status == Status.DELETE){
      let eventExists = this.findEvent(events, data[0]);

      if(!eventExists){
        return {success:false, message:"Events does not exist"};
      }
      else{
        events = events.filter(event=> event.id != data[0].id);
        this.localStorageService.setEvents(events);
        this.events.next(true);
        return {success:true, message:"Event deleted successfully"};
      }
    }
  }

  validateEvent(events:Event[], event:Event, eventStatus: Status){
    
    let currEvents = events.filter(data=> data.date == event.date);

    let existOwnerEvent = currEvents.find(data=> data.owner == event.owner);

    if(existOwnerEvent && eventStatus== Status.CREATE){
      return {success:false, message:'Event cannot be created. User has reached the event limit for the day.'}
    }

    let [fromHours2, fromMinutes2]= event.time.from.split(':');
    let fromDate2 = new Date(event.date);
    fromDate2.setHours(parseInt(fromHours2), parseInt(fromMinutes2),0 ,0);

    let [toHours2, toMinutes2]= event.time.to.split(':');
    let toDate2 = new Date(event.date);
    toDate2.setHours(parseInt(toHours2), parseInt(toMinutes2),0 ,0);

    if(fromDate2<= new Date()){
      return {success:false, message: "Past events cannot be created."};
    }

    if(fromDate2> toDate2){
      return {success:false, message: "Event cannot be created. Please check the event times."};
    }

    let clashEvents = currEvents.find(res=>{
      let [fromHours1, fromMinutes1]= res.time.from.split(':');
      let fromDate1 = new Date(res.date);
      fromDate1.setHours(parseInt(fromHours1), parseInt(fromMinutes1),0 ,0);

      let [toHours1, toMinutes1]= res.time.to.split(':');
      let toDate1 = new Date(res.date);
      toDate1.setHours(parseInt(toHours1), parseInt(toMinutes1),0 ,0);

      if((fromDate2< fromDate1) && (toDate2> fromDate1)){
        return true;
      }

      else if((fromDate2 > toDate1) && (toDate2< toDate1)){
        return true;
      }

      return false;
    });

    if(clashEvents){
      return {success:false, message: "Event cannot be created. There might be another event in this time."};
    }
    return {success:true};
  }

  findEvent(events:Event[], event:Event){
    let val = events.find(data=> data.id == event.id);
    if(val) return true;
     return false;
   }


  getUsers(){
    return this.users.asObservable();
  }

  setUsers(data:User[], status:Status){

    var users:User[] = this.localStorageService.getUsers();

      if(status == Status.LOAD){

        if(!users){
          this.localStorageService.setUsers(data);
          this.users.next(true);
          return { success:true, message:"Users have been loaded"}
        }
        this.users.next(true);
        return { success:false, message:"Users already exists"}
      }

      else if(status == Status.CREATE){
        let userExists = this.findUsername(users, data[0]);
        if(userExists){
          return {success:false, message:"Username already exists"};
        }
        users.push(...data);
        this.localStorageService.setUsers(users);
        this.users.next(true);
        return {success:true, message:"User created successfully"};
      }

      else if(status == Status.UPDATE){
        let userExists = this.findUserId(users, data[0]);

        if(!userExists){
          return {success:false, message:"User does not exist"};
        }
        else{
          users = users.map(user=>{
            if(data[0].id == user.id){
              user = data[0];
            }
            return user;
          });
          this.localStorageService.setUsers(users);
          this.users.next(true);
          return {success:true, message:"User updated successfully"};
        }
      }
      else if(status == Status.DELETE){
        let userExists = this.findUserId(users, data[0]);
        if(!userExists){
          return {success:false, message:"User does not exist"};
        }
        else{
          users = users.filter(user=> user.id != data[0].id);
          this.localStorageService.setUsers(users);
          this.users.next(true);
          return {success:true, message:"User deleted successfully"};
        }
      }
  }

  findUsername(users:User[], user:User){
   let val = users.find(data=> data.username == user.username);

   if(val) return true;

    return false;
  }

  findUserId(users:User[], user:User){
    let val = users.find(data=> data.id == user.id);

    if(val) return true;
 
     return false;
  }

  getSelectedUser(){
    return this.selectedUser.asObservable();
  }

  setSelectedUser(username:string){
    this.localStorageService.setSelectedUser(username);
    this.selectedUser.next(true);
  }

  getSelectedDate(){
    return this.selectedDate.asObservable();
  }

  setSelectedDate(date:any){
    this.localStorageService.setSelectedDate(date);
    this.selectedDate.next(true);
  }

}
