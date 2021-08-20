import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';

import { CitrixOverviewService } from './overview.service';
import {MtxDialog, MtxGridColumn} from '@ng-matero/extensions';
import { take } from 'rxjs/operators';
import { LoginService } from '../../sessions/login/login.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import {DeletedialogComponent} from "@shared/components/delete-dialog/deletedialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-citrix-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [CitrixOverviewService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitrixOverviewComponent implements OnInit {

  columns: MtxGridColumn[] = [
    { header: 'Citrix-ID', field: 'citrix_number'  },
    { header: 'Passwort', field: 'password_hidden'  },
    { header: 'Showsoft-ID', field: 'show_id'  },
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
          icon: 'remove_red_eye',
          tooltip: 'Password anzeigen',
          type: 'icon',
          click: record => {
            this.showPassword(record);
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
    {'name': 'Citrix', 'value': 'citrix_number'},
    {'name': 'Passwort', 'value': 'password'},
    {'name': 'Showsoft', 'value': 'show_id'},
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
    private citrixSrv: CitrixOverviewService,
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
    if (this.isAdmin) {
      this.columns[3].buttons.push(
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
      'general.asc',
      'general.desc',
      'general.search',
      'general.text',
      'general.search_placeholder',
      'general.sort_placeholder',
      'general.sort_way_placeholder'
    ]).subscribe(
      data => {
        this.columns[0].header = 'Citrix-ID';
        this.columns[1].header = 'Passwort';
        this.columns[2].header = 'Showsoft-ID';
        this.columns[3].header = ' ';

        this.toolbarTitle = 'Verfügbare Citrix-IDs';
        this.columnMenuButtonText = 'Übersicht';

        this.sort_options[0].name = 'Citrix-ID';
        this.sort_options[1].name = 'Passwort';
        this.sort_options[2].name = 'Showsoft-ID';

        this.sort_way_options[0].name = data['general.asc'];
        this.sort_way_options[1].name = data['general.desc'];

        this.translations.search_placeholder = data['general.search_placeholder'];
        this.translations.sort_placeholder = data['general.sort_placeholder'];
        this.translations.sort_way_placeholder = data['general.sort_way_placeholder'];
        this.translations.search = data['general.search'];
        this.translations.text = data['general.text'];
      }
    );
    this.loadCitrix();
  }

  loadCitrix()
  {
    this.isLoading = true;
    this.citrixSrv.listCitrix(this.query.q, this.query.per_page, this.query.page, this.query.sort, this.query.order).pipe(take(1)).subscribe(
      (data: any) => {
      let l = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && data[item]['id']) {
          data[item].password_hidden = '••••••••••';
          data[item].hide = true;
          l.push(data[item]);
        }
      }
      this.assetLength = data.total;
      this.list = l;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  loadCitrixSearch()
  {
    this.query.page = 0;
    this.list = []
    this.cdr.detectChanges();
    this.loadCitrix();
  }

  changePage($event)
  {
    this.query.per_page = $event.pageSize;
    this.query.page = $event.pageIndex;
    this.loadCitrix();
  }

  delete(value: any) {const dialogRef = this.dialog.open(DeletedialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'y') {
        this.citrixSrv.deleteCitrix(value.id).pipe(take(1)).subscribe(
          data => {
            this.snackBar.open('Citrix Benutzer erfolgreich gelöscht', 'schließen', { duration: 5000 });
            for (let i = 0; i < this.list.length; i++) {
              if (this.list[i].id == value.id) {
                this.list = [...this.list.splice(0, i), ...this.list.slice(i + 1)]
              }
            }
            this.cdr.detectChanges();
          },
          error => { this.snackBar.open('Citrix Benutzer konnte nicht gelöscht werden!', 'schließen', { duration: 5000 }); }
        )
      }
    });
  }

  navigateEdit(record) {
    this.router.navigate(['/data/citrix/edit/' + record.id]);
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

  showPassword(record) {
    this.isLoading = true;
    if (!record.hide) {
      record.password_hidden = '••••••••••';
    } else {
      record.password_hidden = record.password;
    }
    let tmp = 0;
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].id == record.id) {
        this.list.splice(i, 1);
        tmp = i;
      }
    }
    this.cdr.detectChanges();
    record.hide = !record.hide;
    this.isLoading = false;
    this.list.splice(tmp, 0, record);
    this.cdr.detectChanges();
  }
}
