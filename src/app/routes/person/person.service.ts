import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError } from 'rxjs/operators';


@Injectable()
export class PersonService {
  constructor(private http: HttpClient) { }

  getPerson(id: number) {
    return this.http.get(`${environment.SERVER_URL}/person/` + id);
  }

  createPerson(person) {
    return this.http.post(`${environment.SERVER_URL}/person`, person);
  }

  updatePerson(person, id) {
    return this.http.put(`${environment.SERVER_URL}/person/` + id, person);
  }

  getUser(id: number) {
    return this.http.get(`${environment.SERVER_URL}/user/` + id);
  }

  createUser(person) {
    return this.http.post(`${environment.SERVER_URL}/user`, person);
  }

  updateUser(person, id) {
    return this.http.put(`${environment.SERVER_URL}/user/` + id, person);
  }

  listUsers(searchFilter: string = null, perPage: number = null, page: number = null, order_by: string = null, sort_direction: string = null) {
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
    return this.http.get(`${environment.SERVER_URL}/user`,
      {
        params: httpParams
      })
  }
}
