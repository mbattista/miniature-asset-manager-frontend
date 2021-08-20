import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable()
export class PlacesAssetsOverviewService {
  constructor(private http: HttpClient) { }

  getPlacesAssets(id: number) {
    return this.http.get(`${environment.SERVER_URL}/places_assets/` + id);
  }

  listPlacesAssets(
    searchFilter: string = null,
    perPage: number = null,
    page: number = null,
    asset: number = null,
    place: number = null,
    deliverer_person: number = null,
    receiver_person: number = null,
    pickup_person_id: number = null,
    pickup_responsible_person_id: number = null,
    show_history: boolean = null,
    show_future: boolean = null,
    from_datetimez: string = null,
    until_datetimez: string = null,
    show_only_newest: boolean = null,
    lookup_date: string = null
  ) {
    let httpParams = new HttpParams().set('per_page', String(perPage)).set('page', String(page));
    if (searchFilter !== null) {
      httpParams = httpParams.set('q', String(searchFilter));
    }
    if (asset !== null) {
      httpParams = httpParams.set('asset', String(asset));
    }
    if (place !== null) {
      httpParams = httpParams.set('place', String(place));
    }
    if (deliverer_person !== null) {
      httpParams = httpParams.set('deliverer_person', String(deliverer_person));
    }
    if (receiver_person !== null) {
      httpParams = httpParams.set('receiver_person', String(receiver_person));
    }
    if (pickup_person_id !== null) {
      httpParams = httpParams.set('pickup_person_id', String(pickup_person_id));
    }
    if (pickup_responsible_person_id !== null) {
      httpParams = httpParams.set('pickup_responsible_person_id', String(pickup_responsible_person_id));
    }
    if (show_history !== null) {
      httpParams = httpParams.set('show_history', String(show_history));
    }
    if (show_future !== null) {
      httpParams = httpParams.set('show_future', String(show_future));
    }
    if (from_datetimez !== null) {
      httpParams = httpParams.set('from_datetimez', String(from_datetimez));
    }
    if (until_datetimez !== null) {
      httpParams = httpParams.set('until_datetimez', String(until_datetimez));
    }
    if (show_only_newest !== null) {
      httpParams = httpParams.set('show_only_newest', String(show_only_newest));
    }
    if (lookup_date !== null) {
      httpParams = httpParams.set('lookup_date', String(lookup_date));
    }
    return this.http.get(`${environment.SERVER_URL}/places_assets`,
      {
        params: httpParams
      }
    );
  }

  deletePlacesAssets(id: number) {
    return this.http.delete(`${environment.SERVER_URL}/places_assets/` + id);
  }

  createPlacesAssets(places_assets) {
    return this.http.post(`${environment.SERVER_URL}/places_assets`, places_assets);
  }

  updatePlacesAssets(places_assets, id) {
    return this.http.put(`${environment.SERVER_URL}/places_assets/` + id, places_assets);
  }

  listPlaceDetailOverview(
    searchFilter: string = null,
    perPage: number = null,
    page: number = null,
    order_by: string = null,
    sort_direction: string = null
  ) {
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
    return this.http.get(`${environment.SERVER_URL}/place_detail`,
      {
        params: httpParams
      }
    );
  }

  listExternalPerson(
    perPage: number = null,
    page: number = null,
    searchFilter: string = null
  ) {
    let httpParams = new HttpParams().set('per_page', String(perPage)).set('page', String(page));
    if (searchFilter !== null) {
      httpParams = httpParams.set('q', String(searchFilter));
    }

    return this.http.get(`${environment.SERVER_URL}/external_person`,
      {
        params: httpParams
      }
    );
  }

  listByExternalPerson(
    perPage: number = null,
    page: number = null,
    searchFilter: string = null
  ) {
    let httpParams = new HttpParams().set('per_page', String(perPage)).set('page', String(page));
    if (searchFilter !== null) {
      httpParams = httpParams.set('q', String(searchFilter));
    }

    return this.http.get(`${environment.SERVER_URL}/external_person/places_assets`,
      {
        params: httpParams
      }
    );
  }
}
