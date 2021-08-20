import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetOverviewComponent } from './overview.component';

describe('OverviewComponent', () => {
  let component: AssetOverviewComponent;
  let fixture: ComponentFixture<AssetOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
