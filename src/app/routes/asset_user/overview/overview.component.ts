import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild, TemplateRef,
} from '@angular/core';

import { MtxDialog } from '@ng-matero/extensions/dialog';

import { AssetUserOverviewService } from './overview.service';
import { MtxGridColumn } from '@ng-matero/extensions';
import { take } from 'rxjs/operators';
import { LoginService } from '../../sessions/login/login.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asset-user-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [AssetUserOverviewService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetUserOverviewComponent implements OnInit {
  @ViewChild('activeTpl', { static: true }) activeTpl: TemplateRef<any>;

  columns: MtxGridColumn[] = [
    { header: 'first_name', field: 'first_name'  },
    { header: 'last_name', field: 'last_name'  },
    { header: 'name', field: 'name'  },
    { header: 'city', field: 'city'  },
    { header: 'email', field: 'email'  },
    { header: 'tel', field: 'tel'  },
    { header: 'mobile', field: 'mobile'  },
    { header: 'teamviewer_id', field: 'teamviewer_id' },
    { header: 'active', field: 'active' },
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
            this.router.navigate(['/data/place_users/edit/' + record.id]);
          },
        },
      ],
    },
  ];
  list = [];
  assetLength = 0;
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

  query = {
    q: null,
    sort: 'name',
    order: 'asc',
    page: 0,
    per_page: 5,
  };

  sort_options = [
    {'name': 'name', 'value': 'Name'},
    {'name': 'last_name', 'value': 'last_name'},
    {'name': 'first_name', 'value': 'first_name'},
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
  toolbarTitle = '';
  columnMenuButtonText = '';

  constructor(
    private assetUserSrv: AssetUserOverviewService,
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private router: Router,
    public dialog: MtxDialog,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    let user = this.loginService.currentUserValue;
    this.query.per_page = user.per_page_preference ? user.per_page_preference : 5;
    this.isAdmin = user.admin;
    if (this.isAdmin) {
      this.columns[9].buttons.push(
        {
          icon: 'delete',
          tooltip: 'Delete',
          color: 'warn',
          type: 'icon',
          pop: true,
          popTitle: 'Confirm delete?',
          click: record => this.delete(record),
        },
      )
    }
    this.translate.get([
      'asset_user.first_name',
      'asset_user.last_name',
      'asset_user.name',
      'asset_user.city',
      'asset_user.email',
      'asset_user.tel',
      'asset_user.mobile',
      'asset_user.citrix',
      'asset_user.teamviewer_id',
      'asset_user.first_name',
      'asset_user.options',
      'asset_user.active',
      'asset_user.columnMenuButtonText',
      'asset_user.toolbarTitle',
      'general.asc',
      'general.desc',
      'general.search',
      'general.text',
      'general.search_placeholder',
      'general.sort_placeholder',
      'general.sort_way_placeholder'
    ]).subscribe(
      data => {
        this.columns[0].header = data['asset_user.first_name'];
        this.columns[1].header = data['asset_user.last_name'];
        this.columns[2].header = data['asset_user.name'];
        this.columns[3].header = data['asset_user.city'];
        this.columns[4].header = data['asset_user.email'];
        this.columns[5].header = data['asset_user.tel'];
        this.columns[6].header = data['asset_user.mobile'];
        this.columns[7].header = data['asset_user.teamviewer_id'];
        this.columns[8].header = data['asset_user.active'];
        this.columns[9].header = data['asset_user.options'];
        this.toolbarTitle = data['asset_user.toolbarTitle'];
        this.columnMenuButtonText = data['asset_user.columnMenuButtonText'];

        this.sort_options[0].name = data['asset_user.name'];
        this.sort_options[1].name = data['asset_user.last_name'];
        this.sort_options[2].name = data['asset_user.first_name'];

        this.sort_way_options[0].name = data['general.asc'];
        this.sort_way_options[1].name = data['general.desc'];

        this.translations.search_placeholder = data['general.search_placeholder'];
        this.translations.sort_placeholder = data['general.sort_placeholder'];
        this.translations.sort_way_placeholder = data['general.sort_way_placeholder'];
        this.translations.search = data['general.search'];
        this.translations.text = data['general.text'];
      }
    );
    this.columns[9].cellTemplate = this.activeTpl;
    this.loadAssetUsers();
  }

  loadAssetUsers()
  {
    this.isLoading = true;
    this.assetUserSrv.listAssetUsers(this.query.q, this.query.per_page, this.query.page).pipe(take(1)).subscribe((data: any) => {
      let l = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
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
    this.loadAssetUsers();
  }

  changePage($event)
  {
    this.query.per_page = $event.pageSize;
    this.query.page = $event.pageIndex;
    this.loadAssetUsers();
  }

  delete(value: any) {
    this.dialog.alert(`You have deleted ${value.position}!`);
  }
}
