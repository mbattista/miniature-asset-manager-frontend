import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import {throwError} from 'rxjs';
import { environment } from '@env/environment';

@Injectable()
export class PlaceOverviewService {
  constructor(private http: HttpClient) { }

  getPlace(id: number) {
    return this.http.get(`${environment.SERVER_URL}/place/` + id)
      .pipe(
        catchError(this.handleError) // then handle the error
      );
  }

  listPlaces(searchFilter: string = null, perPage: number = null, page: number = null, order_by: string = null, sort_direction: string = null, show_inactive: boolean = null) {
    let httpParams = new HttpParams().set('per_page', String(perPage)).set('page', String(page));
    if (searchFilter !== null) {
      httpParams = httpParams.set('q', String(searchFilter));
    }
    if (order_by !== null) {
      httpParams = httpParams.set('order_by', String(order_by));
    }
    if (sort_direction !== null) {
      httpParams = httpParams.set('sort', String(sort_direction));
    }
    if (show_inactive !== null) {
      httpParams = httpParams.set('show_inactive', String(show_inactive));
    }
    return this.http.get(`${environment.SERVER_URL}/place`,
      {
        params: httpParams
      }
    ).pipe(
      catchError(this.handleError) // then handle the error
    );
  }

  deletePlace(id: number) {
    return this.http.delete(`${environment.SERVER_URL}/place/` + id)
      .pipe(
        catchError(this.handleError) // then handle the error
      );
  }

  createPlace(place) {
    return this.http.post(`${environment.SERVER_URL}/place`, place)
      .pipe(
        catchError(this.handleError) // then handle the error
      );
  }

  updatePlace(place, id) {
    return this.http.put(`${environment.SERVER_URL}/place/` + id, place)
      .pipe(
        catchError(this.handleError) // then handle the error
      );
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
