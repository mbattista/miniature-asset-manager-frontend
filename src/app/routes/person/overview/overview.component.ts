import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';

import { CitrixOverviewService } from './overview.service';
import {MtxGridColumn} from '@ng-matero/extensions';
import { take } from 'rxjs/operators';
import { LoginService } from '../../sessions/login/login.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {DeletedialogComponent} from "@shared/components/delete-dialog/deletedialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {PersonService} from "../person.service";

@Component({
  selector: 'app-citrix-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [CitrixOverviewService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOverviewComponent implements OnInit {

  columns: MtxGridColumn[] = [
    { header: 'Vorname', field: 'first_name'  },
    { header: 'Nachname', field: 'last_name'  },
    { header: 'EMail', field: 'email'  },
    { header: 'Nickname', field: 'nickname'  },
    { header: 'Letzter Login', field: 'last_login'  },
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
  expandable = true;

  query = {
    q: null,
    sort: 'name',
    order: 'ASC',
    page: 0,
    per_page: 5,
  };

  sort_options = [
    {'name': 'Vorname', 'value': 'first_name'},
    {'name': 'Nachname', 'value': 'last_name'},
    {'name': 'EMail', 'value': 'email'},
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
  showTable = true;

  constructor(
    private userSrv: PersonService,
    private cdr: ChangeDetectorRef,
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    let user = this.loginService.currentUserValue;
    this.query.per_page = user.per_page_preference ? user.per_page_preference : 5;
    this.isAdmin = user.admin;
    this.translate.get([
      'general.asc',
      'general.desc',
      'general.search',
      'general.text',
      'general.search_placeholder',
      'general.sort_placeholder',
      'general.sort_way_placeholder'
    ]).subscribe(
      data => {
        this.columns[0].header = 'Vorname';
        this.columns[1].header = 'Nachname';
        this.columns[2].header = 'Email';
        this.columns[3].header = 'Nickname';
        this.columns[4].header = 'Letzter Login';
        this.columns[5].header = ' ';

        this.toolbarTitle = 'Verfügbare Citrix-IDs';
        this.columnMenuButtonText = 'Übersicht';

        this.sort_options[0].name = 'Vorname';
        this.sort_options[1].name = 'Nachname';
        this.sort_options[2].name = 'Email';

        this.sort_way_options[0].name = data['general.asc'];
        this.sort_way_options[1].name = data['general.desc'];

        this.translations.search_placeholder = data['general.search_placeholder'];
        this.translations.sort_placeholder = data['general.sort_placeholder'];
        this.translations.sort_way_placeholder = data['general.sort_way_placeholder'];
        this.translations.search = data['general.search'];
        this.translations.text = data['general.text'];
      }
    );
    this.loadUser();
  }

  loadUser()
  {
    this.isLoading = true;
    this.userSrv.listUsers(this.query.q, this.query.per_page, this.query.page, this.query.sort, this.query.order).pipe(take(1)).subscribe(
      (data: any) => {
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

  loadUserSearch()
  {
    this.query.page = 0;
    this.list = []
    this.cdr.detectChanges();
    this.loadUser();
  }

  changePage($event)
  {
    this.query.per_page = $event.pageSize;
    this.query.page = $event.pageIndex;
    this.loadUser();
  }

  navigateEdit(record) {
    this.router.navigate(['/user/edit/' + record.id]);
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
