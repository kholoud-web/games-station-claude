import { z } from '@/lib/zod';
import { stripTags } from '@/lib/sanitize';

/**
 * Messages are keys in the `validation` namespace of the message files, so forms can show
 * them in the active language: `t(issue.message)`.
 */
export const VALIDATION_MESSAGE_KEYS = [
  'required',
  'emailInvalid',
  'phoneInvalid',
  'passwordTooShort',
  'passwordTooLong',
  'passwordNeedsLetter',
  'passwordNeedsDigit',
  'tooLong',
  'countryUnsupported',
] as const;

export type ValidationMessageKey = (typeof VALIDATION_MESSAGE_KEYS)[number];

const msg = (key: ValidationMessageKey) => ({ error: key });

export const emailSchema = z
  .string()
  .trim()
  .min(1, msg('required'))
  .toLowerCase()
  .max(254, msg('tooLong'))
  .pipe(z.email(msg('emailInvalid')));

/** Western digits for Arabic-Indic (٠-٩) and Persian (۰-۹) input. */
function toWesternDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** `+20 101 234 5678`, `0020…`, `1012345678` and `010-1234-5678` all become `01012345678`. */
function normalizeEgyptPhone(raw: string): string {
  let digits = toWesternDigits(raw).replace(/[\s\-().]/g, '');
  if (digits.startsWith('+20')) digits = digits.slice(3);
  else if (digits.startsWith('0020')) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith('20')) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;
  return digits;
}

/** Egyptian mobile numbers: 010, 011, 012 or 015 followed by eight digits. */
export const egyptPhoneSchema = z
  .string()
  .trim()
  .min(1, msg('required'))
  .transform(normalizeEgyptPhone)
  .pipe(z.string().regex(/^01[0125]\d{8}$/, msg('phoneInvalid')));

/** Not trimmed: spaces can be part of a password. The length cap keeps hashing cheap to serve. */
export const passwordSchema = z
  .string()
  .min(8, msg('passwordTooShort'))
  .max(128, msg('passwordTooLong'))
  .regex(/\p{L}/u, msg('passwordNeedsLetter'))
  .regex(/\p{Nd}/u, msg('passwordNeedsDigit'));

/** Plain text field: markup is removed, then the value is trimmed and length-checked. */
const text = (max: number) =>
  z
    .string()
    .transform(stripTags)
    .pipe(z.string().trim().min(1, msg('required')).max(max, msg('tooLong')));

export const addressSchema = z.object({
  label: text(30),
  recipient: text(100),
  phone: egyptPhoneSchema,
  line1: text(200),
  line2: z
    .string()
    .transform(stripTags)
    .pipe(z.string().trim().max(200, msg('tooLong')))
    .transform((value) => value || undefined)
    .optional(),
  city: text(80),
  governorate: text(80),
  country: z.literal('EG', msg('countryUnsupported')).default('EG'),
});

export const newsletterSchema = z.object({ email: emailSchema });
