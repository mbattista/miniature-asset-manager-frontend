import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PlacesAssetsOverviewService } from '../places-assets/overview/overview.service';
import {map, take} from 'rxjs/operators';
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
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  listThings = [];
  view: CalendarView = CalendarView.Month;
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  locale: string = 'de';
  ColorHash = require('color-hash');

  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  activeDayIsOpen = false;

  events$: Observable<CalendarEvent[]>;
  colorPerson: boolean = true;
  eventColorText: string = 'Übersicht auf Standort wechseln';

  date_options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
  };

  filter_person = [];
  filter_place = [];

  filter = {
    q: null,
    person: null,
    place: null,
    page: 0,
    per_page: 5,
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private placesAssetsSrv: PlacesAssetsOverviewService,
    private placeSrv: PlaceOverviewService,
    private assetUsersSrv: PersonService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchDates();
    let colorHash = new this.ColorHash();

    this.placeSrv.listPlaces(null, 1000, 0, null, null, false
    ).pipe(take(1)).subscribe(
      data => {
        for (let item in data) {
          if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
            this.filter_place.push({
              'name': data[item]['name'] + ' ' + data[item]['city'],
              'value': data[item]['id'],
              'color': colorHash.hex(data[item]['name'] + data[item]['city'])
            })
          }
        }
      },
      error => {
        console.log(error);
      }
    );
    this.assetUsersSrv.listUsers(null, 1000, 0).pipe(take(1)).subscribe(
      data => {
        for (let item in data) {
          if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
            this.filter_person.push({
              'name': (data[item]['first_name'] ? data[item]['first_name'] + ' ' : '') + (data[item]['last_name'] ? data[item]['last_name'] : ''),
              'value': data[item]['id'],
              'color': colorHash.hex(data[item]['first_name'] + data[item]['last_name'])
            })
          }
        }
      },
      error => {
        console.log(error);
      }
    )
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  fetchDates(): void {
    const getStart: any = {
      month: startOfMonth,
      week: startOfWeek,
      day: startOfDay,
    }[this.view];

    const getEnd: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay,
    }[this.view];
    let colorHash = new this.ColorHash();

    this.events$ = this.placesAssetsSrv.listPlacesAssets(
      this.filter.q ? this.filter.q : null,
      1000,
      0,
      null,
      this.filter.place,
      this.filter.person,
      null,
      null,
      null,
      true,
      true,
      format(sub(getStart(this.viewDate), { days: 10 }), 'yyyy-MM-dd'),
      format(add(getEnd(this.viewDate), { days: 10 }), 'yyyy-MM-dd'),
      false
    ).pipe(
      take(1),
      map((data: any) => {
        let events = [];
        for (let item in data) {
          if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
            if (data[item]['from_datetimez']) {
              let now_date = new Date(data[item]['from_datetimez'].replace(/\+[0-9]{1,2}/g, ''));
              data[item]['from_datetimez'] = new Intl.DateTimeFormat('de-DE', this.date_options).format(now_date);
              let secondary = colorHash.hex(data[item]['dp_first_name'] + data[item]['dp_last_name']);
              let primary = colorHash.hex(data[item]['place_name'] + ', ' + data[item]['city']);
              if (this.colorPerson) {
                primary = colorHash.hex(data[item]['dp_first_name'] + data[item]['dp_last_name']);
                secondary = colorHash.hex(data[item]['place_name'] + ', ' + data[item]['city']);
              }
              let dname = '';
              if (data[item]['dp_first_name'] || data[item]['dp_last_name']) {
                if (data[item]['dp_first_name'] && data[item]['dp_last_name']) {
                  dname = data[item]['dp_first_name'] + ' ' + data[item]['dp_last_name'];
                } else {
                  dname = (data[item]['dp_first_name'] ? data[item]['dp_first_name'] : '') + (data[item]['dp_last_name'] ? data[item]['dp_last_name'] : '');
                }
              } else {
                dname = (data[item]['external_person'] ? data[item]['external_person'] : '')
              }
              events.push({
                id: data[item]['id'],
                title: dname + ' liefert ' + data[item]['name'] + ' [Seriennummer ' + data[item]['serial'] + '] an ' + data[item]['place_name'] + ', ' + data[item]['city'],
                start: now_date,
                allDay: true,
                color: {primary: primary, secondary: secondary},
                meta: {
                  event: {
                    street: data[item]['street'],
                    number: data[item]['number'],
                    postcode: data[item]['postcode'],
                    city: data[item]['city'],
                    place: data[item]['place_id'],
                    date: data[item]['from_datetimez']
                  }
                }
              });
            }
          }
        }
        return events;
      })
    )
  }

  eventClicked(event: CalendarEvent): void {
    this.router.navigate(['/detail/place/' + event.meta.event.place + '/date/' + event.meta.event.date]);
  }

  changeEventColor(): void {
    this.colorPerson = !this.colorPerson;
    if (this.colorPerson) {
      this.eventColorText = 'Übersicht auf Standort wechseln';
    } else {
      this.eventColorText = 'Übersicht auf Person wechseln';
    }
    this.fetchDates();
  }
}
