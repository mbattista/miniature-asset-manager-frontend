import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef,
} from '@angular/core';
import {catchError, debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { SearchService } from '../../routes/data/search.service';
import { Router } from '@angular/router';
import {SettingsService} from "@core";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @ViewChild("searchinput", { static: false }) searchinput: ElementRef;
  @Input() showToggle = true;
  @Input() showBranding = false;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleSidenavNotice = new EventEmitter<void>();
  @Output() searchInput = new EventEmitter();
  @Output() totalResults = new EventEmitter<number>();
  @Output() searchVisible = new EventEmitter<boolean>();
  @Output() searchTerm = new EventEmitter<string>();

  options = this.settingsService.getOptions();
  searchClicked = false;
  search_term = '';
  search_results  = [];
  searchInput$ = new Subject<string>();
  total = 0;
  dark = false;

  constructor(
    private cdr: ChangeDetectorRef,
    protected searchSrv: SearchService,
    protected settingsService: SettingsService,
    protected router: Router,
  ) {}

  ngOnInit() {
    this.search_results = [];
    this.searchInput$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      tap(term => this.search_term = term),
      switchMap(term => this.searchSrv.searchGlobal(term, 25, 0).pipe(
        catchError(err => {
          console.log(err);
          return of([])
        }), // empty list on error
      )),
    ).subscribe(data => {
      this.search_results = [];
      for (let item in data) {
        if (data[item] && data.hasOwnProperty(item) && (data[item]['id'] || data[item]['external_person'])) {
          if (this.search_results.indexOf(data[item]) == -1)
            this.search_results = [...this.search_results, data[item]];
        }
      }
      if (data['total']) {
        this.total = data['total'];
      }
      this.searchInput.emit(this.search_results);
      this.totalResults.emit(this.total);
      this.searchTerm.emit(this.search_term);
      this.cdr.detectChanges();
    });
  }

  changeSearchClicked() {
    this.search_results = [];
    this.searchInput.emit(this.search_results);
    this.totalResults.emit(0);
    this.searchTerm.emit('');
    this.searchinput.nativeElement.value = '';

    this.cdr.detectChanges();
  }

  onFieldChange($event) {
    if ($event.target.value.length > 2) {
      this.searchInput$.next($event.target.value);
      this.cdr.detectChanges();
    }
  }

  onBlur($event) {
    setTimeout(() => {
      this.searchVisible.emit(false);
      this.cdr.detectChanges();
    }, 200);
  }

  onFocus($event) {
    this.searchVisible.emit(true);
    this.searchInput.emit(this.search_results);
    this.totalResults.emit(this.total);
    this.searchTerm.emit(this.search_term);
    this.cdr.detectChanges();
  }

  redirect(type: string, id: number) {
    this.searchClicked = !this.searchClicked;
    this.search_results = [];
    if (type == 'asset') {
      this.router.navigate(['/data/assets/edit/' + id]);
    }
    if (type == 'places_assets') {
      this.router.navigate(['/overview/edit/' + id]);
    }
    if (type == 'place') {
      this.router.navigate(['/data/places/edit/' + id]);
    }
    if (type == 'end_user') {
      this.router.navigate(['/data/place_users/edit/' + id]);
    }
    this.cdr.detectChanges();
  }
}
