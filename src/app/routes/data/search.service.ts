import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';


@Injectable()
export class SearchService {
  constructor(private http: HttpClient) { }

  searchGlobal(searchFilter: string = null, perPage: number = null, page: number = null) {
    let httpParams = new HttpParams().set('per_page', String(perPage)).set('page', String(page));
    if (searchFilter !== null) {
      httpParams = httpParams.set('q', String(searchFilter));
    }
    return this.http.get(`${environment.SERVER_URL}/search`,
      {
        params: httpParams
      }
    );
  }
}
