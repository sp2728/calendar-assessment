import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs';
import { Event } from 'src/app/models/event';
import { EventsService } from 'src/app/services/events.service';
import { Status, HelperService } from 'src/app/services/helper.service';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { AddEventComponent } from '../add-event/add-event.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  @Input('selectedDate') selectedDate: Subject<any>;

  @ViewChild('deleteConfirmation', { static: false })
  deleteConfirmationRef: TemplateRef<any>;
  
  selectedDateValue:any;

  events: Event[];

  constructor(
    private dialog:MatDialog,
    private http:EventsService,
    private helperService:HelperService,
    private localStorageService:LocalstorageService
  ) {
    this.setEventsData();
   }

  ngOnInit() {
    this.getSelectedDate();
    this.getEvents();
  }

  getEvents(){
    this.helperService.getEvents().subscribe(res=>{
      this.events = this.localStorageService.getEvents().filter(data=> data.date == new Date(this.selectedDateValue).toISOString().split('T')[0]);
      this.sortEvents();
    })
  }

  getSelectedDate(){
    this.helperService.getSelectedDate().subscribe(res=>{
      if(res){
        this.selectedDateValue = this.localStorageService.getSelectedDate();
        this.events = this.localStorageService.getEvents().filter(data=> data.date == new Date(this.selectedDateValue).toISOString().split('T')[0]);
        this.sortEvents();
      }
    })
  }

  sortEvents(){
    this.events.sort((a,b)=>{
      let [ahours, aminutes] = a.time.from.split(':');
      let x = new Date(a.date)
      x.setHours(parseInt(ahours), parseInt(aminutes), 0, 0);

      let [bhours, bminutes] = b.time.from.split(':');
      let y = new Date(b.date)
      y.setHours(parseInt(bhours), parseInt(bminutes), 0, 0);

      return x.getTime()-y.getTime();
    })
  }

  addEvent(){
    let event = new Event({owner: this.localStorageService.getSelectedUser()});
    event.date = new Date(this.selectedDateValue).toISOString().split('T')[0];
    this.dialog.open(AddEventComponent, {data: event});
  }

  setEventsData(){
    this.http.getEventsData()
    .then(res=>{
      if(res.success){
        this.helperService.setEvents(res.events, Status.LOAD);
      }
    })
  }

  editEvent(event:Event){
    let dialogRef = this.dialog.open(AddEventComponent,{data: event});
    dialogRef.afterClosed().subscribe(res=>{
      if(res){ this.helperService.setEvents([res.data], Status.UPDATE); }
    });
  }

  deleteEvent(event:Event){
    let dialogRef = this.dialog.open(this.deleteConfirmationRef);
    dialogRef.afterClosed().subscribe(res=>{
      if(res){ this.helperService.setEvents([event], Status.DELETE); }
    });
  }

}
