import { Injectable } from '@angular/core';
import { Event } from '../models/event';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {

  constructor() { }

  setEvents(events:Event[]){
    localStorage.setItem('events', JSON.stringify(events));
  }

  getEvents(){
    let events = JSON.parse(localStorage.getItem('events'));
    return events;
  }

  setUsers(users:User[]){
    localStorage.setItem('users', JSON.stringify(users));
  }

  getUsers(){
    let users = JSON.parse(localStorage.getItem('users'));
    return users;
  }

  setSelectedUser(username:string){
    localStorage.setItem('selectedUser', username);
  }

  getSelectedUser(){
    return localStorage.getItem('selectedUser');
  }

  setSelectedDate(date:string){
    localStorage.setItem('selectedDate', date);
  }

  getSelectedDate(){
    return localStorage.getItem('selectedDate');
  }

}
