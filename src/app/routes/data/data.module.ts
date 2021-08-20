import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AssetOverviewDetailComponent } from '../asset/overview/edit/detail.component';
import { AssetRoutingModule } from '../asset/asset-routing.module';
import { AssetOverviewComponent } from '../asset/overview/overview.component';
import { PlaceRoutingModule } from '../place/place-routing.module';
import { PlaceOverviewComponent } from '../place/overview/overview.component';
import { PlaceOverviewDetailComponent } from '../place/overview/edit/detail.component';
import { AssetUserOverviewComponent } from '../asset_user/overview/overview.component';
import { AssetUserOverviewDetailComponent } from '../asset_user/overview/edit/detail.component';
import { AssetUserRoutingModule } from '../asset_user/asset_user-routing.module';
import { CitrixRoutingModule } from '../citrix/citrix-routing.module';
import { CitrixOverviewComponent } from '../citrix/overview/overview.component';
import { CitrixOverviewDetailComponent } from '../citrix/overview/edit/detail.component';
import {MAT_DATE_LOCALE} from "@angular/material/core";
import {ExternalPersonPlacesAssetsOverviewComponent} from "../places-assets/external-person-overview/overview.component";
import {PersonPlacesAssetsOverviewComponent} from "../places-assets/user-overview/overview.component";

const COMPONENTS = [
  AssetOverviewComponent,
  AssetOverviewDetailComponent,
  AssetUserOverviewComponent,
  AssetUserOverviewDetailComponent,
  PlaceOverviewComponent,
  PlaceOverviewDetailComponent,
  CitrixOverviewComponent,
  CitrixOverviewDetailComponent,
  ExternalPersonPlacesAssetsOverviewComponent,
  PersonPlacesAssetsOverviewComponent,
];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [
    SharedModule,
    AssetRoutingModule,
    AssetUserRoutingModule,
    PlaceRoutingModule,
    CitrixRoutingModule,
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
export class DataModule { }
