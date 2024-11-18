import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsFilterComponent } from './assets-filter.component';

describe('AssetsFilterComponent', () => {
  let component: AssetsFilterComponent;
  let fixture: ComponentFixture<AssetsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetsFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
