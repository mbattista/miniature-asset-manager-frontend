import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';

import {switchMap, tap} from 'rxjs/operators';
import { LoginService } from '../../sessions/login/login.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {BehaviorSubject} from "rxjs";
import {PlacesAssetsOverviewService} from "../overview/overview.service";

@Component({
  selector: 'app-person-places-assets-overview',
  templateUrl: './overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonPlacesAssetsOverviewComponent implements OnInit {
  showTable: boolean = true;
  currentWindowWidth: number;
  title: string = 'Übersicht für '

  isLoading$ = new BehaviorSubject<boolean>(false);
  list = [];

  date_options = {
    year: 'numeric', month: '2-digit', day: '2-digit',
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
    private placesAssetsSrv: PlacesAssetsOverviewService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.currentWindowWidth = window.innerWidth;
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    }

    this.isLoading$.next(true);
    this.cdr.detectChanges();
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
          this.list = [];
          return this.placesAssetsSrv.listPlacesAssets(null, 100, 0, null, null, Number(params.get('id')), null, null, null, true, true, null, null, false)
        }
      ),tap((placesAssets: any) => {
        Object.entries(placesAssets).forEach(
          ([key, value]) => {
            if (typeof value === 'object') {
              value['iso_date_until'] = '';
              if (value['from_datetimez']) {
                let now_date = new Date(value['from_datetimez'].replace(/\+[0-9]{1,2}/g, ''));
                value['iso_date_from'] = new Intl.DateTimeFormat('de-DE', this.date_options).format(now_date);
              }
              if (value['until_datetimez']) {
                let now_date = new Date(value['until_datetimez'].replace(/\+[0-9]{1,2}/g, ''));
                value['iso_date_until'] = new Intl.DateTimeFormat('de-DE', this.date_options).format(now_date);
              }
              this.title = 'Übersicht für ' + value['dp_first_name'] + ' ' + value['dp_last_name'];
              this.list.push(value)
            }
          }
        );

        this.isLoading$.next(false);
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.currentWindowWidth = window.innerWidth
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    } else {
      this.showTable = true;
    }
  }
}
