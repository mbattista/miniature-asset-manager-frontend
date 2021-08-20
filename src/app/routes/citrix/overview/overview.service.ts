import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';


@Injectable()
export class CitrixOverviewService {
  constructor(private http: HttpClient) { }

  getCitrix(id: number) {
    return this.http.get(`${environment.SERVER_URL}/citrix/` + id);
  }

  listCitrix(searchFilter: string = null, perPage: number = null, page: number = null, order_by: string = null, sort_direction: string = null, show_only_available: boolean = null) {
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
    if (show_only_available !== null) {
      httpParams = httpParams.set('show_only_available', String(show_only_available));
    }
    return this.http.get(`${environment.SERVER_URL}/citrix`,
      {
        params: httpParams
      }
    );
  }

  deleteCitrix(id: number) {
    return this.http.delete(`${environment.SERVER_URL}/citrix/` + id);
  }

  createCitrix(citrix) {
    return this.http.post(`${environment.SERVER_URL}/citrix`, citrix);
  }

  updateCitrix(citrix, id) {
    return this.http.put(`${environment.SERVER_URL}/citrix/` + id, citrix);
  }
}
