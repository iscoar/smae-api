import { PatientEntity } from './patient.entity';

describe('PatientEntity', () => {
  it('should be defined', () => {
    expect(new PatientEntity()).toBeDefined();
  });
});
