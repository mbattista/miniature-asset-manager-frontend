import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlacesAssetsOverviewComponent } from './overview/overview.component';
import { PlacesAssetsOverviewDetailComponent } from './overview/edit/detail.component';

const routes: Routes = [
  { path: 'overview', component: PlacesAssetsOverviewComponent },
  { path: 'create', component: PlacesAssetsOverviewDetailComponent },
  { path: 'return/edit/:id', component: PlacesAssetsOverviewDetailComponent },
  { path: 'delivery/edit/:id', component: PlacesAssetsOverviewDetailComponent },
  { path: 'edit/:id', component: PlacesAssetsOverviewDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlacesAssetsRoutingModule { }
