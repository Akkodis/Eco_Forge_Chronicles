import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreFilterComponent } from './core-filter.component';

describe('CoreFilterComponent', () => {
  let component: CoreFilterComponent;
  let fixture: ComponentFixture<CoreFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoreFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoreFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
