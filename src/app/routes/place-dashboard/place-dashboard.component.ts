import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PlacesAssetsOverviewService } from '../places-assets/overview/overview.service';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {CalendarView, CalendarEvent, DAYS_OF_WEEK} from "angular-calendar";
import {Observable, Subject} from "rxjs";
import {
  endOfDay,
  endOfMonth, endOfWeek,
  isSameDay,
  isSameMonth, startOfDay, startOfMonth, startOfWeek, format, add, sub
} from 'date-fns';
import {PersonService} from "../person/person.service";
import {PlaceOverviewService} from "../place/overview/overview.service";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {LoginService} from "../sessions/login/login.service";

@Component({
  selector: 'place-dashboard',
  templateUrl: './place-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceDashboardComponent implements OnInit {
  listThings = [];
  city: string = '';
  name: string = '';
  date: string = '';
  place: number = 0;
  assetPlace: number = 0;

  currentWindowWidth: number = 0;
  showTable: boolean = true;

  date_options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private placesAssetsSrv: PlacesAssetsOverviewService,
    private placeSrv: PlaceOverviewService,
    private assetUsersSrv: PersonService,
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.currentWindowWidth = window.innerWidth;
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    }

    let user = this.loginService.currentUserValue;
    this.assetPlace = this.loginService.defaultStorageIdValue;
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        let eng_date = params.get('date').split('.')
        let e_date = eng_date[2] + '-' + eng_date[1] + '-' + eng_date[0];
        return this.placesAssetsSrv.listPlacesAssets(
          null,
          1000,
          0,
          null,
          Number(params.get('place')),
          null,
          null,
          null,
          null,
          false,
          false,
          null,
          null,
          false,
          e_date
        ).pipe(
          take(1),
          map((data: any) => {
            console.log('test');
            let items = [];
            this.place = Number(params.get('place'));
            this.date = params.get('date');
            for (let key in data) {
              if (data[key] && data.hasOwnProperty(key) && data[key]['id']) {
                this.name = data[key]['place_name'];
                this.city = data[key]['city'];
                let now_date = new Date(data[key]['from_datetimez'].replace(/\+[0-9]{1,2}/g, ''));
                data[key]['from_datetimez'] = new Intl.DateTimeFormat('de-DE', this.date_options).format(now_date);
                let person = '';
                if (!data[key]['dp_last_name'] && !data[key]['dp_first_name']) {
                  person = data[key]['external_person'];
                } else if (data[key]['dp_last_name'] && data[key]['dp_first_name']) {
                  person = data[key]['dp_first_name'] + ' ' + data[key]['dp_last_name']
                } else if (data[key]['dp_last_name']) {
                  person = data[key]['dp_last_name'];
                } else {
                  person = data[key]['dp_first_name'];
                }
                items.push({
                  id: data[key]['asset_id'],
                  name: data[key]['name'],
                  type: data[key]['type'],
                  serial: data[key]['serial'],
                  last_name: data[key]['dp_last_name'],
                  first_name: data[key]['dp_first_name'],
                  external_person: data[key]['external_person'],
                  person: person,
                  incoming: ((data[key]['from_datetimez'] && data[key]['from_datetimez'] == this.date))
                })
              }
            }
            return items;
          }),
          tap((items: any) => {
            this.listThings = items;
          })
        )
      })).subscribe((data: any) => {
      this.cdr.detectChanges();
    });
  }

  customFTrackBy(index: number, item: any): any {
    return index;
  }
}
