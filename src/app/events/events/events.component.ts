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

  selectedDateValue: any;

  events: Event[];

  loading:boolean = false;

  constructor(
    private dialog: MatDialog,
    private http: EventsService,
    private helperService: HelperService,
    private localStorageService: LocalstorageService
  ) {
  }

  ngOnInit() {
    this.setEventsData();
    this.getSelectedDate();
    this.getEvents();
  }

  setEventsData() {
    this.loading = true;

    this.http.getEventsData()
      .then(res => {
        if (res.success) {
          this.helperService.setEvents(res.events, Status.LOAD);
        }
      })
  }

  getEvents() {
    this.helperService.getEvents().subscribe(res => {
      if(res){
        this.loading = false;
        this.events = this.localStorageService.getEvents();
        if(this.events){
          this.events = this.getSelectedDateEvents(this.events);
        }
      } 
    })
  }

  getSelectedDate() {
    this.helperService.getSelectedDate().subscribe(res => {
      if (res) {
        this.selectedDateValue = this.localStorageService.getSelectedDate();
        this.events = this.localStorageService.getEvents();
        if(this.events){
          this.events = this.getSelectedDateEvents(this.events);
        }
      }
    })
  }

  getSelectedDateEvents(events:Event[]){
    events.filter(data => data.date == this.makeNewDate(this.selectedDateValue).toISOString().split('T')[0]);

    events.sort((a, b) => {
      let [ahours, aminutes] = a.time.from.split(':');
      let [bhours, bminutes] = b.time.from.split(':');
      let x = this.makeNewDate(a.date, parseInt(ahours), parseInt(aminutes));
      let y = this.makeNewDate(b.date, parseInt(bhours), parseInt(bminutes));
      return x.getTime() - y.getTime();
    });

    return events;
  }

  addEvent() {
    let event = new Event({ owner: this.localStorageService.getSelectedUser() });
    event.date = this.makeNewDate(this.selectedDateValue).toISOString().split('T')[0];
    this.dialog.open(AddEventComponent, { data: event });
  }

  editEvent(event: Event) {
    this.dialog.open(AddEventComponent, {data: event});
  }

  deleteEvent(event: Event) {
    let dialogRef = this.dialog.open(this.deleteConfirmationRef);
    dialogRef.afterClosed().subscribe(res => {
      if (res) this.helperService.setEvents([event], Status.DELETE);
    });
  }

  getDateStatus() {
    let date = this.makeNewDate(this.selectedDateValue);
    let currDate = this.makeNewDate(new Date())
    return date >= currDate;
  };

  makeNewDate(date:any, hours=0, minutes=0){
    let d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

}
