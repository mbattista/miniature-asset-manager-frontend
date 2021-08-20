import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import localeDe from '@angular/common/locales/de';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { ThemeModule } from './theme/theme.module';
import { RoutesModule } from './routes/routes.module';
import { AppComponent } from './app.component';

import { DefaultInterceptor } from '@core';
import { StartupService } from '@core';
export function StartupServiceFactory(startupService: StartupService) {
  return () => startupService.load();
}

import { FormlyModule } from '@ngx-formly/core';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AssetOverviewService } from './routes/asset/overview/overview.service';
import { LoginService } from './routes/sessions/login/login.service';
import { AuthenticationErrorInterceptor } from '@core/interceptors/authentication.error.interceptor';
import { PlacesAssetsOverviewService } from './routes/places-assets/overview/overview.service';
import { PlaceOverviewService } from './routes/place/overview/overview.service';
import { PersonService } from './routes/person/person.service';
import { AssetUserOverviewService } from './routes/asset_user/overview/overview.service';
import { SearchService } from './routes/data/search.service';
import { CitrixOverviewService } from './routes/citrix/overview/overview.service';
import {PreferenceService} from "./routes/preference/edit/preference.service";
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import {registerLocaleData} from "@angular/common";
import {CitrixassetsService} from "./routes/citrix-assets/citrixassets.service";
// Required for AOT compilation
export function TranslateHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

registerLocaleData(localeDe);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    ThemeModule,
    RoutesModule,
    FormlyModule.forRoot(),
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BrowserAnimationsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DefaultInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationErrorInterceptor, multi: true },
    StartupService,
    AssetOverviewService,
    PlaceOverviewService,
    PlacesAssetsOverviewService,
    PersonService,
    SearchService,
    CitrixassetsService,
    PreferenceService,
    CitrixOverviewService,
    AssetUserOverviewService,
    LoginService,
    {
      provide: APP_INITIALIZER,
      useFactory: StartupServiceFactory,
      deps: [StartupService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
