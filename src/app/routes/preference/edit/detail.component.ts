import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { PreferenceService } from './preference.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../sessions/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-preference-edit',
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferenceComponent implements OnInit {
  reactiveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private preferenceSrv: PreferenceService,
  ) {
    this.reactiveForm = this.fb.group({
      per_page_preference: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    this.reactiveForm.controls.per_page_preference.setValue(this.loginService.currentUserValue.per_page_preference);
  }

  onSubmitSave() {
    let preference = {
      per_page_preference: this.reactiveForm.controls.per_page_preference.value
    }
    this.preferenceSrv.updatePreference(this.loginService.currentUserValue.id, preference).pipe(take(1)).subscribe(
      (data: any) => {
        this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
        this.loginService.updatePerPagePreference(this.reactiveForm.controls.per_page_preference.value);
      },
      error => {
        console.log(error);
        this.snackBar.open('Fehler beim speichern!', 'schließen', { duration: 5000 });
        this.cdr.detectChanges();
      }
    );
  }
}
