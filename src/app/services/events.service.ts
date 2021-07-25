import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Event } from '../models/event';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';


export interface EventResponse {
  success: boolean;
  events?: Event[];
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor(private http:HttpClient) { }

  getEventsData() :Promise<EventResponse>{
    return this.http.get('assets/data/events.json')
    .pipe(
      map((response:any)=>{

        let events = response.events.map(data=>{ return new Event(data); })
        
        return {success:true, events}
      }),
      catchError(err=>{
        return of({success:false});
      })
    )
    .toPromise();
  }
}
