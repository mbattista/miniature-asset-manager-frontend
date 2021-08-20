import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';


@Injectable()
export class AssetOverviewService {
  constructor(private http: HttpClient) { }

  getAsset(id: number) {
    return this.http.get(`${environment.SERVER_URL}/asset/` + id);
  }

  listAssets(searchFilter: string = null, perPage: number = null, page: number = null, order_by: string = null, sort_direction: string = null, show_inactive: boolean = null) {
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
    return this.http.get(`${environment.SERVER_URL}/asset`,
      {
        params: httpParams
      }
    );
  }

  listAssetTypes(searchFilter: string = null, perPage: number = null, page: number = null) {
    let httpParams = new HttpParams().set('per_page', String(perPage)).set('page', String(page));
    if (searchFilter !== null) {
      httpParams = httpParams.set('q', String(searchFilter));
    }
    return this.http.get(`${environment.SERVER_URL}/asset_type`,
      {
        params: httpParams
      }
    );
  }

  listAssetNames(searchFilter: string = null, perPage: number = null, page: number = null) {
    let httpParams = new HttpParams().set('per_page', String(perPage)).set('page', String(page));
    if (searchFilter !== null) {
      httpParams = httpParams.set('q', String(searchFilter));
    }
    return this.http.get(`${environment.SERVER_URL}/asset_name`,
      {
        params: httpParams
      }
    );
  }


  deleteAsset(id: number) {
    return this.http.delete(`${environment.SERVER_URL}/asset/` + id);
  }

  createAsset(asset) {
    return this.http.post(`${environment.SERVER_URL}/asset`, asset);
  }

  updateAsset(asset, id) {
    return this.http.put(`${environment.SERVER_URL}/asset/` + id, asset);
  }
}
