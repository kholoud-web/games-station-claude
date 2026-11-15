import { describe, expect, it } from 'vitest';
import {
  addressSchema,
  egyptPhoneSchema,
  emailSchema,
  newsletterSchema,
  passwordSchema,
  VALIDATION_MESSAGE_KEYS,
} from '@/lib/validation/schemas';
import ar from '@/messages/ar.json';
import en from '@/messages/en.json';

const messages = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((i) => i.message) ?? [];

describe('emailSchema', () => {
  it('accepts an address and normalizes case and spacing', () => {
    expect(emailSchema.parse('  Gamer@Example.COM ')).toBe('gamer@example.com');
  });

  it('rejects text that is not an address', () => {
    expect(messages(emailSchema.safeParse('nope'))).toEqual(['emailInvalid']);
  });

  it('asks for a value when the field is empty', () => {
    expect(messages(emailSchema.safeParse('   '))).toEqual(['required']);
  });

  it('rejects an address longer than 254 characters', () => {
    expect(emailSchema.safeParse(`${'a'.repeat(250)}@example.com`).success).toBe(false);
  });
});

describe('egyptPhoneSchema', () => {
  it.each([
    '01012345678',
    '+201012345678',
    '00201012345678',
    '010 1234 5678',
    '010-1234-5678',
    '1012345678',
    '٠١٠١٢٣٤٥٦٧٨',
  ])('accepts %s and normalizes it to 01012345678', (input) => {
    expect(egyptPhoneSchema.parse(input)).toBe('01012345678');
  });

  it.each(['11 5555 0000', '01512345678', '01212345678'])('accepts the %s mobile range', (input) => {
    expect(egyptPhoneSchema.safeParse(input).success).toBe(true);
  });

  it.each(['12345', '01312345678', '0101234567', '010123456789', 'abc', '', '+441012345678'])(
    'rejects %s',
    (input) => {
      expect(egyptPhoneSchema.safeParse(input).success).toBe(false);
    },
  );

  it('reports phoneInvalid for a wrong number and required for an empty one', () => {
    expect(messages(egyptPhoneSchema.safeParse('12345'))).toEqual(['phoneInvalid']);
    expect(messages(egyptPhoneSchema.safeParse(''))).toEqual(['required']);
  });
});

describe('passwordSchema', () => {
  it('accepts a strong password, including Arabic letters', () => {
    expect(passwordSchema.safeParse('NeonValkyrie99!').success).toBe(true);
    expect(passwordSchema.safeParse('كلمةسر123').success).toBe(true);
  });

  it('rejects abc and says what is missing', () => {
    expect(messages(passwordSchema.safeParse('abc')).sort()).toEqual(['passwordNeedsDigit', 'passwordTooShort']);
  });

  it('needs a letter and a number', () => {
    expect(messages(passwordSchema.safeParse('12345678'))).toEqual(['passwordNeedsLetter']);
    expect(messages(passwordSchema.safeParse('abcdefgh'))).toEqual(['passwordNeedsDigit']);
  });

  it('caps the length so a huge input cannot be used to slow hashing', () => {
    expect(messages(passwordSchema.safeParse(`a1${'x'.repeat(200)}`))).toEqual(['passwordTooLong']);
  });

  it('does not trim, because spaces may be part of the password', () => {
    expect(passwordSchema.parse(' abcdefg1 ')).toBe(' abcdefg1 ');
  });
});

describe('addressSchema', () => {
  const valid = {
    label: 'Home',
    recipient: 'Alex Vance',
    phone: '0101 234 5678',
    line1: '12 Tahrir Street',
    city: 'Giza',
    governorate: 'Giza',
  };

  it('accepts a complete address, normalizes the phone and defaults the country to EG', () => {
    expect(addressSchema.parse(valid)).toEqual({ ...valid, phone: '01012345678', country: 'EG' });
  });

  it('strips markup from free text fields', () => {
    const parsed = addressSchema.parse({ ...valid, recipient: '<b>Alex</b> <script>x()</script>Vance' });
    expect(parsed.recipient).toBe('Alex Vance');
  });

  it('rejects a missing city, a bad phone and a country other than Egypt', () => {
    expect(addressSchema.safeParse({ ...valid, city: '  ' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...valid, phone: '12345' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...valid, country: 'US' }).success).toBe(false);
  });

  it('limits the length of text fields', () => {
    expect(messages(addressSchema.safeParse({ ...valid, line1: 'x'.repeat(201) }))).toEqual(['tooLong']);
  });

  it('keeps line2 optional and never invents an id', () => {
    const parsed = addressSchema.parse({ ...valid, line2: 'Flat 4' });
    expect(parsed.line2).toBe('Flat 4');
    expect('id' in parsed).toBe(false);
  });
});

describe('newsletterSchema', () => {
  it('accepts an email and rejects anything else', () => {
    expect(newsletterSchema.parse({ email: 'A@b.co' })).toEqual({ email: 'a@b.co' });
    expect(newsletterSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});

describe('validation messages', () => {
  it('exist in both languages for every key a schema can produce', () => {
    for (const key of VALIDATION_MESSAGE_KEYS) {
      expect((en.validation as Record<string, string>)[key], `en ${key}`).toBeTruthy();
      expect((ar.validation as Record<string, string>)[key], `ar ${key}`).toBeTruthy();
    }
  });
});
