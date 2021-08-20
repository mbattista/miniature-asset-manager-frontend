import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../routes/sessions/login/login.service';

@Component({
  selector: 'app-user',
  template: `
    <button
      mat-button
      class="matero-toolbar-button matero-avatar-button"
      href="javascript:void(0)"
      [matMenuTriggerFor]="menu"
    >
      <span class="matero-username" fxHide.lt-sm>{{currentUser.first_name}} {{currentUser.last_name}}</span>
    </button>

    <mat-menu #menu="matMenu">
      <a routerLink="/profile/overview" mat-menu-item>
        <mat-icon>account_circle</mat-icon>
        <span>{{ 'user.profile' | translate }}</span>
      </a>
      <a routerLink="/preference" mat-menu-item>
        <mat-icon>settings</mat-icon>
        <span>{{ 'user.settings' | translate }}</span>
      </a>
      <ng-container *ngIf="isAdmin">
        <a routerLink="/user" mat-menu-item>
          <mat-icon>settings</mat-icon>
          <span>{{ 'user.admin' | translate }}</span>
        </a>
      </ng-container>
      <a (click)="logout()" mat-menu-item>
        <mat-icon>exit_to_app</mat-icon>
        <span>{{ 'user.logout' | translate }}</span>
      </a>
    </mat-menu>
  `,
})

export class UserComponent implements OnInit {
  currentUser = {
    first_name: '',
    last_name: ''
  };
  isAdmin:boolean = false;
  per_page_preference: number = 5;

  constructor(private loginService: LoginService, private router: Router ) {}

  ngOnInit() {
    let t = this.loginService.currentUserValue;
    this.currentUser.first_name = t.first_name;
    this.currentUser.last_name = t.last_name;
    this.isAdmin = t.admin;
    this.per_page_preference = t.per_page_preference;
  }

  logout()
  {
    this.loginService.deleteToken();
    this.router.navigate(['/auth/login']);
  }
}

