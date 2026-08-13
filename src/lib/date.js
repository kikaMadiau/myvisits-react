import {
  format,
  isAfter,
  isValid,
  isSameDay,
  isSameWeek,
  parse,
  parseISO,
  startOfDay,
} from 'date-fns';

const VISIT_DATE_FORMATS = [
  "MM-dd-yyyy HH:mm",
  "MM-dd-yyyy H:mm",
  "dd-MM-yyyy HH:mm",
  "dd-MM-yyyy H:mm",
  "MM/dd/yyyy HH:mm",
  "MM/dd/yyyy H:mm",
  "dd/MM/yyyy HH:mm",
  "dd/MM/yyyy H:mm",
  "yyyy-MM-dd HH:mm:ss",
  "yyyy-MM-dd HH:mm",
  "yyyy-MM-dd H:mm",
  "yyyy-MM-dd'T'HH:mm",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  "yyyy-MM-dd'T'HH:mm:ssxxx",
  "HH:mm:ss",
  "HH:mm",
  "H:mm:ss",
  "H:mm",
  "HH'h'mm",
  "H'h'mm",
];

const TIME_REGEX = /\b([01]?\d|2[0-3])[:hH]([0-5]\d)(?::([0-5]\d))?\b|\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*([ap]\.?m\.?)\b/i;

export function parseVisitDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;

  if (typeof value === 'string') {
    const isoDate = parseISO(value);
    if (isValid(isoDate)) return isoDate;

    for (const dateFormat of VISIT_DATE_FORMATS) {
      const parsedDate = parse(value, dateFormat, new Date());
      if (isValid(parsedDate)) return parsedDate;
    }
  }

  const date = new Date(value);
  return isValid(date) ? date : null;
}

export function formatVisitDate(value, pattern) {
  const date = parseVisitDate(value);
  return date ? format(date, pattern) : '—';
}

export function formatVisitTime(value) {
  if (!value) return '—';

  const date = parseVisitDate(value);
  if (date) return format(date, 'HH:mm');

  const match = String(value).match(TIME_REGEX);
  if (!match) return '—';

  if (match[6]) {
    let hour = Number(match[4]);
    const minute = match[5] || '00';
    const meridiem = match[6].toLowerCase();

    if (meridiem.startsWith('p') && hour < 12) hour += 12;
    if (meridiem.startsWith('a') && hour === 12) hour = 0;

    return `${String(hour).padStart(2, '0')}:${minute}`;
  }

  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
}

export function isVisitToday(value) {
  const date = parseVisitDate(value);
  return date ? isSameDay(date, startOfDay(new Date())) : false;
}

export function isVisitThisWeek(value) {
  const date = parseVisitDate(value);
  return date ? isSameWeek(date, new Date()) : false;
}

export function isVisitUpcoming(value) {
  const date = parseVisitDate(value);
  return date ? isAfter(date, new Date()) : false;
}
