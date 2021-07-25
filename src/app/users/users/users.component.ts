import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar } from '@angular/material';
import { User } from 'src/app/models/user';
import { HelperService, Status } from 'src/app/services/helper.service';
import { LocalstorageService } from 'src/app/services/localstorage.service';
import { UsersService } from 'src/app/services/users.service';
import { AddUserComponent } from '../add-user/add-user.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  @ViewChild('usersList', { static: false })
  usersListRef: TemplateRef<any>;

  @ViewChild('deleteConfirmation', { static: false })
  deleteConfirmationRef: TemplateRef<any>;

  users: User[];

  selectedUser: string;

  userSelectForm: FormGroup;

  constructor(
    private fb:FormBuilder,
    private dialog:MatDialog,
    private http:UsersService,
    private helperService:HelperService,
    private localStorageService:LocalstorageService,
    private snackbar:MatSnackBar
  ) {
    this.setUsers();
    this.getSelectedUser();
   }

  ngOnInit() {
    this.getUsers();
  }

  createUserSelectForm(){
    this.userSelectForm = this.fb.group({
      username:[this.selectedUser, [Validators.required]]
    })
  }

  getUsers(){
    this.helperService.getUsers().subscribe(res=>{
      if(res){
        this.users = this.localStorageService.getUsers();
        this.selectedUser = this.localStorageService.getSelectedUser();
        this.createUserSelectForm();
      }
    })
  }

  onSubmit(){
    if(this.userSelectForm.valid){
      this.helperService.setSelectedUser(this.userSelectForm.value.username);
    }
  }
  

  getSelectedUser(){
    this.helperService.getSelectedUser().subscribe(res=>{
      if(res){
        this.selectedUser = this.localStorageService.getSelectedUser();
        this.snackbar.open(`Welcome ${this.selectedUser}`, 'Close',{
          duration: 3000,
          verticalPosition: 'top'
        })
      }
    })
  }

  setUsers(){
    this.http.getUsersData().then(response=>{
      if(response.success){
        this.helperService.setUsers(response.users, Status.LOAD);
        this.helperService.setSelectedUser(response.users[0].username);
      }
    })
  }

  addUser(){
    this.dialog.open(AddUserComponent);
  }

  viewUsers(){
    this.dialog.open(this.usersListRef);
  }

  editUser(user:User){
    let dialogRef = this.dialog.open(AddUserComponent,{data: user});
    dialogRef.afterClosed().subscribe(res=>{
      if(res){ this.helperService.setUsers([res.data], Status.UPDATE); }
    });
  }

  deleteUser(user:User){
    let dialogRef = this.dialog.open(this.deleteConfirmationRef);
    dialogRef.afterClosed().subscribe(res=>{
      if(res){ this.helperService.setUsers([user], Status.DELETE); }
    });
  }

}
