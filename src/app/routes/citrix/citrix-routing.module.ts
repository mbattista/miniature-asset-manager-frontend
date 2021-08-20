import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CitrixOverviewComponent } from './overview/overview.component';
import { CitrixOverviewDetailComponent } from './overview/edit/detail.component';

const routes: Routes = [
  { path: 'citrix', component: CitrixOverviewComponent },
  { path: 'citrix/edit/:id', component: CitrixOverviewDetailComponent },
  { path: 'citrix/create', component: CitrixOverviewDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CitrixRoutingModule { }
