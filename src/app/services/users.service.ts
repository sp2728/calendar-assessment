import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from '../models/user';

export interface UserResponse {
  success: boolean;
  users?: User[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http:HttpClient) { }

  getUsersData() :Promise<UserResponse>{
    return this.http.get('assets/data/users.json')
    .pipe(
      map((response:any)=>{

        let users = response.users.map(data=>{ 
          return new User(data); 
        })
        
        return {success:true, users}
      }),
      catchError(err=>{
        return of({success:false});
      })
    )
    .toPromise();
  }
}
