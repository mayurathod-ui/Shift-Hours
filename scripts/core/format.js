const pad = (n) => (n < 10 ? '0' : '') + n;

/** Seconds since midnight -> "h:mm[:ss] AM/PM". */
export function clockOf(s, withSec) {
  s = ((Math.floor(s) % 86400) + 86400) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (h % 12 || 12) + ':' + pad(m) + (withSec ? ':' + pad(sec) : '') + ' ' + (h >= 12 ? 'PM' : 'AM');
}

/** Seconds -> "Xh YYm". */
export function dur(s) {
  s = Math.max(0, Math.round(s));
  return Math.floor(s / 3600) + 'h ' + pad(Math.floor((s % 3600) / 60)) + 'm';
}

/** Hour label for timeline ticks, e.g. 13 -> "1 PM". */
export function hourLabel(h) {
  return (h % 12 || 12) + (h >= 12 ? ' PM' : ' AM');
}
