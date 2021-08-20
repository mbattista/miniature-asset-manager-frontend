import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { PlacesAssetsOverviewComponent } from './overview/overview.component';
import { PlacesAssetsRoutingModule } from './places-assets-routing.module';
import {ArrayFilterPipe, PlacesAssetsOverviewDetailComponent} from './overview/edit/detail.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';

const COMPONENTS = [
  PlacesAssetsOverviewComponent,
  PlacesAssetsOverviewDetailComponent,
  ArrayFilterPipe
];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [
    SharedModule,
    PlacesAssetsRoutingModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_DYNAMIC
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'de-DE'},
  ],
  entryComponents: COMPONENTS_DYNAMIC
})
export class PlacesAssetsModule { }
