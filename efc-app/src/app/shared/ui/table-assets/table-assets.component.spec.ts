import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableAssetsComponent } from './table-assets.component';

describe('TableAssetsComponent', () => {
  let component: TableAssetsComponent;
  let fixture: ComponentFixture<TableAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableAssetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
