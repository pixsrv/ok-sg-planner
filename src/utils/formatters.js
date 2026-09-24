import {
  DATE_FORMAT_YYYY_MM_DD_ISO,
  DATE_FORMAT_DD_MM_YYYY_DASH,
  DATE_FORMAT_MM_DD_YYYY_SLASH,
  DATE_FORMAT_YYYY_MM_DD_SLASH,
  DATE_FORMAT_DD_MM_YYYY_DOT,
  TIME_FORMAT_12H
} from '../constants/settings';

export const formatDate = (date, format, options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const { showYear = true } = options;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case DATE_FORMAT_YYYY_MM_DD_ISO:
      return showYear ? `${year}-${month}-${day}` : `${month}-${day}`;
    case DATE_FORMAT_DD_MM_YYYY_DASH:
      return showYear ? `${day}-${month}-${year}` : `${day}-${month}`;
    case DATE_FORMAT_MM_DD_YYYY_SLASH:
      return showYear ? `${month}/${day}/${year}` : `${month}/${day}`;
    case DATE_FORMAT_YYYY_MM_DD_SLASH:
      return showYear ? `${year}/${month}/${day}` : `${month}/${day}`;
    case DATE_FORMAT_DD_MM_YYYY_DOT:
      return showYear ? `${day}.${month}.${year}` : `${day}.${month}`;
    default:
      if (format && typeof format === 'string' && format.startsWith('YYYY')) {
        const separator = format.charAt(4);
        return showYear ? `${year}${separator}${month}${separator}${day}` : `${month}${separator}${day}`;
      }
      return showYear ? `${year}-${month}-${day}` : `${month}-${day}`;
  }
};

export const formatTime = (time, format) => {
  if (!time) return '';

  let hours, minutes;

  if (time instanceof Date) {
    hours = time.getHours();
    minutes = time.getMinutes();
  } else if (typeof time === 'string' && time.includes(':')) {
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time;
    hours = h;
    minutes = m;
  } else {
    return time;
  }

  const minutesStr = String(minutes).padStart(2, '0');

  if (format === TIME_FORMAT_12H) {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutesStr} ${ampm}`;
  }

  // 24h is default
  return `${String(hours).padStart(2, '0')}:${minutesStr}`;
};

export const formatWorkDuration = (start, end) => {
  if (!start || !end) return '';

  const parseToMinutes = (time) => {
    if (time instanceof Date) {
      return time.getHours() * 60 + time.getMinutes();
    }
    if (typeof time === 'string' && time.includes(':')) {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    }
    return 0;
  };

  const startMinutes = parseToMinutes(start);
  const endMinutes = parseToMinutes(end);
  let durationMinutes = endMinutes - startMinutes;

  if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle overnight shifts if any

  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;

  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
};

export const formatDuration = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
};

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  if (typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};
