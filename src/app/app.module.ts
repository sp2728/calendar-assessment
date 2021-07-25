import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatSelectModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalenderDaysComponent } from './calender-days/calender-days.component';
import { CalenderInviteesComponent } from './calender-invitees/calender-invitees.component';
import { EventsModule } from './events/events.module';
import { AddEventComponent } from './events/add-event/add-event.component';
import { HttpClientModule } from '@angular/common/http';
import { UsersModule } from './users/users.module';
import { AddUserComponent } from './users/add-user/add-user.component';

@NgModule({
  declarations: [
    AppComponent,
    CalenderDaysComponent,
    CalenderInviteesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    EventsModule,
    UsersModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    FormsModule,
    MatCardModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents:[
    AddEventComponent,
    AddUserComponent
  ]
})
export class AppModule { }
