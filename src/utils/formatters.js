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
