import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalenderInviteesComponent } from './calender-invitees.component';

describe('CalenderInviteesComponent', () => {
  let component: CalenderInviteesComponent;
  let fixture: ComponentFixture<CalenderInviteesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalenderInviteesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalenderInviteesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
