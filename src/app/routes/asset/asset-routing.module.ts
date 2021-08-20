import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetOverviewComponent } from './overview/overview.component';
import { AssetOverviewDetailComponent } from './overview/edit/detail.component';

const routes: Routes = [
  { path: 'assets', component: AssetOverviewComponent },
  { path: 'assets/edit/:id', component: AssetOverviewDetailComponent },
  { path: 'assets/create', component: AssetOverviewDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetRoutingModule { }
