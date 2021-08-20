import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild, TemplateRef, HostListener,
} from '@angular/core';

import { AssetOverviewService } from './overview.service';
import { MtxGridColumn } from '@ng-matero/extensions';
import { take } from 'rxjs/operators';
import { LoginService } from '../../sessions/login/login.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {DeletedialogComponent} from "@shared/components/delete-dialog/deletedialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-asset-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [AssetOverviewService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetOverviewComponent implements OnInit {
  @ViewChild('activeTpl', { static: true }) activeTpl: TemplateRef<any>;
  @ViewChild('oooTpl', { static: true }) oooTpl: TemplateRef<any>;

  columns: MtxGridColumn[] = [
    { header: 'Name', field: 'name', showExpand: true  },
    { header: 'Type', field: 'type'  },
    { header: 'Serial', field: 'serial'  },
    { header: 'Teamviewer ID', field: 'teamviewer_string'  },
    { header: 'Citrix', field: 'citrix_numbers' },
    { header: 'Standort', field: 'place_city' },
    { header: 'Anlieferung', field: 'from_datetimez' },
    { header: 'active', field: 'active' },
    { header: 'is_owned_by', field: 'is_owned_by', hide: true },
    { header: 'Out Of Order', field: 'out_of_order', cellTemplate: this.oooTpl },
    {
      header: ' ',
      field: 'option',
      width: '50px',
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
      ],
    },
  ];
  list = [];
  assetLength = 0;
  showTable = true;
  isLoading = true;

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
    show_inactive: true,
    per_page: 5,
  };

  sort_options = [
    {'name': 'name', 'value': 'name'},
    {'name': 'serial', 'value': 'serial'},
    {'name': 'type', 'value': 'type'},
    {'name': 'from', 'value': 'from'},
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
    private assetSrv: AssetOverviewService,
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.query.per_page = this.loginService.currentUserValue.per_page_preference ? this.loginService.currentUserValue.per_page_preference : 5;
    this.currentWindowWidth = window.innerWidth;
    if (this.currentWindowWidth < 600) {
      this.showTable = false;
    }
    let user = this.loginService.currentUserValue;
    this.isAdmin = user.admin;
    if (this.isAdmin) {
      this.columns[10].buttons.push(
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
      'asset.name',
      'asset.serial',
      'asset.teamviewer_id',
      'asset.citrix',
      'asset.type',
      'asset.active',
      'asset.outOfOrder',
      'asset.isOwnedBy',
      'asset.options',
      'asset.columnMenuButtonText',
      'asset.toolbarTitle',
      'general.asc',
      'general.desc',
      'general.search',
      'general.text',
      'general.search_placeholder',
      'general.sort_placeholder',
      'general.sort_way_placeholder'
    ]).subscribe(
      data => {
        this.columns[0].header = data['asset.name'];
        this.columns[2].header = data['asset.serial'];
        this.columns[3].header = data['asset.teamviewer_id'];
        this.columns[4].header = data['asset.citrix'];
        this.columns[1].header = data['asset.type'];
        this.columns[7].header = data['asset.active'];
        this.columns[8].header = data['asset.isOwnedBy'];
        this.columns[9].header = data['asset.outOfOrder'];
        this.columns[10].header = data['asset.options'];
        this.toolbarTitle = data['asset.toolbarTitle'];
        this.columnMenuButtonText = data['asset.columnMenuButtonText'];

        this.sort_options[0].name = data['asset.name'];
        this.sort_options[1].name = data['asset.serial'];
        this.sort_options[2].name = data['asset.type'];
        this.sort_options[3].name = 'Anlieferung';

        this.sort_way_options[0].name = data['general.asc'];
        this.sort_way_options[1].name = data['general.desc'];

        this.translations.search_placeholder = data['general.search_placeholder'];
        this.translations.sort_placeholder = data['general.sort_placeholder'];
        this.translations.sort_way_placeholder = data['general.sort_way_placeholder'];
        this.translations.search = data['general.search'];
        this.translations.text = data['general.text'];
      }
    );
    this.columns[7].cellTemplate = this.activeTpl;
    this.columns[9].cellTemplate = this.oooTpl;
    this.loadAssets();
  }

  loadAssets()
  {
    this.isLoading = true;
    this.list = [];
    this.cdr.detectChanges();
    this.assetSrv.listAssets(this.query.q, this.query.per_page, this.query.page, this.query.sort, this.query.order, !this.query.show_inactive).pipe(take(1)).subscribe((data: any) => {
      let l = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
          data[item]['place_city'] = (data[item]['place_name'] ? data[item]['place_name'] : '') + (data[item]['city'] ? ' ' + data[item]['city'] : '');
          for (let key in data[item]['citrix']) {
            data[item]['citrix_numbers'] = (data[item]['citrix_numbers'] ? data[item]['citrix_numbers'] + ', ' : '') + data[item]['citrix'][key]['citrix_number'];
          }
          if (data[item]['from_datetimez']) {
            let now_date = new Date(data[item]['from_datetimez'].split(' ')[0]);
            let date_options = {
              year: 'numeric', month: '2-digit', day: '2-digit',
            };
            data[item]['from_datetimez'] = new Intl.DateTimeFormat('de-DE', date_options).format(now_date);
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
    this.loadAssets();
  }

  changePage($event)
  {
    this.query.per_page = $event.pageSize;
    this.query.page = $event.pageIndex;
    this.loadAssets();
  }

  delete(value: any) {
    const dialogRef = this.dialog.open(DeletedialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'y') {
        this.assetSrv.deleteAsset(value.id).pipe(take(1)).subscribe(
          data => {
            this.snackBar.open('Gerät erfolgreich gelöscht', 'schließen', { duration: 5000 });
            for (let i = 0; i < this.list.length; i++) {
              if (this.list[i].id == value.id) {
                this.list = [...this.list.splice(0, i), ...this.list.slice(i + 1)]
              }
            }
            this.cdr.detectChanges();
          },
          error => { this.snackBar.open('Gerät konnte nicht gelöscht werden!', 'schließen', { duration: 5000 }); }
        )
      }
    });
  }

  navigateEdit(record) {
    this.router.navigate(['/data/assets/edit/' + record.id]);
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
