import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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

  @ViewChild('viewEventBox', { static: false })
  viewEventRef: TemplateRef<any>;
  
  @Input('selectedDate') selectedDate: Subject<any>;

  @ViewChild('deleteConfirmation', { static: false })
  deleteConfirmationRef: TemplateRef<any>;

  selectedUser: string;

  selectedDateValue: any;

  selectedEvent:Event;

  events: Event[];

  loading: boolean = false;

  downloadJsonHref: SafeUrl;

  jsonFileName: string;

  selectedView:string = 'days';

  constructor(
    private dialog: MatDialog,
    private http: EventsService,
    private helperService: HelperService,
    private snackbar: MatSnackBar,
    private localStorageService: LocalstorageService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.setEventsData();
    this.getSelectedView();
    this.getSelectedDate();
    this.getEvents();
    this.getSelectedUser();
  }

  setEventsData() {
    this.loading = true;
    this.http.getEventsData()
      .then(res => {
        if (res.success) {
          this.helperService.setEvents(res.events, Status.LOAD);
        }
      });
  }

  getSelectedView(){
    this.helperService.getSelectedView().subscribe(res=>{
      this.selectedView = res;
      this.events = this.localStorageService.getEvents();
      if (this.events) {
        this.events = this.getSelectedDateEvents(this.events);
        this.generateDownloadJsonUri();
      }
    })
  }


  getSelectedDate() {
    this.helperService.getSelectedDate().subscribe(res => {
      if (res) {
        this.selectedDateValue = this.localStorageService.getSelectedDate();
        this.events = this.localStorageService.getEvents();
        if (this.events) {
          this.events = this.getSelectedDateEvents(this.events);
          this.generateDownloadJsonUri();
        }
      }
    })
  }

  getEvents() {
    this.helperService.getEvents().subscribe(res => {
      if (res) {
        this.loading = false;
        this.events = this.localStorageService.getEvents();
        if (this.events) {
          this.events = this.getSelectedDateEvents(this.events);
          this.generateDownloadJsonUri();
        }
      }
    })
  }

  getSelectedDateEvents(events: Event[]) {
    var newEvents;

    if(this.selectedView == 'days'){
      newEvents = events.filter(data => data.date == this.makeNewDate(this.selectedDateValue).toLocaleDateString().split('/').reverse().join('-'));
    }
    else if(this.selectedView == 'months'){
      newEvents = events.filter(data => (data.date).split('-')[1] == this.makeNewDate(this.selectedDateValue).toLocaleDateString().split('/')[1]);
    }
    newEvents.sort((a, b) => {
      let [ahours, aminutes] = a.time.from.split(':');
      let [bhours, bminutes] = b.time.from.split(':');
      let x = this.makeNewDate(a.date, parseInt(ahours), parseInt(aminutes));
      let y = this.makeNewDate(b.date, parseInt(bhours), parseInt(bminutes));
      return x.getTime() - y.getTime();
    });

    return newEvents;
  }

  generateDownloadJsonUri() {
    var theJSON = JSON.stringify(this.events);
    this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    if(this.selectedView == 'days'){
      let date = this.makeNewDate(this.selectedDateValue).toLocaleDateString().split('/').reverse().join('-');
      this.jsonFileName = `events_${date}.json`
    }
    else if(this.selectedView == 'months'){
      let date = this.makeNewDate(this.selectedDateValue).toLocaleDateString().split('/');
      this.jsonFileName = `events_${date[0]}-${date[1]}.json`
    }

  }

  addEvent() {
    let event = new Event({ owner: this.localStorageService.getSelectedUser() });
    event.date = this.makeNewDate(this.selectedDateValue).toLocaleDateString().split('/').reverse().join('-');
    this.dialog.open(AddEventComponent, { data: {event, selectedView: this.selectedView}, height: '600px',
    width: '600px'});
  }

  editEvent(event: Event) {
    this.dialog.open(AddEventComponent, { data: {event, selectedView: this.selectedView},
      height: '600px',
      width: '600px',
    });
  }

  deleteEvent(event: Event) {
    let dialogRef = this.dialog.open(this.deleteConfirmationRef);
    dialogRef.afterClosed().subscribe(res => {
      if (res) this.helperService.setEvents([event], Status.DELETE);
    });
  }

  getDateStatus() {
    let date = this.makeNewDate(this.selectedDateValue);
    if(this.selectedView == 'days'){
      let currDate = this.makeNewDate(new Date())
      return date >= currDate;
    }
    else if(this.selectedView == 'months'){
      let d = new Date().getMonth();

      return date.getMonth() >= d;
    }


  };

  makeNewDate(date: any, hours = 0, minutes = 0) {
    let d = new Date(date);
    d.setHours(hours, minutes, 0, 0);

    return d;
  }

  enableEventActions(event: Event) {
    if (event.status == 'CLOSED') {
      return false;
    }
    if (this.selectedUser != event.owner) {
      return false;
    }
    return true;
  }



  getSelectedUser() {
    this.helperService.getSelectedUser().subscribe(res => {
      if (res) {
        this.selectedUser = this.localStorageService.getSelectedUser();
        this.snackbar.open(`Welcome ${this.selectedUser}`, 'Close', {
          duration: 2000,
          verticalPosition: 'top'
        })
      }
    })
  }

  viewEvent(event){
    this.selectedEvent = event;
    let dialogRef = this.dialog.open(this.viewEventRef, {data:{event}, height:'400px', width:'400px'});
  }


}
