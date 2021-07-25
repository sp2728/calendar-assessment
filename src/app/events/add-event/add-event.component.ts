import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Event } from 'src/app/models/event';
import { HelperService, Status } from 'src/app/services/helper.service';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {

  eventForm: FormGroup;

  selectedEvent = new Event({});

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  submitButton:string = 'CREATE EVENT';

  invitees: string[];

  today = new Date().toISOString().split('T')[0];

  constructor(
    private fb:FormBuilder,
    private snackbar:MatSnackBar,
    private helperService:HelperService,
    private dialogRef: MatDialogRef<AddEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event
  ) { }

  ngOnInit() {
    if(this.data){
      this.selectedEvent = this.data;
      this.invitees = this.selectedEvent.invitees;
      if(this.data.name){ 
        this.submitButton = 'UPDATE EVENT'; }
    }
    this.createEventForm();
  }

  createEventForm(){
    this.eventForm = this.fb.group({
      id:[this.selectedEvent.id],
      name: [this.selectedEvent.name, [Validators.required]],
      location: [this.selectedEvent.location, [Validators.required]],
      date: [this.selectedEvent.date, [Validators.required, this.checkValidDate()]],
      time: this.fb.group({
        from:[this.selectedEvent.time.from, [Validators.required, this.checkValidTime()]],
        to: [this.selectedEvent.time.to, [Validators.required]]
      }),
      invitees:[this.selectedEvent.invitees],
      owner:[this.selectedEvent.owner]
    });

    this.eventForm.get('owner').disable();
    this.eventForm.get('date').disable();
  }

  checkValidDate(){
    return (control: AbstractControl): ValidationErrors | null=> {
      let error = new Date(control.value).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0);
      return !!error ? {dateValidator: {value: "Invalid Date. Cannot select past dates."}} : null;
    };
  }

  checkValidTime(){
    return (control: AbstractControl): ValidationErrors | null=> {
      let [hours, minutes] = control.value.split(':');
      // let error = new Date().setHours(hours, minutes, 0, 0) <= new Date();
      // return !!error ? {variablesValidator: {value: "Invalid Date"}} : null;
      return null;
    };
  }

  onSubmit(){
    if(this.eventForm.valid){

      let event =  new Event(this.eventForm.getRawValue());

      var eventResult;

      if(this.data && this.data.name){
        eventResult = this.helperService.setEvents([event], Status.UPDATE);  
      }
      else{
        eventResult = this.helperService.setEvents([event], Status.CREATE);  
      }

      if(!eventResult.success){
        this.snackbar.open(eventResult.message, 'Close', {
          duration: 3000,
          verticalPosition: 'top'
        })
      }
      else{
        this.dialogRef.close();
      }
    }
  }

  getErrorMessage(control:AbstractControl){
    if(control.errors.required) return 'Required';
    if(control.errors.dateValidator) return control.errors.dateValidator.value;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      this.invitees.push(value);
    }

  }

  remove(invitee: string): void {
    const index = this.invitees.indexOf(invitee);

    if (index >= 0) {
      this.invitees.splice(index, 1);
    }
  }
  
}
