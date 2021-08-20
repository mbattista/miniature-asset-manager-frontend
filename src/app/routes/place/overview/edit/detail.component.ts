import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnInit} from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, tap } from 'rxjs/operators';
import { PlaceOverviewService } from '../overview.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LoginService } from '../../../sessions/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlacesAssetsOverviewService } from '../../../places-assets/overview/overview.service';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { CitrixOverviewService } from '../../../citrix/overview/overview.service';
import {AssetUserOverviewService} from "../../../asset_user/overview/overview.service";
import {AssetOverviewService} from "../../../asset/overview/overview.service";
import {DeletedialogComponent} from "@shared/components/delete-dialog/deletedialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-place-overview-edit',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceOverviewDetailComponent implements OnInit {
  reactiveForm: FormGroup;
  isCreate: boolean = true;
  isAdmin: boolean = false;
  placeId: number = 0;
  placeTitle: string = '';
  placesAssets = [];
  placesUsers = [];
  assets = [];
  isLoadingPlace$ = new BehaviorSubject<boolean>(false);
  isLoadingHistory$ = new BehaviorSubject<boolean>(false);
  isLoadingUsers$ = new BehaviorSubject<boolean>(false);
  isLoadingAssets$ = new BehaviorSubject<boolean>(false);

  currentWindowWidth: number;
  showTable = true;

  citrixInput$ = new Subject<string>();
  citrix_items = [];
  start_items = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private citrixSrv: CitrixOverviewService,
    private assetUserSrv: AssetUserOverviewService,
    private placeSrv: PlaceOverviewService,
    private placesAssetsSrv: PlacesAssetsOverviewService,
    private assetSrv: AssetOverviewService,
    public dialog: MatDialog,
  ) {
    this.reactiveForm = this.fb.group({
      isActive: [true, [Validators.required]],
      place_name: [null, [Validators.required]],
      place_street: [null, [Validators.required]],
      place_number: [null, [Validators.required]],
      place_postcode: [null, [Validators.required]],
      place_city: [null, [Validators.required]],
      place_tel1: [null],
      place_tel2: [null],
      place_tel3: [null],
      place_tel4: [null],
      place_fax: [null],
      place_citrix: [null],
      place_opening_times: [null],
      place_website: [null],
      place_email: [null],
      place_text: [null],
    });
  }

  ngOnInit() {
    this.currentWindowWidth = window.innerWidth;
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    }

    this.isAdmin = this.loginService.currentUserValue.admin;
    this.isCreate = this.router.url.indexOf('/edit/') <= 0;

    if (!this.isCreate) {
      this.isLoadingPlace$.next(true);
      this.isLoadingHistory$.next(true);
      this.isLoadingUsers$.next(true);
      this.cdr.detectChanges();
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
            return this.placeSrv.getPlace(Number(params.get('id')))
          }
        ),tap((data: any) => {
          let citr = [];
          if (data.citrix) {
            for (let key in data.citrix) {
              this.citrix_items = [...this.citrix_items, { 'id': key , 'citrix_number': data.citrix[key]['citrix_number'] }];
              citr.push(key);
            }
          }
          this.start_items = citr;

          this.placeId = data.id;
          this.placeTitle = data.name + ', ' + data.city;
          this.reactiveForm.controls.isActive.setValue(!!data.active);
          this.reactiveForm.controls.place_name.setValue(data.name);
          this.reactiveForm.controls.place_street.setValue(data.street);
          this.reactiveForm.controls.place_number.setValue(data.number);
          this.reactiveForm.controls.place_postcode.setValue(data.postcode);
          this.reactiveForm.controls.place_city.setValue(data.city);
          this.reactiveForm.controls.place_tel1.setValue(data.tel1);
          this.reactiveForm.controls.place_tel2.setValue(data.tel2);
          this.reactiveForm.controls.place_tel3.setValue(data.tel3);
          this.reactiveForm.controls.place_tel4.setValue(data.tel4);
          this.reactiveForm.controls.place_citrix.setValue(citr);
          this.reactiveForm.controls.place_fax.setValue(data.fax);
          this.reactiveForm.controls.place_opening_times.setValue(data.opening_times);
          this.reactiveForm.controls.place_website.setValue(data.website);
          this.reactiveForm.controls.place_email.setValue(data.email);
          this.reactiveForm.controls.place_text.setValue(data.text);
          this.isLoadingPlace$.next(false);
          this.cdr.detectChanges();
        }),
        switchMap((data: any) => {
            return this.placesAssetsSrv.listPlacesAssets(null, 100, 0, null, this.placeId, null, null, null, null, true, true, null, null, false);
          }
        ),tap((placesAssets: any) => {
          this.placesAssets = [];
          Object.entries(placesAssets).forEach(
            ([key, value]) => {
              if (typeof value === 'object')
                this.placesAssets.push(value)
            }
          );
          this.isLoadingHistory$.next(false);
          this.cdr.detectChanges();
        }),
        switchMap((data: any) => {
            return this.placesAssetsSrv.listPlacesAssets(null, 100, 0, null, this.placeId, null, null, null, null, true, true, null, null, true);
          }
        ),tap((placesAssets: any) => {
          this.assets = [];
          Object.entries(placesAssets).forEach(
            ([key, value]) => {
              if (typeof value === 'object')
                this.assets.push(value)
            }
          );
          this.isLoadingAssets$.next(false);
          this.cdr.detectChanges();
        }),
        switchMap((data: any) => {
            return this.assetUserSrv.listAssetUsers(null, 100, 0, this.placeId);
          }
        ),tap((data: any) => {
          this.placesUsers = [];
          Object.entries(data).forEach(
            ([key, value]) => {
              if (typeof value === 'object')
                this.placesUsers.push(value)
            }
          );
          this.isLoadingUsers$.next(false);
          this.cdr.detectChanges();
        }),
      ).subscribe();
    } else {
      this.placeTitle = 'Neuer Standort';
    }

    this.citrixSrv.listCitrix(null, 25, 0, 'citrix_number', 'asc', false).pipe(take(1)).subscribe(data => {
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['citrix_number']) {
          let alreadyKnown = false;
          for (let start_item of this.start_items) {
            if (start_item.id == data[item].id) {
              alreadyKnown = true;
            }
          }
          if (!alreadyKnown)
            this.citrix_items = [...this.citrix_items, data[item]];
        }
      }
    });

    this.citrixInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.citrixSrv.listCitrix(term, 25, 0, 'citrix_number', 'asc', false).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(data => {
      this.citrix_items = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['citrix_number']) {
          if (this.citrix_items.indexOf(data[item]) == -1)
            this.citrix_items = [...this.citrix_items, data[item]];
        }
      }
      this.cdr.detectChanges();
    });
  }

  onSubmitSave() {
    let place = {
      active: Boolean(!!this.reactiveForm.controls.isActive.value),
      name: this.reactiveForm.controls.place_name.value,
      street: this.reactiveForm.controls.place_street.value,
      number: this.reactiveForm.controls.place_number.value,
      postcode: this.reactiveForm.controls.place_postcode.value,
      city: this.reactiveForm.controls.place_city.value,
      tel1: this.reactiveForm.controls.place_tel1.value,
      tel2: this.reactiveForm.controls.place_tel2.value,
      tel3: this.reactiveForm.controls.place_tel3.value,
      tel4: this.reactiveForm.controls.place_tel4.value,
      fax: this.reactiveForm.controls.place_fax.value,
      opening_times: this.reactiveForm.controls.place_opening_times.value,
      citrix: this.reactiveForm.controls.place_citrix.value,
      website: this.reactiveForm.controls.place_website.value,
      email: this.reactiveForm.controls.place_email.value,
      text: this.reactiveForm.controls.place_text.value,
    }
    if (this.isCreate) {
      this.placeSrv.createPlace(place).pipe(take(1)).subscribe((data: any) => {
            this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
            this.router.navigate(['/data/places/edit/' + data.id]);
          }, error => {
            console.log(error);
            this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
          });
    } else {
      this.placeSrv.updatePlace(place, this.placeId).pipe(take(1)).subscribe((data: any) => {
          this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
          this.router.navigate(['/data/places/edit/' + this.placeId]);
        },
        error => {
          console.log(error);
          this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
        }
      );
    }
  }

  deleteAsset(asset_id) {
    const dialogRef = this.dialog.open(DeletedialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'y') {
        this.assetSrv.deleteAsset(asset_id).pipe(take(1)).subscribe(
          data => {
            this.snackBar.open('Gerät erfolgreich gelöscht', 'schließen', { duration: 5000 });
            for (let i = 0; i < this.assets.length; i++) {
              if (this.assets[i].asset_id == asset_id) {
                this.assets = [...this.assets.splice(0, i), ...this.assets.slice(i + 1)]
              }
            }
            this.cdr.detectChanges();
          },
          error => { this.snackBar.open('Gerät konnte nicht gelöscht werden!', 'schließen', { duration: 5000 }); }
        )
      }
    });
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
