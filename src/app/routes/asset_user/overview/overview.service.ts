import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';


@Injectable()
export class AssetUserOverviewService {
  constructor(private http: HttpClient) { }

  getAssetUser(id: number) {
    return this.http.get(`${environment.SERVER_URL}/end_user/` + id);
  }

  listAssetUsers(searchFilter: string = null, perPage: number = null, page: number = null, place: number = null, order_by: string = null, sort_direction: string = null) {
    let httpParams = new HttpParams().set('per_page', String(perPage)).set('page', String(page));
    if (searchFilter !== null) {
      httpParams = httpParams.set('q', String(searchFilter));
    }
    if (place !== null) {
      httpParams = httpParams.set('place', String(place));
    }
    if (order_by !== null) {
      httpParams = httpParams.set('order_by', String(order_by));
    }
    if (sort_direction !== null) {
      httpParams = httpParams.set('sort', String(sort_direction));
    }

    return this.http.get(`${environment.SERVER_URL}/end_user`,
      {
        params: httpParams
      }
    );
  }

  deleteAssetUser(id: number) {
    return this.http.delete(`${environment.SERVER_URL}/end_user/` + id);
  }

  createAssetUser(asset_user) {
    return this.http.post(`${environment.SERVER_URL}/end_user`, asset_user);
  }

  updateAssetUser(asset_user, id) {
    return this.http.put(`${environment.SERVER_URL}/end_user/` + id, asset_user);
  }
}
