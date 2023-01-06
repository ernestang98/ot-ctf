/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DiagnoseService } from './diagnose.service';

describe('Service: Diagnose', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiagnoseService]
    });
  });

  it('should ...', inject([DiagnoseService], (service: DiagnoseService) => {
    expect(service).toBeTruthy();
  }));
});
