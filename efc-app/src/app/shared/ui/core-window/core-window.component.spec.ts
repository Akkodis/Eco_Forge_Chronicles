import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreWindowComponent } from './core-window.component';

describe('CoreWindowComponent', () => {
  let component: CoreWindowComponent;
  let fixture: ComponentFixture<CoreWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoreWindowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CoreWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
