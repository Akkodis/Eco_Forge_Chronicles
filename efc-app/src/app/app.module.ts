import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavBarComponent } from './core/nav-bar/nav-bar.component';
import { ConnectWalletButtonComponent } from './shared/ui/connect-wallet-button/connect-wallet-button.component';
import { MyListingsComponent } from './features/components/my-listings/my-listings.component';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { DialogComponent } from './shared/ui/dialogs/dialog/dialog.component';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { appAttributes } from './shared/config/application.config';
import { SellComponent } from './features/components/sell/sell.component';
import { CoreWindowComponent } from './shared/ui/core-window/core-window.component';
import { CoreFilterComponent } from './shared/ui/core-filter/core-filter.component';
import { AssetsFilterComponent } from './shared/ui/assets-filter/assets-filter.component';
import { AssetSelectionComponent } from './shared/ui/asset-selection/asset-selection.component';
import { ButtonComponent } from './shared/ui/button/button.component';
import { NotificationDialogComponent } from './shared/ui/dialogs/notification-dialog/notification-dialog.component';
import { ListingDialogComponent } from './shared/ui/dialogs/listing-dialog/listing-dialog.component';
import { AssetsDialogComponent } from './shared/ui/dialogs/assets-dialog/assets-dialog.component';
import { TableAssetsComponent } from './shared/ui/table-assets/table-assets.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    ConnectWalletButtonComponent,
    MyListingsComponent,
    DialogComponent,
    SellComponent,
    CoreWindowComponent,
    CoreFilterComponent,
    AssetsFilterComponent,
    AssetSelectionComponent,
    ButtonComponent,
    NotificationDialogComponent,
    ListingDialogComponent,
    AssetsDialogComponent,
    TableAssetsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoggerModule.forRoot({
      serverLoggingUrl: '/api/logs',
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: appAttributes.defaultLanguage,
    }),
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent],
})
export class AppModule {}
