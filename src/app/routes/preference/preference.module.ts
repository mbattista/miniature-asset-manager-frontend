import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import {PreferenceRoutingModule} from "./preference-routing.module";
import {PreferenceComponent} from "./edit/detail.component";

const COMPONENTS = [
  PreferenceComponent,
];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [
    SharedModule,
    PreferenceRoutingModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_DYNAMIC
  ],
  entryComponents: COMPONENTS_DYNAMIC
})
export class PreferenceModule { }
