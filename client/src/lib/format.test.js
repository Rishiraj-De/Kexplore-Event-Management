import { describe, expect, it } from 'vitest';
import { availability, eventPhase, formatPrice, seatsLeft } from './format';
import { parseRegistrationBackup, registrationsToCSV } from './storage';

const event = (over = {}) => ({
  startDate: '2026-12-12T10:30:00.000Z',
  endDate: '2026-12-12T18:00:00.000Z',
  capacity: 100,
  registeredCount: 40,
  ...over,
});

describe('event helpers', () => {
  it('computes the event phase', () => {
    const e = event();
    expect(eventPhase(e, Date.parse('2026-12-01'))).toBe('upcoming');
    expect(eventPhase(e, Date.parse('2026-12-12T12:00:00Z'))).toBe('live');
    expect(eventPhase(e, Date.parse('2026-12-13'))).toBe('past');
  });

  it('reports availability tiers', () => {
    expect(seatsLeft(event())).toBe(60);
    expect(availability(event()).tone).toBe('ok');
    expect(availability(event({ registeredCount: 90 })).label).toBe('Only 10 left');
    expect(availability(event({ registeredCount: 100 })).label).toBe('Sold out');
  });

  it('formats prices in rupees', () => {
    expect(formatPrice(0)).toBe('Free');
    expect(formatPrice(1499)).toBe('₹1,499');
  });
});

describe('Local Storage backups', () => {
  const reg = {
    ticketCode: 'KX-AB23-CD45',
    name: 'Ananya "Annie" Mishra',
    email: 'a@example.com',
    phone: '+919876543210',
    tickets: 2,
    status: 'confirmed',
    createdAt: '2026-11-05T10:00:00.000Z',
    event: { title: 'HackKalinga 2026', startDate: '2026-11-21T03:30:00.000Z', venue: { name: 'KIIT' } },
  };

  it('exports CSV with escaped quotes', () => {
    const csv = registrationsToCSV([reg]);
    expect(csv.split('\n')[0]).toContain('ticketCode');
    expect(csv).toContain('"Ananya ""Annie"" Mishra"');
  });

  it('imports only valid tickets from a backup file', () => {
    const file = JSON.stringify({ registrations: [reg, { ticketCode: 'bad' }, { ticketCode: 'KX-ZZZZ-ZZZZ' }] });
    expect(parseRegistrationBackup(file)).toHaveLength(1);
  });

  it('rejects files that are not backups', () => {
    expect(() => parseRegistrationBackup('{"hello":1}')).toThrow(/not a Eventon/);
  });
});
