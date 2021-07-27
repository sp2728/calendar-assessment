import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material';
import { Event } from '../models/event';
import { HelperService } from '../services/helper.service';
import { LocalstorageService } from '../services/localstorage.service';

@Component({
  selector: 'app-calender-days',
  templateUrl: './calender-days.component.html',
  styleUrls: ['./calender-days.component.css']
})
export class CalenderDaysComponent implements OnInit {

  dateForm: FormGroup;

  currDate = new Date();

  days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  months = ['January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October', 'November', 'December']

  selectedDate = new Date();

  selectedView = 'days';

  numOfDays:number[];

  events: Event[];

  constructor(
    private fb: FormBuilder,
    private localStorageService:LocalstorageService,
    private helperService:HelperService
  ) { }

  ngOnInit() {
    this.helperService.setSelectedDate(this.selectedDate);
    this.getSelectedDate();
    this.helperService.setSelectedView(this.selectedView);
    this.getSelectedView();
    this.createDateForm();
    this.numOfDays = this.getNumberofDays();
    this.monthChange();
    this.getEvents();
  }

  createDateForm() {
    this.dateForm = this.fb.group({
      year: [this.currDate.getFullYear(), [Validators.required]],
      month: [this.currDate.getMonth(), [Validators.required]],
      date: [this.currDate.getDate(), [Validators.required]]
    })
  }

  getSelectedDate(){
    this.helperService.getSelectedDate().subscribe(res=>{
      if(res){
        this.selectedDate = new Date(this.localStorageService.getSelectedDate());
      }
    })
  }

  getNumberofDays(){
    let lastDay = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth()+1, 0).getDate();
    let arr = [...Array(lastDay).keys()].map(data=> {return ++data});
    let firstDay = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1).getDay();
    return [...Array(firstDay).fill(0), ...arr];
  }

  monthChange(){
    this.dateForm.get('month').valueChanges.subscribe(res=>{
      this.selectedDate.setMonth(res);
      this.selectedDate.setDate(1);
      this.helperService.setSelectedDate(this.selectedDate);
      this.numOfDays = this.getNumberofDays();
    });
  }

  changeDate(date:number){
    this.selectedDate.setDate(date);
    this.dateForm.get('date').setValue(this.selectedDate.getDate());
    this.helperService.setSelectedDate(this.selectedDate);
  }

  checkActiveDay(day, month){
    return (day == this.selectedDate.getDate()) && (month == this.selectedDate.getMonth());
  }

  checkInactiveDay(day, month){
   let d = new Date();
   d.setDate(day);
   d.setMonth(month);
    d.setHours(0,0,0,0);

    let a = new Date();
    a.setHours(0,0,0,0);
    return d<a;
  }

  checkEvents(day, month){
    let d = new Date();
    d.setDate(day);
    d.setMonth(month);
     d.setHours(0,0,0,0);
     
    let event = this.events?this.events.find(data=> data.date == d.toISOString().split('T')[0]):null;
    
    let inactiveDay = this.checkInactiveDay(day, month);

    if(event && !inactiveDay ) return true;
    return false;
  }

  getEvents() {
    this.helperService.getEvents().subscribe(res => {
      if(res){
        this.events = this.localStorageService.getEvents();
      } 
    })
  }

  changeView(event: MatButtonToggleChange){
    this.helperService.setSelectedView(event.value);
  }

  checkActiveMonth(month){
    let index = this.months.findIndex(data=> data == month);
    return (index == this.selectedDate.getMonth());
  }

  checkInactiveMonth(month){
   let index = this.months.findIndex(data=> data == month);

    let d = new Date();
    d.setMonth(index);
     d.setHours(0,0,0,0);
 
     let a = new Date();
     a.setHours(0,0,0,0);
     return d<a;
  }

  checkMonthEvents(month){
    let index = this.months.findIndex(data=> data == month);

    let d = new Date();
    d.setMonth(index);
     d.setHours(0,0,0,0);
     
    let event = this.events?this.events.find(data=> data.date.split('-')[1] == d.toISOString().split('T')[0].split('-')[1]):null;
    
    let inactiveDay = this.checkInactiveMonth(month);

    if(event && !inactiveDay ) return true;
    return false;
  }

  changeMonth(month){
    let index = this.months.findIndex(data=> data == month);
    let d = new Date();
    d.setMonth(index);
     d.setHours(0,0,0,0);

    this.helperService.setSelectedDate(d);
    this.dateForm.get('month').setValue(index)
  }

  getSelectedView(){
    this.helperService.getSelectedView().subscribe(res=>{
      this.selectedView = res;
    })
  }
}
