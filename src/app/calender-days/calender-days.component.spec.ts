import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalenderDaysComponent } from './calender-days.component';

describe('CalenderDaysComponent', () => {
  let component: CalenderDaysComponent;
  let fixture: ComponentFixture<CalenderDaysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalenderDaysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalenderDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
