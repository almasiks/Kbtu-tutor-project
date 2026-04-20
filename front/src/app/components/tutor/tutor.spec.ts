import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TutorDetailComponent } from './tutor';

describe('TutorDetailComponent', () => {
  let component: TutorDetailComponent;
  let fixture: ComponentFixture<TutorDetailComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TutorDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock
      .expectOne((req) => req.url.includes('/tutors/profile/1/'))
      .flush({
        id: 1,
        user: { id: 1, username: 'test', email: 't@test.com' },
        subject: { id: 1, name: 'Math', description: '' },
        experience_years: 2,
        bio: 'Bio',
        hourly_rate: '100.00',
        rating: '4.5',
      });
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
