import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, tap } from 'rxjs/operators';
import { PlacesAssetsOverviewService } from '../overview.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LoginService } from '../../../sessions/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { PlaceOverviewService } from '../../../place/overview/overview.service';
import { AssetOverviewService } from '../../../asset/overview/overview.service';
import { PersonService } from '../../../person/person.service';
import {CitrixOverviewService} from "../../../citrix/overview/overview.service";

@Component({
  selector: 'app-places-assets-overview-edit',
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacesAssetsOverviewDetailComponent implements OnInit {
  reactiveForm: FormGroup;
  isCreate: boolean = true;
  isDelivery: boolean = true;
  placesAssetsId: number = 0;
  text = {
    'assets': 'Geräte am Standort',
    'assets_storage': 'Geräte zurück ins Lager senden'
  }
  placeId: number = 0;
  place_items = [];
  deliverer_items = [];
  pickup_person_items = [];
  placeInput$ = new Subject<string>();
  manyAssets = new Subject<string>();
  manyLists = [];
  backToStorage = [];
  delivererInput$ = new Subject<string>();
  pickupInput$ = new Subject<string>();
  isLoadingAsset$ = new BehaviorSubject<boolean>(false);
  assetPage = 0;
  backToStoragePage = 0;
  backToStorageInput$ = new Subject<string>();
  backToStorageLoading = false;
  backToStorageValue = null;

  backToStorageCitrixList = [];

  citrix_items = [];

  externalPersonInput$ = new Subject<string>();
  external_person_items = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private placesAssetsSrv: PlacesAssetsOverviewService,
    private assetSrv: AssetOverviewService,
    private assetUsersSrv: PersonService,
    private citrixSrv: CitrixOverviewService,
    private placeSrv: PlaceOverviewService
  ) {
    this.reactiveForm = this.fb.group({
      places_assets_assets: [null],
      places_assets_storage: [null],
      places_assets_place: [null, [Validators.required]],
      deliverer_person: [null],
      pickup_person_id: [null],
      delivered: [true],
      delivery_datetimez: [null],
      from_datetimez: [null, [Validators.required]],
      until_datetimez: [null],
      external_person: [null]
    });
  }

  ngOnInit() {
    this.isDelivery = this.router.url.indexOf('/delivery/') <= 0;

    if (!this.isDelivery) {
      this.text.assets_storage = 'Geräte an Standort liefern'
    }

    this.isLoadingAsset$.next(true);
    this.cdr.detectChanges();
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
          this.placeId = Number(params.get('id'));
          return this.placeSrv.getPlace(Number(params.get('id')))
        }
      ),
      switchMap((data: any) => {
          this.place_items = [...this.place_items, { id: data.id, name: data.name, city: data.city }];
          return this.placesAssetsSrv.listPlacesAssets(null, 50, 0, null, this.placeId, null, null, null, null, true, true, null, null, true)
        }
      ),
      tap((data: any) => {
        let list_items = [];
        this.backToStorageInput$.pipe(
          debounceTime(200),
          distinctUntilChanged(),
          tap(() => this.backToStorageLoading = true),
          tap(term => this.backToStorageValue = term),
          switchMap(term => this.placesAssetsSrv.listPlacesAssets(term, 50, 0, null, this.loginService.defaultStorageIdValue, null, null, null, null, true, true, null, null, true).pipe(
            catchError(err => {
              console.log(err);
              return of([])
            }), // empty list on error
            tap(() => this.backToStoragePage = 1)
          )),
          tap(() => this.backToStorageLoading = false),
        ).subscribe(assets => {
            this.backToStorage = [];
            this.backToStorageCitrixList = [];
            for (let item in assets) {
              if (assets[item] && assets[item]['asset_id']) {
                this.backToStorage = [...this.backToStorage, { id: assets[item].asset_id, name: assets[item].name, type: assets[item].type, serial: assets[item].serial, name_combined: assets[item].name + (assets[item].serial ? ' (' + assets[item].serial + ')' : ''), citrix: assets[item].citrix }];
                this.backToStorageCitrixList.push({ id: assets[item].asset_id, name: assets[item].name, type: assets[item].type, serial: assets[item].serial, name_combined: assets[item].name + (assets[item].serial ? ' (' + assets[item].serial + ')' : ''), citrix: assets[item].citrix });
              }
            }
            this.cdr.detectChanges();
        });
        for (let item in data) {
          if (data[item] && data[item]['place_id']) {
            this.place_items = [...this.place_items, { id: data[item].place_id, name: data[item].place_name, city: data[item].city }];
          }
          if (data[item] && data[item]['asset_id']) {
            this.manyLists = [...this.manyLists, { id: data[item].asset_id, name: data[item].name, type: data[item].type, serial: data[item].serial, name_combined: data[item].name + (data[item].serial ? ' (' + data[item].serial + ')' : ''), citrix: data[item].citrix }];
            list_items.push(data[item].asset_id);
          }
        }
        this.reactiveForm.controls.places_assets_assets.setValue(list_items);

        if (data.deliverer_person)
          this.deliverer_items = [...this.deliverer_items, {id: data.deliverer_person, last_name: data.dp_last_name, first_name: data.dp_first_name, name_combined: (data.dp_first_name ? data.dp_first_name : '') + ' ' + (data.dp_last_name ? data.dp_last_name : ''), citrix: data.citrix}]
        if (data.pickup_person_id)
          this.pickup_person_items = [...this.pickup_person_items, {id: data.pickup_person_id, last_name: data.pp_last_name, first_name: data.pp_first_name}]

        this.reactiveForm.controls.places_assets_place.setValue(this.placeId);
        this.reactiveForm.controls.deliverer_person.setValue(data.deliverer_person);
        this.reactiveForm.controls.pickup_person_id.setValue(data.pickup_person_id);
        this.reactiveForm.controls.delivered.setValue(data.delivered);
        this.reactiveForm.controls.delivery_datetimez.setValue(data.delivery_datetimez);
        this.reactiveForm.controls.from_datetimez.setValue(
          data.from_datetimez ? data.from_datetimez.date.split(' ')[0] : null
        );
        this.reactiveForm.controls.until_datetimez.setValue(
          data.until_datetimez ? data.until_datetimez.date.split(' ')[0] : null
        );
        this.isLoadingAsset$.next(false);

        this.placeSrv.listPlaces(null, 25, 0).pipe(take(1)).subscribe(
          (data: any) => {
            for (let item in data) {
              if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
                if (this.place_items.indexOf(data[item]) == -1)
                  this.place_items = [...this.place_items, data[item]];
              }
            }
          }
        )
        this.assetUsersSrv.listUsers(null, 25, 0).pipe(take(1)).subscribe(
          (data: any) => {
            for (let item in data) {
              if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
                if (this.deliverer_items.findIndex(x => x.id === data[item]['id']) < 0)
                  this.deliverer_items = [...this.deliverer_items, { id: data[item].id, first_name: data[item].first_name, last_name: data[item].last_name, name_combined: (data[item].first_name ? data[item].first_name : '') + ' ' + (data[item].last_name ? data[item].last_name : ''), citrix: data[item].citrix }];
              }
              if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
                if (this.pickup_person_items.indexOf(data[item]) == -1)
                  this.pickup_person_items = [...this.pickup_person_items, data[item]];
              }
            }
          }
        )
        if (!this.isDelivery) {
          this.placesAssetsSrv.listPlacesAssets(null, 50, 0, null, this.loginService.defaultStorageIdValue, null, null, null, null, true, true, null, null, true).pipe(take(1)).subscribe(
            assets => {
              for (let item in assets) {
                if (assets[item] && assets[item]['asset_id']) {
                  this.backToStorage = [...this.backToStorage, { id: assets[item].asset_id, name: assets[item].name, type: assets[item].type, serial: assets[item].serial, name_combined: assets[item].name + (assets[item].serial ? ' (' + assets[item].serial + ')' : ''), citrix: assets[item].citrix }];
                  this.backToStorageCitrixList.push({ id: assets[item].asset_id, name: assets[item].name, type: assets[item].type, serial: assets[item].serial, name_combined: assets[item].name + (assets[item].serial ? ' (' + assets[item].serial + ')' : ''), citrix: assets[item].citrix });
                }
              }
            }
          )
          this.backToStoragePage = 1;
        }
        this.cdr.detectChanges();
      })
    ).subscribe();

    this.manyAssets.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.assetSrv.listAssets(term, 25, 0).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(data => {
      this.manyLists = [];
      this.assetPage = 0;
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
          if (this.manyLists.indexOf(data[item]) == -1) {
            data[item].name_combined = data[item].name + (data[item].serial ? ' (' + data[item].serial + ')' : '');
            this.manyLists = [...this.manyLists, data[item]];
          }
        }
      }
      this.cdr.detectChanges();
    });

    this.placeInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.placeSrv.listPlaces(term, 25, 0).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(data => {
      this.place_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
          if (this.place_items.indexOf(data[item]) == -1)
            this.place_items = [...this.place_items, data[item]];
        }
      }
      this.cdr.detectChanges();
    });

    this.placesAssetsSrv.listExternalPerson(50, 0, null).pipe(take(1)).subscribe(data => {
      this.external_person_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['external_person']) {
          if (this.external_person_items.indexOf(data[item]) == -1)
            this.external_person_items = [...this.external_person_items, data[item]];
        }
      }
    });

    this.externalPersonInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.placesAssetsSrv.listExternalPerson(50, 0, term).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(data => {
      this.external_person_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['external_person']) {
          if (this.external_person_items.indexOf(data[item]) == -1)
            this.external_person_items = [...this.external_person_items, data[item]];
        }
      }
      this.cdr.detectChanges();
    });
  }

  updateErrors() {
    this.reactiveForm.get('external_person').setErrors({ 'invalid': null });
    this.reactiveForm.get('deliverer_person').setErrors({ 'invalid': null });
    this.reactiveForm.get('external_person').updateValueAndValidity();
    this.reactiveForm.get('deliverer_person').updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onSubmitSave() {
    if (!this.reactiveForm.controls.external_person.value && !this.reactiveForm.controls.deliverer_person.value) {
      this.reactiveForm.get('external_person').setErrors({ 'invalid': true });
      this.reactiveForm.get('deliverer_person').setErrors({ 'invalid': true });
      this.cdr.detectChanges();
      return;
    }
    let saveAssets = [];
    let placeDestination = this.reactiveForm.controls.places_assets_place.value;
    if (!this.isDelivery) {
      saveAssets = this.reactiveForm.controls.places_assets_storage.value;
    } else {
      saveAssets = this.reactiveForm.controls.places_assets_storage.value;
      placeDestination = this.loginService.defaultStorageIdValue;
    }
    for (let i = 0; i < saveAssets.length; i++) {
      if (saveAssets[i] !== null) {
        let data = {
          asset: saveAssets[i],
          place: placeDestination,
          delivered: !!this.reactiveForm.controls.delivered.value,
          external_person: this.reactiveForm.controls.external_person.value,
        }
        if (this.reactiveForm.controls.deliverer_person.value) {
          data['deliverer_person'] = this.reactiveForm.controls.deliverer_person.value;
        }
        if (this.reactiveForm.controls.pickup_person_id.value) {
          data['pickup_person_id'] = this.reactiveForm.controls.pickup_person_id.value;
        }

        if (this.reactiveForm.controls.from_datetimez.value) {
          let now_date = new Date(this.reactiveForm.controls.from_datetimez.value);
          let date_options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
          };
          data['from_datetimez'] = new Intl.DateTimeFormat('de-DE', date_options).format(now_date);
        }
        if (this.reactiveForm.controls.until_datetimez.value) {
          let now_date = new Date(this.reactiveForm.controls.until_datetimez.value);
          let date_options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
          };
          data['until_datetimez'] = new Intl.DateTimeFormat('de-DE', date_options).format(now_date);
        }
        this.placesAssetsSrv.createPlacesAssets(data).pipe(take(1)).subscribe((response_data: any) => {
            this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
            this.router.navigate(['/overview/overview']);
          }, error => {
            console.log(error);
            this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
          });
        if (this.citrix_items[saveAssets[i]]) {
          let asset = this.citrix_items[saveAssets[i]].asset;
          this.citrix_items[saveAssets[i]].asset['citrix'] = this.citrix_items[saveAssets[i]].active_citrix;
          this.assetSrv.updateAsset(asset, saveAssets[i]).pipe(take(1)).subscribe((response_data: any) => {
            this.snackBar.open('Citrix Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
          }, error => {
            console.log(error);
            this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
          });
        }
      }
    }
  }

  onFieldChangePlace(query:string) {
    this.placeInput$.next(query);
    this.manyLists = [];
    this.placesAssetsSrv.listPlacesAssets(null, 50, 0, null, Number(query), null, null, null, null, true, true, null, null, true).pipe(take(1)).subscribe(
      data => {
        this.assetPage = 1;
        let list_items = [];
        for (let item in data) {
          if (data[item] && data[item]['asset_id']) {
            this.manyLists = [...this.manyLists, {id: data[item]['asset_id'], name: data[item]['name']}];
            list_items.push(data[item]['asset_id']);
          }
        }
        this.reactiveForm.controls.places_assets_assets.setValue(list_items);
        this.placesAssetsSrv.listPlacesAssets(null, 50, 0, null, this.loginService.defaultStorageIdValue, null, null, null, null, true, true, null, null, true).pipe(take(1)).subscribe(
        inner_data => {
          for (let item in inner_data) {
            if (inner_data[item] && inner_data[item]['asset_id']) {
              this.manyLists = [...this.manyLists, {id: inner_data[item]['asset_id'], name: inner_data[item]['name']}];
            }
          }
        }
        )
      }
    )
  }

  displayFnPlace(data): string {
    for (let item in this.place_items) {
      if (this.place_items[item].id == data) {
        return this.place_items[item].name + ', ' + this.place_items[item].city;
      }
    }
    return '';
  }

  loadMoreBackToStorage() {
    this.placesAssetsSrv.listPlacesAssets(this.backToStorageValue, 50, this.backToStoragePage, null, this.loginService.defaultStorageIdValue, null, null, null, null, true, true, null, null, true).pipe(take(1)).subscribe(
      data => {
        this.backToStoragePage = this.backToStoragePage + 1;
        for (let item in data) {
          if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
            if (this.backToStorage.findIndex(x => x.id === data[item]['id']) < 0) {
              data[item].name_combined = data[item].name + (data[item].serial ? ' (' + data[item].serial + ')' : '')
              this.backToStorage = [...this.backToStorage, data[item]];
              this.backToStorageCitrixList.push({ id: data[item].asset_id, name: data[item].name, type: data[item].type, serial: data[item].serial });
            }
          }
        }
        this.cdr.detectChanges();
      }, error => {
        console.log(error);
      }
    )
  }

  addBackToStorage(data) {
    this.backToStorage = [...this.backToStorage, data.value];
    let items = this.reactiveForm.controls.places_assets_storage.value ? this.reactiveForm.controls.places_assets_storage.value : [];
    items = [...items, data.value.id];
    this.reactiveForm.controls.places_assets_storage.setValue(items);

    this.backToStorageCitrixList.push({ id: data.value.id, name: data.value.name, type: data.value.type, serial: data.value.serial, name_combined: data.value.name + (data.value.serial ? ' (' + data.value.serial + ')' : '') });

    this.citrix_items[data.value.id] = {
      active_citrix: [],
      Input$: new Subject<string>(),
      citrix_items: [],
      loading_finished: false,
      asset: {}
    }
    this.citrix_items[data.value.id].Input$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.citrixSrv.listCitrix(String(term), 50, 0, "citrix_number", "asc", false).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(citrix_data => {
      this.citrix_items[data.value.id].citrix_items = [];
      for (let citrix_total in citrix_data) {
        if (citrix_data.hasOwnProperty(citrix_total) && citrix_data[citrix_total].id) {
          this.citrix_items[data.value.id].citrix_items = [...this.citrix_items[data.value.id].citrix_items, citrix_data[citrix_total]];
        }
      }
      this.cdr.detectChanges();
    });
    this.citrixSrv.listCitrix(null, 50, 0, "citrix_number", "asc", false).pipe(take(1)).subscribe((citrix_data: any) => {
      for (let citrix_total in citrix_data) {
        if (citrix_data.hasOwnProperty(citrix_total) && citrix_data[citrix_total].id) {
          this.citrix_items[data.value.id].citrix_items = [...this.citrix_items[data.value.id].citrix_items, citrix_data[citrix_total]];
        }
      }
      this.assetSrv.getAsset(data.value.id).pipe(take(1)).subscribe((asset_data: any) => {
        this.citrix_items[data.value.id].asset = asset_data;
        if (asset_data.citrix) {
          for (let citrix_item of asset_data.citrix) {
            this.citrix_items[data.value.id].citrix_items = [...this.citrix_items[data.value.id].citrix_items, citrix_item];
            this.citrix_items[data.value.id].active_citrix = [...this.citrix_items[data.value.id].active_citrix, citrix_item.id];
          }
        }
        this.citrix_items[data.value.id].loading_finished = true;
        this.cdr.detectChanges();
      });
    });

    this.cdr.detectChanges();
  }

  backToStorageAddHelper($event) {
    this.citrix_items[$event.id] = {
      active_citrix: [],
      Input$: new Subject<string>(),
      citrix_items: [],
      loading_finished: false,
      asset: {}
    }
    this.citrix_items[$event.id].Input$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.citrixSrv.listCitrix(String(term), 50, 0, "citrix_number", "asc", false).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(citrix_data => {
      this.citrix_items[$event.id].citrix_items = [];
      for (let citrix_total in citrix_data) {
        if (citrix_data.hasOwnProperty(citrix_total) && citrix_data[citrix_total].id) {
          this.citrix_items[$event.id].citrix_items = [...this.citrix_items[$event.id].citrix_items, citrix_data[citrix_total]];
        }
      }
      this.cdr.detectChanges();
    });
    this.citrixSrv.listCitrix(null, 50, 0, "citrix_number", "asc", false).pipe(take(1)).subscribe((citrix_data: any) => {
      for (let citrix_total in citrix_data) {
        if (citrix_data.hasOwnProperty(citrix_total) && citrix_data[citrix_total].id) {
          this.citrix_items[$event.id].citrix_items = [...this.citrix_items[$event.id].citrix_items, citrix_data[citrix_total]];
        }
      }
      this.assetSrv.getAsset($event.id).pipe(take(1)).subscribe((data: any) => {
        this.citrix_items[$event.id].asset = data;
        if (data.citrix) {
          for (let citrix_item of data.citrix) {
            this.citrix_items[$event.id].active_citrix = [...this.citrix_items[$event.id].active_citrix, citrix_item.id];
            if (this.citrix_items[$event.id].citrix_items.findIndex(x => x.id === citrix_item.id) < 0) {
              this.citrix_items[$event.id].citrix_items = [...this.citrix_items[$event.id].citrix_items, citrix_item];
            }
          }
        }
        this.citrix_items[$event.id].loading_finished = true;
        this.cdr.detectChanges();
      });
    });
  }

  backToStorageRemoveHelper($event) {
    this.citrix_items[$event.value.id] = null;
  }

  displayFnType(data): string {
    for (let item in this.external_person_items) {
      if (this.external_person_items[item].external_person == data) {
        return this.external_person_items[item].external_person;
      }
    }
    return '';
  }

  onFieldChangeType(query:string){
    this.externalPersonInput$.next(query);
  }
}

@Pipe({ name: 'arrayFilter' })
export class ArrayFilterPipe implements PipeTransform {
  transform(items: any[], filter: any[]): any {
    if (!items || !filter) {
      return [];
    }
    return items.filter(function(item) {return filter.indexOf(item.id) !== -1});
  }
}
