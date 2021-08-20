import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetUserOverviewComponent } from './overview/overview.component';
import { AssetUserOverviewDetailComponent } from './overview/edit/detail.component';

const routes: Routes = [
  { path: 'place_users', component: AssetUserOverviewComponent },
  { path: 'place_users/edit/:id', component: AssetUserOverviewDetailComponent },
  { path: 'place_users/create', component: AssetUserOverviewDetailComponent },
  { path: 'place_users/create/place/:place_id', component: AssetUserOverviewDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetUserRoutingModule { }
