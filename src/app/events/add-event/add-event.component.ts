import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { Event } from 'src/app/models/event';
import { HelperService, Status } from 'src/app/services/helper.service';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { User } from 'src/app/models/user';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {

  eventForm: FormGroup;

  selectedEvent = new Event({});

  selectedView:string = 'days';

  selectedDate:Date;

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  submitButton:string = 'Create Event';

  inviteeCtrl = new FormControl();

  invitees: string[] = [];

  filteredInvitees: Observable<string[]>;

  allInvitees: string[] =  this.localStorageService.getUsers().map(res=> {return res.username});

  @ViewChild('inviteesInput', {static:false}) inviteesInputRef : ElementRef<HTMLInputElement>;

  today = new Date().toLocaleDateString().split('/').reverse().join();

  maxDay:string = '';

  constructor(
    private fb:FormBuilder,
    private snackbar:MatSnackBar,
    private helperService:HelperService,
    private localStorageService:LocalstorageService,
    private dialogRef:MatDialogRef<AddEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if(this.data){
      this.selectedEvent = this.data.event;
      this.invitees = this.selectedEvent.invitees || [];
      if(this.data.event.name) this.submitButton = 'Update Event';
      this.selectedView = this.data.selectedView;
      this.selectedDate = this.data.selectedDate;
    }
    this.createEventForm();
    this.filterInvitees();
  }

  filterInvitees(){
    this.filteredInvitees = this.inviteeCtrl.valueChanges.pipe(
      startWith(null),
      map((invitee: string | null) => invitee ? this._filter(invitee) : this.allInvitees.filter(data=> data != this.localStorageService.getSelectedUser()).slice()));
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allInvitees.filter(data=> data != this.localStorageService.getSelectedUser()).filter(invitee => invitee.toLowerCase().includes(filterValue));
  }

  createEventForm(){
    this.eventForm = this.fb.group({
      id:[this.selectedEvent.id],
      name: [this.selectedEvent.name, [Validators.required]],
      location: [this.selectedEvent.location, [Validators.required]],
      date: [this.selectedEvent.date, [Validators.required, this.checkValidDate()]],
      time: this.fb.group({
        from:[this.selectedEvent.time.from, [Validators.required]],
        to: [this.selectedEvent.time.to, [Validators.required]]
      }),
      invitees:[this.invitees],
      owner:[this.selectedEvent.owner]
    });

    this.eventForm.get('owner').disable();

    if(this.selectedView == 'days'){
      this.eventForm.get('date').disable();
    }

    if(this.selectedView == 'months'){
      this.selectedDate = new Date(this.localStorageService.getSelectedDate());
      this.maxDay = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth()+1, 0).toLocaleDateString().split('/').reverse().join('-');
    }
  }

  checkValidDate(){
    return (control: AbstractControl): ValidationErrors | null=> {
      let error = new Date(control.value).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0);
      return !!error ? {dateValidator: {value: "Invalid Date. Cannot select past dates."}} : null;
    };
  }


  validateInvitees(){
    return (control: AbstractControl): ValidationErrors | null=> {
      let error = control.value === new Set(control.value).size;
      return !error ? {dateValidator: {value: "Cannot have duplicate invitees"}} : null;
    };
  }

  onSubmit(){
    if(this.eventForm.valid){
      let event =  new Event(this.eventForm.getRawValue());
      var eventResult;
      if(this.data.event && this.data.event.name){
        eventResult = this.helperService.setEvents([event], Status.UPDATE);  
      }
      else{
        eventResult = this.helperService.setEvents([event], Status.CREATE);  
      }

      this.snackbar.open(eventResult.message, 'Close', {
        duration: 2000,
        verticalPosition: 'top'
      })

      if(eventResult.success){
        this.dialogRef.close();
      }
    }
  }

  getErrorMessage(control:AbstractControl){
    if(control.errors.required) return 'Required';
    if(control.errors.dateValidator) return control.errors.dateValidator.value;
    if((control.errors.invalidUser)) return 'User does not exists';
    if((control.errors.duplicateUser)) return 'User already exists in the list';
  }

  selected(event: MatAutocompleteSelectedEvent): void {

    if(!this.invitees.includes(event.option.viewValue)){
      this.invitees.push(event.option.viewValue);
      this.inviteeCtrl.setValue(null);
      this.inviteesInputRef.nativeElement.value = '';
    }
    else{
      this.inviteeCtrl.setErrors({duplicateUser:true});
    }
  }

  add(event: MatChipInputEvent): void {
    // let value = (event.value || '').trim();

    // if(value){
    //   if(!this.allInvitees.includes(value) ){
    //     this.inviteeCtrl.setErrors({invalidUser: true});
    //   }
    //   else{
    //     this.invitees.push(value);
    //     this.inviteeCtrl.setValue(null);
    //   }
    // }

    // event.input.value = '';
  }

  remove(invitee: string): void {
    const index = this.invitees.indexOf(invitee);

    if (index >= 0) {
      this.invitees.splice(index, 1);
    }
  }
}
