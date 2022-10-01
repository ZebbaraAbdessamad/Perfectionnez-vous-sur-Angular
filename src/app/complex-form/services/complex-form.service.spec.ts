/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ComplexFormService } from './complex-form.service';

describe('Service: ComplexForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComplexFormService]
    });
  });

  it('should ...', inject([ComplexFormService], (service: ComplexFormService) => {
    expect(service).toBeTruthy();
  }));
});
