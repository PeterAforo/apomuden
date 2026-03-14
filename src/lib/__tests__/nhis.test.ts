import { validateNHISNumber, isServiceCovered, getNHISCoveredServices } from '../nhis';

describe('NHIS Service', () => {
  describe('validateNHISNumber', () => {
    it('should accept valid NHIS number format', () => {
      expect(validateNHISNumber('GHA-123456789-0')).toBe(true);
      expect(validateNHISNumber('GHA-987654321-5')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(validateNHISNumber('123456789')).toBe(false);
      expect(validateNHISNumber('GHA-12345-0')).toBe(false); // Too short
      expect(validateNHISNumber('GHA-1234567890-0')).toBe(false); // Too long
      expect(validateNHISNumber('GHA-ABCDEFGHI-0')).toBe(false); // Letters
      expect(validateNHISNumber('')).toBe(false);
      expect(validateNHISNumber('GHA123456789-0')).toBe(false); // Missing dash
    });

    it('should be case sensitive for prefix', () => {
      expect(validateNHISNumber('gha-123456789-0')).toBe(false);
      expect(validateNHISNumber('Gha-123456789-0')).toBe(false);
    });
  });

  describe('isServiceCovered', () => {
    it('should return true for fully covered services', () => {
      expect(isServiceCovered('outpatient_consultation')).toBe(true);
      expect(isServiceCovered('inpatient_care')).toBe(true);
      expect(isServiceCovered('maternity_care')).toBe(true);
      expect(isServiceCovered('emergency_care')).toBe(true);
    });

    it('should return true for partially covered services', () => {
      expect(isServiceCovered('laboratory_tests')).toBe(true);
      expect(isServiceCovered('imaging_xray')).toBe(true);
      expect(isServiceCovered('physiotherapy')).toBe(true);
    });

    it('should return false for non-covered services', () => {
      expect(isServiceCovered('cosmetic_surgery')).toBe(false);
      expect(isServiceCovered('fertility_treatment')).toBe(false);
      expect(isServiceCovered('organ_transplant')).toBe(false);
    });

    it('should return false for unknown services', () => {
      expect(isServiceCovered('unknown_service')).toBe(false);
      expect(isServiceCovered('')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isServiceCovered('OUTPATIENT_CONSULTATION')).toBe(true);
      expect(isServiceCovered('Maternity_Care')).toBe(true);
    });
  });

  describe('getNHISCoveredServices', () => {
    it('should return array of covered services', () => {
      const services = getNHISCoveredServices();
      
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    });

    it('should have required properties for each service', () => {
      const services = getNHISCoveredServices();
      
      services.forEach(service => {
        expect(service).toHaveProperty('code');
        expect(service).toHaveProperty('name');
        expect(service).toHaveProperty('coverage');
        expect(typeof service.code).toBe('string');
        expect(typeof service.name).toBe('string');
        expect(typeof service.coverage).toBe('number');
      });
    });

    it('should have coverage between 0 and 100', () => {
      const services = getNHISCoveredServices();
      
      services.forEach(service => {
        expect(service.coverage).toBeGreaterThanOrEqual(0);
        expect(service.coverage).toBeLessThanOrEqual(100);
      });
    });

    it('should include essential services', () => {
      const services = getNHISCoveredServices();
      const codes = services.map(s => s.code);
      
      expect(codes).toContain('outpatient_consultation');
      expect(codes).toContain('inpatient_care');
      expect(codes).toContain('maternity_care');
      expect(codes).toContain('emergency_care');
    });
  });
});
