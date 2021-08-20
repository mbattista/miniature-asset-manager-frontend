import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable()
export class CitrixassetsService {
  constructor(private http: HttpClient) {
  }

  listAssetCitrix(searchFilter: string = null, perPage: number = null, page: number = null, order_by: string = null, sort_direction: string = null, asset: number = null, citrix: number = null, show_inactive: boolean = null) {
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
    if (asset !== null) {
      httpParams = httpParams.set('asset', String(asset));
    }
    if (citrix !== null) {
      httpParams = httpParams.set('citrix', String(citrix));
    }
    if (show_inactive !== null) {
      httpParams = httpParams.set('show_inactive', String(show_inactive));
    }
    return this.http.get(`${environment.SERVER_URL}/citrix_assets`,
      {
        params: httpParams
      }
    );
  }
}
