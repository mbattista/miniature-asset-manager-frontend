import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlaceOverviewComponent } from './overview/overview.component';
import { PlaceOverviewDetailComponent } from './overview/edit/detail.component';

const routes: Routes = [
  { path: 'places', component: PlaceOverviewComponent },
  { path: 'places/edit/:id', component: PlaceOverviewDetailComponent },
  { path: 'places/create', component: PlaceOverviewDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlaceRoutingModule { }
