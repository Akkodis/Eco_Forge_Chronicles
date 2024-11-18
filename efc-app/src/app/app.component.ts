import { Component, OnInit } from '@angular/core';
import { appTitle } from './shared/config/application.config';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = appTitle.appTitle;
  constructor(
    private titleService: Title,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }
  ngOnInit() {
    this.titleService.setTitle(this.title || 'My App');
  }
}
