import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild, TemplateRef, HostListener,
} from '@angular/core';

import { PlacesAssetsOverviewService } from './overview.service';
import { take } from 'rxjs/operators';
import { LoginService } from '../../sessions/login/login.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {DeletedialogComponent} from "@shared/components/delete-dialog/deletedialog.component";
import {PlaceOverviewService} from "../../place/overview/overview.service";

@Component({
  selector: 'app-places-assets-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [PlacesAssetsOverviewService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacesAssetsOverviewComponent implements OnInit {
  @ViewChild('activeTpl', { static: true }) activeTpl: TemplateRef<any>;

  list = [];
  assetLength = 0;
  isLoading = true;
  assetPlace = 0;

  showTable = true;
  currentWindowWidth: number;

  query = {
    q: null,
    sort: null,
    order: null,
    page: 0,
    per_page: 5,
  };

  sort_options = [
    {'name': 'name', 'value': 'name'},
    {'name': 'postcode', 'value': 'postcode'},
    {'name': 'city', 'value': 'city'},
  ];
  sort_way_options = [
    {'name': 'asc', 'value': 'ASC'},
    {'name': 'desc', 'value': 'DESC'},
  ];

  translations = {
    search_placeholder: '',
    sort_placeholder: '',
    sort_way_placeholder: '',
    search: '',
    text: ''
  }

  isAdmin = false;


  constructor(
    private assetSrv: PlacesAssetsOverviewService,
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private placeOverviewService: PlaceOverviewService,
    private snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.currentWindowWidth = window.innerWidth;
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    }

    let user = this.loginService.currentUserValue;
    this.query.per_page = user.per_page_preference ? user.per_page_preference : 5;
    this.isAdmin = user.admin;
    this.assetPlace = this.loginService.defaultStorageIdValue;

    this.translate.get([
      'place.name',
      'place.postcode',
      'place.city',
      'general.asc',
      'general.desc',
      'general.search',
      'general.text',
      'general.search_placeholder',
      'general.sort_placeholder',
      'general.sort_way_placeholder'
    ]).subscribe(
      data => {
        this.sort_options[0].name = data['place.name'];
        this.sort_options[1].name = data['place.postcode'];
        this.sort_options[2].name = data['place.city'];

        this.sort_way_options[0].name = data['general.asc'];
        this.sort_way_options[1].name = data['general.desc'];

        this.translations.search_placeholder = data['general.search_placeholder'];
        this.translations.sort_placeholder = data['general.sort_placeholder'];
        this.translations.sort_way_placeholder = data['general.sort_way_placeholder'];
        this.translations.search = data['general.search'];
        this.translations.text = data['general.text'];
      });

    this.loadPlacesAssets();
  }

  loadPlacesAssets()
  {
    this.isLoading = true;
    this.assetSrv.listPlaceDetailOverview(this.query.q, this.query.per_page, this.query.page).pipe(take(1)).subscribe((data: any) => {
      let l = [];
      let date_options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
      };
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
          if (data[item]['last_changed']) {
            let now_date = new Date(data[item]['last_changed']);
            data[item]['last_changed_formatted'] = new Intl.DateTimeFormat('de-DE', date_options).format(now_date);
            if (data[item]['asset']) {
              for (let asset in data[item]['asset']) {
                if (data[item]['asset'][asset] && data[item]['asset'].hasOwnProperty(asset) && data[item]['asset'][asset]['id']) {
                  if (data[item]['asset'][asset]['from_datetimez']) {
                    let now_date = new Date(data[item]['asset'][asset]['from_datetimez'].replace(/\+[0-9]{1,2}/g, ''));
                    data[item]['asset'][asset]['from_datetimez'] = new Intl.DateTimeFormat('de-DE', date_options).format(now_date);
                  }
                  if (data[item]['asset'][asset]['until_datetimez']) {
                    let now_date = new Date(data[item]['asset'][asset]['until_datetimez'].replace(/\+[0-9]{1,2}/g, ''));
                    data[item]['asset'][asset]['until_datetimez'] = new Intl.DateTimeFormat('de-DE', date_options).format(now_date);
                  }
                }
              }
            }
          }
          l.push(data[item]);
        }
      }
      this.assetLength = data.total;
      this.list = l;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  loadAssetsSearch()
  {
    this.query.page = 0;
    this.loadPlacesAssets();
  }

  delete(value: any) {
    const dialogRef = this.dialog.open(DeletedialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'y') {
        this.assetSrv.deletePlacesAssets(value.id).pipe(take(1)).subscribe(
          data => {
            this.snackBar.open('Anlage erfolgreich gelöscht', 'schließen', { duration: 5000 });
            for (let i = 0; i < this.list.length; i++) {
              if (this.list[i].id == value.id) {
                this.list.splice(i, 1);
              }
            }
            this.cdr.detectChanges();
          },
          error => { this.snackBar.open('Anlage konnte nicht gelöscht werden!', 'schließen', { duration: 5000 }); }
        )
      }
    });
  }

  customQTrackBy(index: number, item: any): any {
    return index;
  }

  customFTrackBy(index: number, item: any): any {
    return index;
  }

  changePage($event)
  {
    this.query.per_page = $event.pageSize;
    this.query.page = $event.pageIndex;
    this.loadPlacesAssets();
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
