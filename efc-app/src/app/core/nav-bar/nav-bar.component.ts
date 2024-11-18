import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { NavigationService } from 'src/app/shared/services/navigation.service';
import { appAttributes } from 'src/app/shared/config/application.config';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent implements OnInit, OnDestroy {
  @Output() navigate = new EventEmitter<string>();

  @Output() assetListingAction = new EventEmitter<void>();

  selectedTab!: string;
  isMobileMenuOpen!: boolean;
  logo: string = 'assets/images/Logo_website.png';
  tabs: string[] = ['Browse', 'Sell', 'My Listings', 'My Activity'];
  tabSeparator: string = 'assets/images/slice-assets/verticalSeparatorNav.png';
  navBg: string = 'assets/images/slice-assets/navigationBg.png';
  shoppingCartInactive: string =
    'assets/images/icon-assets/shoppingCartInactive.png';
  shoppingCartActive: string =
    'assets/images/icon-assets/shoppingCartActive.png';
  notificationInactive: string =
    'assets/images/icon-assets/Notification-inaktiv.png';
  notificationActive: string = 'assets/images/icon-assets/Notification.png';
  incentiveInactive: string =
    'assets/images/icon-assets/gamingCard.png';
  incentiveActive: string = 'assets/images/icon-assets/gamingCard.png';
  claimInactive: string = 'assets/images/icon-assets/Claim-inaktiv.png';
  claimActive: string = 'assets/images/icon-assets/Claim.png';
  arrowSingle: string = 'assets/images/icon-assets/arrowSingle.png';
  roundButton: string = 'assets/images/icon-assets/buttonRoundBlank.png';
  mainTokenBg: string = 'assets/images/icon-assets/currencyIcon.png';
  currency: string = appAttributes.currency;
  baseUrl: string = appAttributes.baseUrl;
  topBar: string = 'assets/images/slice-assets/colorfulBarTop.png';
  verticalSeparator: string =
    'assets/images/slice-assets/verticalSeparatorGeneral.png';
  backTo: string = 'Back to Explorer';
  balance: string = '2.735';
  private subscription!: Subscription;

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit(): void {
    this.selectedTab = 'browse';
    this.subscription = this.navigationService.currentComponent$.subscribe(
      component => (this.selectedTab = component)
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  navigateTo(destination: string) {
    this.selectedTab = destination.toLowerCase();
    this.navigationService.navigateTo(destination);
    this.navigate.emit(destination);
  }

  navigateToHome() {
    this.router
      .navigate([this.baseUrl])
      .then(() => this.logger.debug('succesfully routed to home'))
      .catch(error => {
        this.logger.error('oops, something went wrong! ', error);
      });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onAssetListing() {
    this.assetListingAction.emit();
  }
}
