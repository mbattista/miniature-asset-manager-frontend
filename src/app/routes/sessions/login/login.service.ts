import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { catchError, map, retry, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { LoginResponse } from './LoginResponse';

@Injectable()
export class LoginService {
  private currentUserSubject: BehaviorSubject<LoginResponse>;
  private defaultStorageId: BehaviorSubject<number>;
  public currentUser: Observable<LoginResponse>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<LoginResponse>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
    this.defaultStorageId = new BehaviorSubject<number>(Number(localStorage.getItem('default_storage_id')));
  }

  public get currentUserValue(): LoginResponse {
    return this.currentUserSubject.value;
  }

  public get defaultStorageIdValue(): number {
    return this.defaultStorageId.value;
  }

  deleteToken() {
//    this.http.get(`${environment.SERVER_URL}/logout`)
//      .pipe(
//        take(1)
//      ).subscribe(
//      data => {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
//      },
//      error => {console.log(error);}
//    );
  }

  createToken(email, password) {
    this.http.get('assets/data/config.json?_t=' + Date.now()).pipe(
      take(1)
    ).subscribe((config: any) => {
      localStorage.setItem('default_storage_id', config.default_storage_id);
      this.defaultStorageId.next(Number(config.default_storage_id));
    });
    return this.http.post(`${environment.SERVER_URL}/login`, {email: email, password: password})
      .pipe(
        map((loginResponse: LoginResponse) => {
          // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(loginResponse));
          this.currentUserSubject.next(loginResponse);
          return loginResponse;
        }),
        catchError(this.handleError) // then handle the error
      );
  }

  updatePerPagePreference(per_page: number) {
    let loginResponse = this.currentUserValue;
    loginResponse.per_page_preference = per_page;
    localStorage.setItem('currentUser', JSON.stringify(loginResponse));
    this.currentUserSubject.next(loginResponse);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }
}
