import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatSelectionListChange, MatSnackBar } from '@angular/material';
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

  getUsers(){
    this.helperService.getUsers().subscribe(res=>{
      if(res){
        this.users = this.localStorageService.getUsers();
        let user = this.users.find(data=> data.username == this.localStorageService.getSelectedUser()); 
        if(user){
          this.helperService.setSelectedUser(user.username);
        }
        else{
          this.helperService.setSelectedUser(this.users[0].username);
        }
      }
    })
  }

  changeUser(event: MatSelectionListChange){
    this.helperService.setSelectedUser(event['value']); 
  }

  getSelectedUser(){
    this.helperService.getSelectedUser().subscribe(res=>{
      if(res){
        this.selectedUser = this.localStorageService.getSelectedUser();
        this.snackbar.open(`Welcome ${this.selectedUser}`, 'Close',{
          duration: 2000,
          verticalPosition: 'top'
        })
      }
    })
  }

  setUsers(){
    this.http.getUsersData().then(response=>{
      if(response.success){
        this.helperService.setUsers(response.users, Status.LOAD);
        if(!this.localStorageService.getSelectedUser()){
          this.helperService.setSelectedUser(response.users[0].username);
        }
      }
    })
  }

  addUser(){
    this.dialog.open(AddUserComponent);
  }

  editUser(user:User){
    this.dialog.open(AddUserComponent,{data: user});
  }

  viewUsers(){
    this.dialog.open(this.usersListRef);
  }

  deleteUser(user:User){
    let dialogRef = this.dialog.open(this.deleteConfirmationRef);
    dialogRef.afterClosed().subscribe(res=>{
      if(res){ this.helperService.setUsers([user], Status.DELETE); }
    });
  }

}
