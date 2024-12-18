import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectWalletButtonComponent } from './connect-wallet-button.component';

describe('ConnectWalletButtonComponent', () => {
  let component: ConnectWalletButtonComponent;
  let fixture: ComponentFixture<ConnectWalletButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectWalletButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectWalletButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
