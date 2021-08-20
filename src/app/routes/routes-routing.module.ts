import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from '@env/environment';

import { AdminLayoutComponent } from '@theme/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '@theme/auth-layout/auth-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './sessions/login/login.component';
import { RegisterComponent } from './sessions/register/register.component';
import { AuthGuard } from '@core/authentication/auth.guard';
import {PreferenceComponent} from "./preference/edit/detail.component";
import {UserOverviewComponent} from "./person/overview/overview.component";
import {UserOverviewDetailComponent} from "./person/overview/edit/detail.component";
import {PlaceDashboardComponent} from "./place-dashboard/place-dashboard.component";
import {ExternalPersonPlacesAssetsOverviewComponent} from "./places-assets/external-person-overview/overview.component";
import {PersonPlacesAssetsOverviewComponent} from "./places-assets/user-overview/overview.component";

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'preference',
        component: PreferenceComponent
      },
      {
        path: 'user',
        component: UserOverviewComponent
      },
      { path: 'user/edit/:id', component: UserOverviewDetailComponent },
      { path: 'user/create', component: UserOverviewDetailComponent },
      { path: 'data/external-persons/:id', component: ExternalPersonPlacesAssetsOverviewComponent },
      { path: 'data/persons/:id', component: PersonPlacesAssetsOverviewComponent },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard', titleI18n: 'dashboard' },
      },
      {
        path: 'detail/place/:place/date/:date',
        component: PlaceDashboardComponent,
        data: { title: 'Detail', titleI18n: 'Detail' },
      },
      {
        path: 'sessions',
        loadChildren: () => import('./sessions/sessions.module').then(m => m.SessionsModule),
        data: { title: 'Sessions', titleI18n: 'Sessions' },
      },
      {
        path: 'overview',
        loadChildren: () => {
          return import('./places-assets/places-assets.module').then(m => m.PlacesAssetsModule)
        },
        data: { title: 'Übersicht', titleI18n: 'Übersicht' },
      },
      {
        path: 'data',
        loadChildren: () => {
          return import('./data/data.module').then(m => m.DataModule)
        },
        data: { title: 'Stammdaten', titleI18n: 'Stammdaten' },
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Login', titleI18n: 'Login' },
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'Register', titleI18n: 'Register' },
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: environment.useHash,
    }),
  ],
  exports: [RouterModule],
})
export class RoutesRoutingModule {}
