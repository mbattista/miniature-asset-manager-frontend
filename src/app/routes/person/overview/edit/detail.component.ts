import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { switchMap, take, tap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LoginService } from '../../../sessions/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import {PersonService} from "../../person.service";

@Component({
  selector: 'app-user-overview-edit',
  templateUrl: './detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOverviewDetailComponent implements OnInit {
  reactiveForm: FormGroup;
  isCreate: boolean = true;
  userId: number = 0;
  person_id: number = 0;
  assets = [];
  isLoadingUser$ = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private userSrv: PersonService,
  ) {
    this.reactiveForm = this.fb.group({
      email: [null, [Validators.required]],
      nickname: [null, [Validators.required]],
      first_name: [null],
      last_name: [null],
      password: [null],
    });
  }

  ngOnInit() {
    this.isCreate = this.router.url.indexOf('/edit/') <= 0;

    if (!this.isCreate) {
      this.isLoadingUser$.next(true);
      this.cdr.detectChanges();
      this.route.paramMap.pipe(
        switchMap((params: ParamMap) => {
            return this.userSrv.getUser(Number(params.get('id')))
          }
        ),tap((user: any) => {
          this.userId = user.id;
          this.person_id = user.person;
          this.reactiveForm.controls.email.setValue(user.email);
          this.reactiveForm.controls.password.setValue(user.password);
          this.reactiveForm.controls.nickname.setValue(user.nickname);
          this.reactiveForm.controls.first_name.setValue(user.first_name);
          this.reactiveForm.controls.last_name.setValue(user.last_name);
          this.isLoadingUser$.next(false);
          this.cdr.detectChanges();
        }),
      ).subscribe();
    }
  }

  onSubmitSave() {
    let person_data = {
      first_name: this.reactiveForm.controls.first_name.value,
      last_name: this.reactiveForm.controls.last_name.value,
    }
    let user = {
      nickname: this.reactiveForm.controls.nickname.value,
      password:this.reactiveForm.controls.password.value,
      email: this.reactiveForm.controls.email.value,
      person: this.person_id
    }
    if (this.isCreate) {
      this.userSrv.createPerson(person_data).pipe(take(1)).subscribe((person: any) => {
        user.person = Number(person.id);
        this.userSrv.createUser(user).pipe(take(1)).subscribe((data: any) => {
            this.snackBar.open('Erfolgreich gespeichert!', 'schließen', {duration: 5000});
            this.router.navigate(['/data/user/edit/' + data.id]);
          },
          error => {
            this.reactiveForm.get(error).setErrors({'duplicate': true});
            console.log(error);
            this.snackBar.open('Fehler beim speichern!', 'schließen', {duration: 5000});
            this.cdr.detectChanges();
          });
      });
      } else {
        this.userSrv.updatePerson(person_data, this.person_id).pipe(take(1)).subscribe((data: any) => {});
        this.userSrv.updateUser(user, this.userId).pipe(take(1)).subscribe((data: any) => {
            this.snackBar.open('Erfolgreich gespeichert!', 'schließen', { duration: 5000 });
            this.router.navigate(['/data/user/edit/' + this.userId]);
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
