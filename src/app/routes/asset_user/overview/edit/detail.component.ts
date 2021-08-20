import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, tap } from 'rxjs/operators';
import { AssetUserOverviewService } from '../overview.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LoginService } from '../../../sessions/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { PersonService } from '../../../person/person.service';
import { PlaceOverviewService } from '../../../place/overview/overview.service';

@Component({
  selector: 'app-asset-user-overview-edit',
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetUserOverviewDetailComponent implements OnInit {
  reactiveForm: FormGroup;
  isCreate: boolean = true;
  assetUserId: number = 0;
  personId: number = 0;
  placeId: number = 0;
  assetUserTitle: string = '';
  place_items = [];
  nav = [ "home", "menu.data" ];
  placeLoading = false;
  placeInput$ = new Subject<string>();
  isLoadingAsset$ = new BehaviorSubject<boolean>(false);
  canEditPlace = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private assetUserSrv: AssetUserOverviewService,
    private personSrv: PersonService,
    private placeSrv: PlaceOverviewService
  ) {
    this.reactiveForm = this.fb.group({
      isActive: [true, [Validators.required]],
      asset_user_first_name: [null, [Validators.required]],
      asset_user_last_name: [null, [Validators.required]],
      asset_user_place: [null, [Validators.required]],
      asset_user_text: [null],
      asset_user_active: [null],
      asset_user_tel: [null],
      asset_user_mobile: [null],
      asset_user_email: [null],
    });
  }

  ngOnInit() {
    this.isCreate = this.router.url.indexOf('/edit/') <= 0;
    this.canEditPlace = this.router.url.indexOf('/place/') <= 0;

    if (!this.isCreate) {
      this.isLoadingAsset$.next(true);
      this.cdr.detectChanges();
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
            return this.assetUserSrv.getAssetUser(Number(params.get('id')))
          }
        ),tap((data: any) => {
          this.placeSrv.getPlace(data.place).pipe(take(1)).subscribe((place_data: any) => {
            this.place_items = [...this.place_items, place_data];
            this.assetUserId = data.id;

            this.assetUserTitle = data.first_name + ' ' + data.last_name;

            this.nav.push("place_user")
            this.nav.push('hidden_' + place_data.name);
            this.nav.push('hidden_' + place_data.id);
            this.nav.push("Ansprechpartner");

            this.reactiveForm.controls.isActive.setValue(!!data.active);
            this.reactiveForm.controls.asset_user_first_name.setValue(data.first_name);
            this.reactiveForm.controls.asset_user_last_name.setValue(data.last_name);
            this.reactiveForm.controls.asset_user_place.setValue(data.place);
            this.reactiveForm.controls.asset_user_text.setValue(data.text);
            this.reactiveForm.controls.asset_user_tel.setValue(data.tel);
            this.reactiveForm.controls.asset_user_mobile.setValue(data.mobile);
            this.reactiveForm.controls.asset_user_active.setValue(data.active);
            this.reactiveForm.controls.asset_user_email.setValue(data.email);
            this.isLoadingAsset$.next(false);
            this.personId = data.person;
            this.placeId = data.place;

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
            this.cdr.detectChanges();
          });


        })
      ).subscribe();
    } else if (!this.canEditPlace) {
      this.assetUserTitle = 'Neuer Ansprechpartner';
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
            return this.placeSrv.getPlace(Number(params.get('place_id')))
          }
        ),tap((data: any) => {
          this.placeId = data.id;

          this.nav.push("place_user")
          this.nav.push('hidden_' + data.name);
          this.nav.push('hidden_' + data.id);
          this.nav.push("Ansprechpartner");

          this.place_items = [...this.place_items, data];
          this.reactiveForm.controls.asset_user_place.setValue(data.id);
          this.cdr.detectChanges();
        })
      ).subscribe();
    } else {
      this.assetUserTitle = 'Neuer Ansprechpartner';
      this.placeSrv.listPlaces(null, 25, 0).pipe(take(1)).subscribe(
        (data: any) => {
          for (let item in data) {
            if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
              if (this.place_items.indexOf(data[item]) == -1)
                this.place_items = [...this.place_items, data[item]];
            }
          }
          this.cdr.detectChanges();
        }
      )
    }

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

  }

  onSubmitSave(goto) {
    let person_data = {
      first_name: this.reactiveForm.controls.asset_user_first_name.value,
      last_name: this.reactiveForm.controls.asset_user_last_name.value,
    }
    let data = {
      person: this.personId,
      place: this.reactiveForm.controls.asset_user_place.value,
      text: this.reactiveForm.controls.asset_user_text.value,
      email: this.reactiveForm.controls.asset_user_email.value,
      tel: this.reactiveForm.controls.asset_user_tel.value,
      mobile: this.reactiveForm.controls.asset_user_mobile.value,
      active: Boolean(this.reactiveForm.controls.isActive.value)
    }
    if (this.isCreate) {
      this.personSrv.createPerson(person_data).pipe(take(1)).subscribe((person: any) => {
          data.person = Number(person.id);
          this.assetUserSrv.createAssetUser(data).pipe(take(1)).subscribe((asset_user: any) => {
              this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
              if (goto === 0) {
                this.router.navigate(['/data/places/edit/' + this.placeId]);
              } else {
                this.reactiveForm.controls.isActive.setValue(true);
                this.reactiveForm.controls.asset_user_first_name.setValue(null);
                this.reactiveForm.controls.asset_user_last_name.setValue(null);
                this.reactiveForm.controls.asset_user_text.setValue(null);
                this.reactiveForm.controls.asset_user_tel.setValue(null);
                this.reactiveForm.controls.asset_user_mobile.setValue(null);
                this.reactiveForm.controls.asset_user_active.setValue(null);
                this.reactiveForm.controls.asset_user_email.setValue(null);
              }
          }, error => {
            console.log(error);
            this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
          })
          }, error => {
            console.log(error);
            this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
          });
    } else {
      this.personSrv.updatePerson(person_data, this.personId).pipe(take(1)).subscribe((data: any) => {
          if (goto === 0) {
            this.cdr.detectChanges();
            this.router.navigate(['/data/places/edit/' + this.placeId]);
          } else {
            this.reactiveForm.controls.isActive.setValue(true);
            this.reactiveForm.controls.asset_user_first_name.setValue(null);
            this.reactiveForm.controls.asset_user_last_name.setValue(null);
            this.reactiveForm.controls.asset_user_text.setValue(null);
            this.reactiveForm.controls.asset_user_tel.setValue(null);
            this.reactiveForm.controls.asset_user_mobile.setValue(null);
            this.reactiveForm.controls.asset_user_active.setValue(null);
            this.reactiveForm.controls.asset_user_email.setValue(null);
          }
        },
        error => {
          console.log(error);
          this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
        }
      );
      this.assetUserSrv.updateAssetUser(data, this.assetUserId).pipe(take(1)).subscribe((data: any) => {
          this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
          this.router.navigate(['/data/place_users/edit/' + this.assetUserId]);
        },
        error => {
          console.log(error);
          this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
        }
      );
    }
  }

  isAdmin(): boolean {
    return this.loginService.currentUserValue.admin;
  }

  onSubmitDelete(): void {
    this.assetUserSrv.deleteAssetUser(this.assetUserId).pipe(take(1)).subscribe(data => {
      this.snackBar.open('Erfolgreich gelöscht!', 'schließen', { duration: 5000 });
      this.cdr.detectChanges();
      this.router.navigate(['/data/places/edit/' + this.placeId]);
    });
  }

  customSearchFn(term: string, item) {
    term = term.toLowerCase();
    return (item.name && item.name.toLowerCase().indexOf(term) > -1) || (item.street && item.street.toLowerCase().indexOf(term) > -1) || (item.city && item.city.toLowerCase().indexOf(term) > -1);
  }
}
