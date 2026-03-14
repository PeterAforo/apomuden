// Test phone number validation logic (pure function, no server imports)
function formatGhanaPhone(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (digits.startsWith('233') && digits.length === 12) {
    return digits; // Already in international format
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return '233' + digits.slice(1); // Convert local to international
  }
  if (digits.length === 9 && !digits.startsWith('0')) {
    return '233' + digits; // Add country code
  }
  
  return null; // Invalid format
}

function isValidGhanaPhone(phone: string): boolean {
  const formatted = formatGhanaPhone(phone);
  if (!formatted) return false;
  
  // Ghana mobile prefixes: 20, 23, 24, 25, 26, 27, 28, 50, 54, 55, 56, 57, 59
  const validPrefixes = ['20', '23', '24', '25', '26', '27', '28', '50', '54', '55', '56', '57', '59'];
  const prefix = formatted.slice(3, 5);
  return validPrefixes.includes(prefix);
}

describe('SMS Service - Phone Validation', () => {
  describe('formatGhanaPhone', () => {
    it('should format local number starting with 0', () => {
      expect(formatGhanaPhone('0241234567')).toBe('233241234567');
    });

    it('should keep international format unchanged', () => {
      expect(formatGhanaPhone('233241234567')).toBe('233241234567');
    });

    it('should handle number without leading 0', () => {
      expect(formatGhanaPhone('241234567')).toBe('233241234567');
    });

    it('should handle +233 format', () => {
      expect(formatGhanaPhone('+233241234567')).toBe('233241234567');
    });

    it('should return null for invalid length', () => {
      expect(formatGhanaPhone('12345')).toBeNull();
      expect(formatGhanaPhone('12345678901234567890')).toBeNull();
    });

    it('should strip non-digit characters', () => {
      expect(formatGhanaPhone('024-123-4567')).toBe('233241234567');
      expect(formatGhanaPhone('(024) 123 4567')).toBe('233241234567');
    });
  });

  describe('isValidGhanaPhone', () => {
    it('should accept valid MTN numbers (024)', () => {
      expect(isValidGhanaPhone('0241234567')).toBe(true);
    });

    it('should accept valid Vodafone numbers (020)', () => {
      expect(isValidGhanaPhone('0201234567')).toBe(true);
    });

    it('should accept valid AirtelTigo numbers (027)', () => {
      expect(isValidGhanaPhone('0271234567')).toBe(true);
    });

    it('should accept valid Glo numbers (023)', () => {
      expect(isValidGhanaPhone('0231234567')).toBe(true);
    });

    it('should reject invalid prefix', () => {
      expect(isValidGhanaPhone('0301234567')).toBe(false);
      expect(isValidGhanaPhone('0111234567')).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(isValidGhanaPhone('invalid')).toBe(false);
      expect(isValidGhanaPhone('')).toBe(false);
    });
  });
});
