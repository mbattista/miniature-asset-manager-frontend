import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, tap } from 'rxjs/operators';
import { AssetOverviewService } from '../overview.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LoginService } from '../../../sessions/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlacesAssetsOverviewService } from '../../../places-assets/overview/overview.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { CitrixOverviewService } from '../../../citrix/overview/overview.service';
import {CitrixassetsService} from "../../../citrix-assets/citrixassets.service";

@Component({
  selector: 'app-asset-overview-edit',
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetOverviewDetailComponent implements OnInit {
  reactiveForm: FormGroup;
  isCreate: boolean = true;
  assetId: number = 0;
  placesAssets = [];
  citrixAssets = [];
  assetTitle: string = ''
  isLoadingAsset$ = new BehaviorSubject<boolean>(false);
  isLoadingHistory$ = new BehaviorSubject<boolean>(false);
  isLoadingCitrixHistory$ = new BehaviorSubject<boolean>(false);

  date_options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
  };

  currentWindowWidth: number;
  showTable = true;

  citrixInput$ = new Subject<string>();
  citrix_items = [];

  typeInput$ = new Subject<string>();
  type_items = [];

  nameInput$ = new Subject<string>();
  name_items = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private assetSrv: AssetOverviewService,
    private citrixSrv: CitrixOverviewService,
    private placesAssetsSrv: PlacesAssetsOverviewService,
    private citrixAssetSrv: CitrixassetsService
  ) {
    this.reactiveForm = this.fb.group({
      isActive: [true, [Validators.required]],
      isOOO: [false, [Validators.required]],
      asset_type: [null, [Validators.required]],
      asset_serial: [null],
      asset_teamviewer_id: [null],
      asset_citrix: [null],
      asset_name: [null, [Validators.required]],
      asset_text: [null],
      asset_date: [null]
    });
  }

  ngOnInit() {
    this.currentWindowWidth = window.innerWidth;
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    }

    this.isCreate = this.router.url.indexOf('/edit/') <= 0;

    if (!this.isCreate) {
      this.isLoadingAsset$.next(true);
      this.isLoadingHistory$.next(true);
      this.cdr.detectChanges();
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
          return this.assetSrv.getAsset(Number(params.get('id')))
        }
      ),tap((asset: any) => {
          let citr = [];
          if (asset.citrix) {
            for (let key in asset.citrix) {
              this.citrix_items = [...this.citrix_items, {
                'id': asset.citrix[key]['id'],
                'citrix_number': asset.citrix[key]['citrix_number']
              }];
              citr.push(asset.citrix[key]['id']);
            }
          }
          this.type_items = [...this.type_items, { type: asset.type }];
          this.name_items = [...this.name_items, { name: asset.name }]

          this.assetId = asset.id;
          this.assetTitle = asset.name + (asset.serial ? (' (' + asset.serial + ')') : '');
          this.reactiveForm.controls.isActive.setValue(!!asset.active);
          this.reactiveForm.controls.isOOO.setValue(!!asset.out_of_order);
          this.reactiveForm.controls.asset_name.setValue(asset.name);
          this.reactiveForm.controls.asset_serial.setValue(asset.serial);
          this.reactiveForm.controls.asset_teamviewer_id.setValue(asset.teamviewer_string);
          this.reactiveForm.controls.asset_citrix.setValue(citr);
          this.reactiveForm.controls.asset_type.setValue(asset.type);
          this.reactiveForm.controls.asset_text.setValue(asset.text);
          this.isLoadingAsset$.next(false);
          this.cdr.detectChanges();
      }),
        switchMap((asset: any) => {
            return this.placesAssetsSrv.listPlacesAssets(null, 100, 0, asset.id, null, null, null, null, null, true, true, null, null, false);
          }
        ),
        tap((placesAssets: any) => {
          this.placesAssets = [];
          Object.entries(placesAssets).forEach(
            ([key, value]) => {
              if (typeof value === 'object') {
                value['iso_date_until'] = '';
                if (value['from_datetimez']) {
                  let now_date = new Date(value['from_datetimez'].replace(/\+[0-9]{1,2}/g, ''));
                  value['iso_date_from'] = new Intl.DateTimeFormat('de-DE', this.date_options).format(now_date);
                }
                if (value['until_datetimez']) {
                  let now_date = new Date(value['until_datetimez'].replace(/\+[0-9]{1,2}/g, ''));
                  value['iso_date_until'] = new Intl.DateTimeFormat('de-DE', this.date_options).format(now_date);
                }
                this.placesAssets.push(value)
              }
            }
          );
          this.isLoadingHistory$.next(false);
          this.cdr.detectChanges();
        }),
        switchMap((pa: any) => {
          return this.citrixSrv.listCitrix(null, 25, 0, 'citrix_number', 'asc', false);
        }),
        tap((data: any) => {
          this.citrix_items = [];
          for (let key in data) {
            if (data[key] && data.hasOwnProperty(key) && data[key]['citrix_number']) {
              let item = { id: data[key]['id'], citrix_number: data[key]['citrix_number'] }
              if (this.citrix_items.indexOf(item) == -1) {
                this.citrix_items = [...this.citrix_items, item];
              }
            }
          }
        }),
        switchMap((asset: any) => {
            return this.citrixAssetSrv.listAssetCitrix(null, 25, 0, null, null, this.assetId, null, true);
          }
        ),
        tap((citrixAssets: any) => {
          this.citrixAssets = [];
          Object.entries(citrixAssets).forEach(
            ([key, value]) => {
              if (typeof value === 'object')
                this.citrixAssets.push(value)
            }
          );
          this.isLoadingCitrixHistory$.next(false);
          this.cdr.detectChanges();
        }),
      ).subscribe();
    } else {
      this.assetTitle = 'Neues Gerät';
      this.citrixSrv.listCitrix(null, 25, 0, 'citrix_number', 'asc', false).pipe(take(1)).subscribe(
        (data: any) => {
          this.citrix_items = [];
          for (let key in data) {
            if (data[key] && data.hasOwnProperty(key) && data[key]['citrix_number']) {
              let item = { id: data[key]['id'], citrix_number: data[key]['citrix_number'] }
              if (this.citrix_items.indexOf(item) == -1) {
                this.citrix_items = [...this.citrix_items, item];
              }
            }
          }
        }
      )
    }

    this.citrixInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.citrixSrv.listCitrix(term, 25, 0, 'citrix_number', 'asc').pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(data => {
      this.citrix_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
          if (this.citrix_items.indexOf(data[item]) == -1)
            this.citrix_items = [...this.citrix_items, data[item]];
        }
      }
      this.cdr.detectChanges();
    });

    this.assetSrv.listAssetTypes(null, 25, 0).pipe(take(1)).subscribe(data => {
      this.type_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['type']) {
          if (this.type_items.indexOf(data[item]) == -1)
            this.type_items = [...this.type_items, data[item]];
        }
      }
    });

    this.assetSrv.listAssetNames(null, 25, 0).pipe(take(1)).subscribe(data => {
      this.name_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['name']) {
          if (this.name_items.indexOf(data[item]) == -1)
            this.name_items = [...this.name_items, data[item]];
        }
      }
    });

    this.typeInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.assetSrv.listAssetTypes(term, 25, 0).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(data => {
      this.type_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['type']) {
          if (this.type_items.indexOf(data[item]) == -1)
            this.type_items = [...this.type_items, data[item]];
        }
      }
      this.cdr.detectChanges();
    });

    this.nameInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.assetSrv.listAssetNames(term, 25, 0).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(data => {
      this.name_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['name']) {
          if (this.name_items.indexOf(data[item]) == -1)
            this.name_items = [...this.name_items, data[item]];
        }
      }
      this.cdr.detectChanges();
    });
  }

  onSubmitSave() {
    let asset = {
      type: this.reactiveForm.controls.asset_type.value,
      name:this.reactiveForm.controls.asset_name.value,
      serial: this.reactiveForm.controls.asset_serial.value,
      teamviewer_id: this.reactiveForm.controls.asset_teamviewer_id.value,
      citrix: this.reactiveForm.controls.asset_citrix.value,
      text: this.reactiveForm.controls.asset_text.value,
      active: Boolean(this.reactiveForm.controls.isActive.value),
      out_of_order: Boolean(this.reactiveForm.controls.isOOO.value)
    }
    if (this.isCreate) {
      this.assetSrv.createAsset(asset).pipe(take(1)).subscribe((data: any) => {
        let now_date = new Date();
        if (this.reactiveForm.controls.asset_date.value) {
          now_date = new Date(this.reactiveForm.controls.asset_date.value);
        }
        let date_options = {
          year: 'numeric', month: '2-digit', day: '2-digit',
        };
        let formated_date = new Intl.DateTimeFormat('de-DE', date_options).format(now_date);
        let places_assets = {
          place: this.loginService.defaultStorageIdValue,
          asset: Number(data['id']),
          deliverer_person: this.loginService.currentUserValue.id,
          delivery_datetimez: formated_date,
          from_datetimez: formated_date,
          delivered: true,
        }
        let asset_id = data['id'];
        this.placesAssetsSrv.createPlacesAssets(places_assets).pipe(take(1)).subscribe((data: any) => {
          this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
          this.router.navigate(['/data/assets/edit/' + asset_id]);
        }, error => {
          console.log(error);
          this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
        });
      },
        error => {
          this.reactiveForm.get('asset_' + error).setErrors({ 'duplicate': true });
          console.log(error);
          this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
          this.cdr.detectChanges();
        });
    } else {
      this.assetSrv.updateAsset(asset, this.assetId).pipe(take(1)).subscribe((data: any) => {
        this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
        this.router.navigate(['/data/assets/edit/' + this.assetId]);
      },
      error => {
        console.log(error);
        this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
      }
      );
    }
  }

  onFieldChangeType(query:string){
    this.typeInput$.next(query);
  }

  onFieldChangeName(query:string){
    this.nameInput$.next(query);
  }

  displayFnType(data): string {
    for (let item in this.type_items) {
      if (this.type_items[item].type == data) {
        return this.type_items[item].type;
      }
    }
    return '';
  }

  displayFnName(data): string {
    for (let item in this.name_items) {
      if (this.name_items[item].name == data) {
        return this.name_items[item].name;
      }
    }
    return '';
  }

  @HostListener('window:resize')
  onResize() {
    this.currentWindowWidth = window.innerWidth
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    } else {
      this.showTable = true;
    }
  }
}
