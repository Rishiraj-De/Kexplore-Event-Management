import { describe, expect, it } from 'vitest';
import { formatPhoneInput, rules, suggestEmail, toE164, validateRegistration } from './validators';

const valid = {
  eventId: '6aec9fa7384dd2b71246fcbd',
  name: 'Ananya Mishra',
  email: 'ananya@example.com',
  country: 'IN',
  phone: '98765 43210',
  organization: 'KIIT University',
  tickets: 2,
  agree: true,
};

describe('registration validation', () => {
  it('accepts a complete, valid form', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it('reports every missing required field', () => {
    const errors = validateRegistration({ country: 'IN', tickets: 1 });
    expect(Object.keys(errors).sort()).toEqual(['agree', 'email', 'eventId', 'name', 'phone']);
  });

  it.each([
    ['A', 'at least 2'],
    ['R2-D2', 'letters only'],
    ['x'.repeat(61), '60 characters'],
  ])('rejects the name %j', (name, message) => {
    expect(rules.name(name)).toMatch(message);
  });

  it('accepts names with accents, apostrophes and hyphens', () => {
    expect(rules.name("Zoë O'Brien-Das")).toBeNull();
  });

  it.each(['plainaddress', 'no@tld', 'two..dots@example.com', 'spa ce@example.com', 'a@b.c'])('rejects the email %j', (email) => {
    expect(rules.email(email)).not.toBeNull();
  });

  it('validates Indian mobile numbers', () => {
    expect(rules.phone('98765 43210', 'IN')).toBeNull();
    expect(rules.phone('12345 67890', 'IN')).toMatch(/starting with 6–9/);
    expect(rules.phone('98765', 'IN')).not.toBeNull();
    expect(rules.phone('98765-4321a', 'IN')).toMatch(/digits only/);
  });

  it('validates other countries with their own rules', () => {
    expect(rules.phone('8123 4567', 'SG')).toBeNull();
    expect(rules.phone('412 345 678', 'AU')).toBeNull();
    expect(rules.phone('98765 43210', 'SG')).not.toBeNull();
  });

  it('limits tickets to 1–4', () => {
    expect(rules.tickets(0)).not.toBeNull();
    expect(rules.tickets(5)).toMatch(/up to 4/);
    expect(rules.tickets(4)).toBeNull();
  });
});

describe('phone helpers', () => {
  it('formats Indian numbers as 5 + 5 digits', () => {
    expect(formatPhoneInput('9876543210', 'IN')).toBe('98765 43210');
  });
  it('converts to E.164', () => {
    expect(toE164('98765 43210', 'IN')).toBe('+919876543210');
    expect(toE164('412 345 678', 'AU')).toBe('+61412345678');
  });
});

describe('email typo suggestions', () => {
  it.each([
    ['john@gmial.com', 'john@gmail.com'],
    ['john@yaho.com', 'john@yahoo.com'],
    ['john@outlok.com', 'john@outlook.com'],
  ])('%s → %s', (input, expected) => {
    expect(suggestEmail(input)).toBe(expected);
  });

  it('stays quiet for correct or unrelated domains', () => {
    expect(suggestEmail('john@gmail.com')).toBeNull();
    expect(suggestEmail('john@mycompany.io')).toBeNull();
  });
});
