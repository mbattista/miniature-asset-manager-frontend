import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';


@Injectable()
export class PreferenceService {
  constructor(private http: HttpClient) { }

  updatePreference(id, preferences) {
    return this.http.put(`${environment.SERVER_URL}/preference/` + id, preferences);
  }
}
