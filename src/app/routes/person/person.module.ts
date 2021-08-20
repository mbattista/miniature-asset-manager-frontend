import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import {UserOverviewComponent} from "./overview/overview.component";
import {UserOverviewDetailComponent} from "./overview/edit/detail.component";

const COMPONENTS = [
  UserOverviewComponent,
  UserOverviewDetailComponent
];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [
    SharedModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_DYNAMIC
  ],
  entryComponents: COMPONENTS_DYNAMIC
})
export class PersonModule { }
