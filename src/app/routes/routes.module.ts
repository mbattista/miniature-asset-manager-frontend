import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { RoutesRoutingModule } from './routes-routing.module';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './sessions/login/login.component';
import { RegisterComponent } from './sessions/register/register.component';
import {CalendarCommonModule, CalendarDayModule, CalendarMonthModule, CalendarWeekModule} from "angular-calendar";
import {PreferenceModule} from "./preference/preference.module";
import {PersonModule} from "./person/person.module";
import {PlaceDashboardComponent} from "./place-dashboard/place-dashboard.component";

const COMPONENTS = [DashboardComponent, LoginComponent, RegisterComponent, PlaceDashboardComponent];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [SharedModule, RoutesRoutingModule, CalendarMonthModule, CalendarWeekModule, CalendarDayModule, CalendarCommonModule, PreferenceModule, PersonModule],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
  entryComponents: COMPONENTS_DYNAMIC,
})
export class RoutesModule {}
