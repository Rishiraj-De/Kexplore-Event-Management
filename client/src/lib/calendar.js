import { downloadFile } from './utils';

const icsDate = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escapeICS = (text = '') => String(text).replace(/[\\;,]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');

const locationOf = (event) =>
  event.mode === 'online' ? 'Online' : [event.venue?.name, event.venue?.address, event.venue?.city].filter(Boolean).join(', ');

const eventUrl = (event) => `${window.location.origin}/events/${event.slug}`;

/** Download an .ics file that works with Apple Calendar, Outlook and Google Calendar. */
export function downloadICS(event, ticketCode) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Summit//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ticketCode ?? event.slug}@summit`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(event.startDate)}`,
    `DTEND:${icsDate(event.endDate)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(`${event.shortDescription ?? ''}${ticketCode ? `\n\nTicket: ${ticketCode}` : ''}\n${eventUrl(event)}`)}`,
    `LOCATION:${escapeICS(locationOf(event))}`,
    `URL:${eventUrl(event)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeICS(event.title)} starts in 2 hours`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  downloadFile(`${event.slug}.ics`, lines.join('\r\n'), 'text/calendar;charset=utf-8');
}

export function googleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${icsDate(event.startDate)}/${icsDate(event.endDate)}`,
    details: `${event.shortDescription ?? ''}\n\n${eventUrl(event)}`,
    location: locationOf(event),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
