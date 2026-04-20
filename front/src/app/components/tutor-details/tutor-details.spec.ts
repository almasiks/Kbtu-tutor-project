import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorDetails } from './tutor-details';

describe('TutorDetails', () => {
  let component: TutorDetails;
  let fixture: ComponentFixture<TutorDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(TutorDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
