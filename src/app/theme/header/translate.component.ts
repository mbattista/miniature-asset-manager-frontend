import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from '@core';

@Component({
  selector: 'app-translate',
  template: `
    <button style="display: none" mat-icon-button class="matero-toolbar-button" [matMenuTriggerFor]="menu">
      <mat-icon>translate</mat-icon>
    </button>

    <mat-menu #menu="matMenu">
      <button mat-menu-item *ngFor="let lang of langs | keyvalue" (click)="useLanguage(lang.key)">
        <span>{{ lang.value }}</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .flag-icon {
        margin-right: 8px;
      }
    `,
  ],
})
export class TranslateComponent {
  langs = {
    'de-DE': 'Deutsch',
    'en-US': 'English',
  };

  constructor(public translate: TranslateService, private settings: SettingsService) {
    translate.addLangs(['de-DE', 'en-US']);
    translate.setDefaultLang('de-DE');

    const browserLang = navigator.language;
    translate.use(browserLang.match(/de-DE|en-US/) ? browserLang : 'de-DE');
  }

  useLanguage(language: string) {
    this.translate.use(language);
    this.settings.setLanguage(language);
  }
}
