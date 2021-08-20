import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild, TemplateRef, HostListener,
} from '@angular/core';

import { PlaceOverviewService } from './overview.service';
import { MtxGridColumn } from '@ng-matero/extensions';
import { take } from 'rxjs/operators';
import { LoginService } from '../../sessions/login/login.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {DeletedialogComponent} from "@shared/components/delete-dialog/deletedialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-place-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [PlaceOverviewService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceOverviewComponent implements OnInit {
  @ViewChild('activeTpl', { static: true }) activeTpl: TemplateRef<any>;

  columns: MtxGridColumn[] = [
    { header: 'Name', field: 'name', showExpand: true  },
    { header: 'Street', field: 'street'  },
    { header: 'Number', field: 'number'  },
    { header: 'Postcode', field: 'postcode' },
    { header: 'City', field: 'city' },
    { header: 'Tel1', field: 'tel1' },
    { header: 'Tel2', field: 'tel2', hide: true  },
    { header: 'Tel3', field: 'tel3', hide: true },
    { header: 'Tel4', field: 'tel4', hide: true },
    { header: 'Fax', field: 'fax' },
    { header: 'Website', field: 'website' },
    { header: 'Email', field: 'email' },
    { header: 'Citrix_Number', field: 'citrix_numbers' },
    { header: 'Active', field: 'active', cellTemplate: this.activeTpl },
    {
      header: ' ',
      field: 'option',
      width: '120px',
      pinned: 'right',
      right: '0px',
      type: 'button',
      buttons: [
        {
          icon: 'edit',
          tooltip: 'Edit',
          type: 'icon',
          click: record => {
            this.navigateEdit(record);
          },
        },
        {
          icon: 'place',
          tooltip: 'in Maps öffnen',
          type: 'icon',
          click: record => {
            window.open('https://www.google.com/maps/search/?api=1&query=' + record.street + '+' + record.number + '+' + record.postcode + '+' + record.city);
          }
        }
      ],
    },
  ];
  list = [];
  placeLength = 0;
  isLoading = true;
  showTable = true;

  multiSelectable = true;
  rowSelectable = false;
  hideRowSelectionCheckbox = false;
  showToolbar = true;
  columnHideable = true;
  columnMovable = true;
  rowHover = false;
  rowStriped = true;
  showPaginator = true;
  expandable = true;

  query = {
    q: null,
    sort: null,
    order: null,
    page: 0,
    per_page: 5,
    show_inactive: false
  };

  sort_options = [
    {'name': 'name', 'value': 'name'},
    {'name': 'postcode', 'value': 'postcode'},
    {'name': 'city', 'value': 'city'},
  ];
  sort_way_options = [
    {'name': 'asc', 'value': 'asc'},
    {'name': 'desc', 'value': 'desc'},
  ];

  translations = {
    search_placeholder: '',
    sort_placeholder: '',
    sort_way_placeholder: '',
    search: '',
    text: ''
  }

  isAdmin = false;
  toolbarTitle = '';
  columnMenuButtonText = '';
  currentWindowWidth: number;

  constructor(
    private placeSrv: PlaceOverviewService,
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.currentWindowWidth = window.innerWidth;
    let user = this.loginService.currentUserValue;
    this.query.per_page = user.per_page_preference ? user.per_page_preference : 5;
    this.isAdmin = user.admin;
    if (this.isAdmin) {
      this.columns[14].buttons.push(
        {
          icon: 'delete',
          tooltip: 'Delete',
          color: 'warn',
          type: 'icon',
          click: record => this.delete(record),
        },
      )
    }
    this.translate.get([
      'place.name',
      'place.street',
      'place.number',
      'place.postcode',
      'place.city',
      'place.tel1',
      'place.tel2',
      'place.tel3',
      'place.tel4',
      'place.fax',
      'place.website',
      'place.email',
      'place.active',
      'place.toolbarTitle',
      'place.columnMenuButtonText',
      'general.asc',
      'general.desc',
      'general.search',
      'general.text',
      'general.search_placeholder',
      'general.sort_placeholder',
      'general.sort_way_placeholder'
    ]).subscribe(
      data => {
        this.columns[0].header = data['place.name'];
        this.columns[1].header = data['place.street'];
        this.columns[2].header = data['place.number'];
        this.columns[3].header = data['place.postcode'];
        this.columns[4].header = data['place.city'];
        this.columns[5].header = data['place.tel1'];
        this.columns[6].header = data['place.tel2'];
        this.columns[7].header = data['place.tel3'];
        this.columns[8].header = data['place.tel4'];
        this.columns[9].header = data['place.fax'];
        this.columns[10].header = data['place.website'];
        this.columns[11].header = data['place.email'];
        this.columns[12].header = 'Citrix-Benutzer';
        this.columns[13].header = data['place.active'];

        this.toolbarTitle = data['place.toolbarTitle'];
        this.columnMenuButtonText = data['place.columnMenuButtonText'];

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
      }
    );
    this.columns[13].cellTemplate = this.activeTpl;
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    }
    this.loadPlaces();
  }

  loadPlaces()
  {
    this.isLoading = true;
    this.placeSrv.listPlaces(this.query.q, this.query.per_page, this.query.page, this.query.sort, this.query.order, this.query.show_inactive).pipe(take(1)).subscribe((data: any) => {
      let l = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
          for (let key in data[item]['citrix']) {
            data[item]['citrix_numbers'] = (data[item]['citrix_numbers'] ? data[item]['citrix_numbers'] + ', ' : '') + data[item]['citrix'][key]['citrix_number'];
          }
          l.push(data[item]);
        }
      }
      this.placeLength = data.total;
      this.list = l;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  loadPlacesSearch()
  {
    this.query.page = 0;
    this.loadPlaces();
  }

  changePage($event)
  {
    this.query.per_page = $event.pageSize;
    this.query.page = $event.pageIndex;
    this.loadPlaces();
  }

  delete(value: any) {
    const dialogRef = this.dialog.open(DeletedialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'y') {
        this.placeSrv.deletePlace(value.id).pipe(take(1)).subscribe(
          data => {
              this.snackBar.open('Standort erfolgreich gelöscht', 'schließen', { duration: 5000 });
              for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].id == value.id) {
                  this.list = [...this.list.splice(0, i), ...this.list.slice(i + 1)]
                }
              }
              this.cdr.detectChanges();
            },
          error => { this.snackBar.open('Standort konnte nicht gelöscht werden!', 'schließen', { duration: 5000 }); }
        )
      }
    });
  }

  navigateEdit(record) {
    this.router.navigate(['/data/places/edit/' + record.id]);
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
