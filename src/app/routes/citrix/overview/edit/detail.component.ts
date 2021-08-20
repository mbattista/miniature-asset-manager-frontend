import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { switchMap, take, tap } from 'rxjs/operators';
import { CitrixOverviewService } from '../overview.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LoginService } from '../../../sessions/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { AssetOverviewService } from '../../../asset/overview/overview.service';

@Component({
  selector: 'app-citrix-overview-edit',
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitrixOverviewDetailComponent implements OnInit {
  reactiveForm: FormGroup;
  isCreate: boolean = true;
  citrixId: number = 0;
  citrixTitle: string = '';
  assets = [];
  isLoadingAsset$ = new BehaviorSubject<boolean>(false);
  isLoadingCitrix$ = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private citrixSrv: CitrixOverviewService,
    private assetSrv: AssetOverviewService,
  ) {
    this.reactiveForm = this.fb.group({
      citrix_number: [null, [Validators.required]],
      password: [null],
      show_id: [null],
    });
  }

  ngOnInit() {
    this.isCreate = this.router.url.indexOf('/edit/') <= 0;

    if (!this.isCreate) {
      this.isLoadingAsset$.next(true);
      this.isLoadingCitrix$.next(true);
      this.cdr.detectChanges();
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
            return this.citrixSrv.getCitrix(Number(params.get('id')))
          }
        ),tap((citrix: any) => {
          this.citrixId = citrix.id;
          this.citrixTitle = citrix.citrix_number;
          this.reactiveForm.controls.citrix_number.setValue(citrix.citrix_number);
          this.reactiveForm.controls.password.setValue(citrix.password);
          this.reactiveForm.controls.show_id.setValue(citrix.show_id);
          this.isLoadingCitrix$.next(false);
          this.cdr.detectChanges();
        }),
        switchMap((citrix: any) => {
            return this.assetSrv.listAssets(citrix.citrix_number, 100, 0);
          }
        ),tap((assets: any) => {
          this.assets = [];
          Object.entries(assets).forEach(
            ([key, value]) => {
              if (typeof value === 'object')
                this.assets.push(value)
            }
          );
          this.isLoadingAsset$.next(false);
          this.cdr.detectChanges();
        })
      ).subscribe();
    } else {
      this.citrixTitle = 'Neuer Citrix-Benutzer';
    }
  }

  onSubmitSave() {
    let citrix = {
      citrix_number: this.reactiveForm.controls.citrix_number.value,
      password:this.reactiveForm.controls.password.value,
      show_id: this.reactiveForm.controls.show_id.value
    }
    if (this.isCreate) {
      this.citrixSrv.createCitrix(citrix).pipe(take(1)).subscribe((data: any) => {
            this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
            this.router.navigate(['/data/citrix/edit/' + data.id]);
        },
        error => {
          this.reactiveForm.get(error).setErrors({ 'duplicate': true });
          console.log(error);
          this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
          this.cdr.detectChanges();
        });
    } else {
      this.citrixSrv.updateCitrix(citrix, this.citrixId).pipe(take(1)).subscribe((data: any) => {
          this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
          this.router.navigate(['/data/citrix/edit/' + this.citrixId]);
        },
        error => {
          this.reactiveForm.get(error).setErrors({ 'duplicate': true });
          console.log(error);
          this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
        }
      );
    }
  }
}
