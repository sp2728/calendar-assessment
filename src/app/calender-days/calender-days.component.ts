import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { HelperService } from '../services/helper.service';

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

  numOfDays:number[];

  constructor(
    private fb: FormBuilder,
    private helperService:HelperService
  ) { }

  ngOnInit() {
    this.helperService.setSelectedDate(this.selectedDate);
    this.createDateForm();
    this.numOfDays = this.getNumberofDays();
    this.monthChange();
  }

  createDateForm() {
    this.dateForm = this.fb.group({
      year: [this.currDate.getFullYear(), [Validators.required]],
      month: [this.currDate.getMonth(), [Validators.required]],
      date: [this.currDate.getDate(), [Validators.required]]
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

    if((day == this.selectedDate.getDate()) && (month == this.selectedDate.getMonth())){ return true;}
    return false;
  }

}
