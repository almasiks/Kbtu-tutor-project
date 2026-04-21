import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { authInterceptor } from './auth';

describe('authInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
  });

  it('should be created', () => {
    expect(authInterceptor).toBeTruthy();
  });
});
