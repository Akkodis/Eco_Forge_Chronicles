import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDialogComponent } from './listing-dialog.component';

describe('ListingDialogComponent', () => {
  let component: ListingDialogComponent;
  let fixture: ComponentFixture<ListingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListingDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
