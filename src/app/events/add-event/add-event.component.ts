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

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  submitButton:string = 'CREATE EVENT';

  inviteeCtrl = new FormControl();

  invitees: string[] = [];

  filteredInvitees: Observable<string[]>;

  allInvitees: string[] =  this.localStorageService.getUsers().map(res=> {return res.username});

  @ViewChild('inviteesInput', {static:false}) inviteesInputRef : ElementRef<HTMLInputElement>;

  today = new Date().toISOString().split('T')[0];

  constructor(
    private fb:FormBuilder,
    private snackbar:MatSnackBar,
    private helperService:HelperService,
    private localStorageService:LocalstorageService,
    private dialogRef:MatDialogRef<AddEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Event
  ) { }

  ngOnInit() {
    if(this.data){
      this.selectedEvent = this.data;
      this.invitees = this.selectedEvent.invitees || [];
      if(this.data.name) this.submitButton = 'UPDATE EVENT';
    }
    this.createEventForm();
    this.filterInvitees();
  }

  filterInvitees(){
    this.filteredInvitees = this.inviteeCtrl.valueChanges.pipe(
      startWith(null),
      map((invitee: string | null) => invitee ? this._filter(invitee) : this.allInvitees.slice()));
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allInvitees.filter(invitee => invitee.toLowerCase().includes(filterValue));
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
    this.eventForm.get('date').disable();
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
    // this.inviteeCtrl.setErrors(null);
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
