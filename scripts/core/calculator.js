/**
 * Pure shift maths — no DOM access.
 * @param {number[]} t         sorted punch times (seconds since midnight)
 * @param {number} nowS        current time (seconds since midnight)
 * @param {number} req         required effective seconds
 */
export function calculateShift(t, nowS, req) {
  const has = t.length > 0;
  const inside = t.length % 2 === 1;

  // pair punches: in -> out (an unpaired last punch runs until now)
  let eff = 0;
  const sessions = [];
  for (let i = 0; i < t.length; i += 2) {
    const a = t[i];
    const open = t[i + 1] === undefined;
    const b = open ? Math.max(nowS, a) : t[i + 1];
    const len = Math.max(0, b - a);
    eff += len;
    sessions.push({ a, b, open, len });
  }

  const last = has ? (inside ? Math.max(nowS, t[t.length - 1]) : t[t.length - 1]) : 0;
  const gross = has ? Math.max(0, last - t[0]) : 0;
  const breaks = Math.max(0, gross - eff);
  const remaining = Math.max(0, req - eff);
  const done = has && remaining === 0;

  // moment the required time was reached (null if not yet)
  let completedAt = null;
  let acc = 0;
  for (const s of sessions) {
    if (acc + s.len >= req) { completedAt = s.a + (req - acc); break; }
    acc += s.len;
  }

  return { has, inside, sessions, eff, last, gross, breaks, remaining, done, completedAt };
}
