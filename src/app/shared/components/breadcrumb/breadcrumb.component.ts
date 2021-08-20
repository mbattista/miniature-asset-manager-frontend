import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MenuService } from '@core';

@Component({
  selector: 'breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BreadcrumbComponent implements OnInit {
  @Input() nav: string[] = [];
  type: string = '';
  name: string = '';
  id: string = '';

  constructor(private router: Router, private menuService: MenuService) {}

  ngOnInit() {
    this.nav = Array.isArray(this.nav) ? this.nav : [];

    if (this.nav.length === 0) {
      this.genBreadcrumb();
    }
  }

  trackByNavlink(index: number, navlink: string): string {
    return navlink;
  }

  genBreadcrumb() {
    const states = this.router.url.slice(1).split('/');
    this.nav = this.menuService.getMenuLevel(states);
    this.nav.unshift('home');
  }

  checkNav(nav) {
    if (nav.indexOf('place_user') > 0) {
      let startIndex = nav.indexOf('place_user');
      this.type = nav[startIndex];
      this.name = nav[startIndex + +1].replace('hidden_', '');
      this.id = nav[startIndex + +2].replace('hidden_', '');
    }

    return nav;
  }
}
