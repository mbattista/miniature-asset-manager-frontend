import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  reactiveForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService) {
    this.reactiveForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {}

  login() {
    this.loginService.createToken(this.reactiveForm.controls.username.value, this.reactiveForm.controls.password.value).pipe(first()).subscribe(
      data => {
        this.router.navigate(['/']);
      },
      error => {
        this.reactiveForm.get('password').setErrors({ 'password': true });
        this.reactiveForm.get('username').setErrors({ 'username': true });
        console.log(error);
      }
    );
  }

  resetError() {
    if (this.reactiveForm.controls.username.value.length > 0) {
      this.reactiveForm.get('username').setErrors({ 'username': null });
      this.reactiveForm.get('username').updateValueAndValidity();
    }
    if (this.reactiveForm.controls.password.value.length > 0) {
      this.reactiveForm.get('password').setErrors({'password': null});
      this.reactiveForm.get('password').updateValueAndValidity();
    }
  }
}
