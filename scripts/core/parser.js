const TIME_RE = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp])\.?\s*[Mm]/g;

/**
 * Extract every clock time from free text as seconds since midnight.
 * Headings without a time are ignored; the result is sorted so blocks pasted
 * out of order still pair up as in -> out.
 */
export function parsePunches(text) {
  const re = new RegExp(TIME_RE.source, 'g');
  const out = [];
  let m;
  while ((m = re.exec(text || ''))) {
    let h = Number(m[1]) % 12;
    if (/p/i.test(m[4])) h += 12;
    out.push(h * 3600 + Number(m[2]) * 60 + Number(m[3] || 0));
  }
  return out.sort((a, b) => a - b);
}
