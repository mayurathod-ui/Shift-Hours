import { SHIFTS, DAYS, MONTHS } from '../config.js';
import { parsePunches } from '../core/parser.js';
import { calculateShift } from '../core/calculator.js';
import { clockOf, dur, hourLabel } from '../core/format.js';
import { $, setText } from './dom.js';
import { state } from './state.js';

const RING_CIRCUMFERENCE = 2 * Math.PI * 84;

export function updateDetected() {
  const n = parsePunches($('log').value).length;
  $('detected').textContent = n === 0
    ? 'No times found'
    : n + (n === 1 ? ' punch' : ' punches') + (n % 2 ? ' ' : '');
}

function renderHero(r, nowS) {
  let label, value, sub;
  if (!r.has) {
    label = 'Waiting for punches'; value = '--:--'; sub = 'Paste your KEKA log and press Calculate.';
  } else if (r.done) {
    label = 'Shift complete'; value = 'Leave now';
    sub = 'Target met' + (r.eff - r.req > 59 ? ' – ' + dur(r.eff - r.req) + ' extra' : ' just now');
  } else if (r.inside) {
    label = 'You can leave at'; value = clockOf(nowS + r.remaining); sub = dur(r.remaining) + ' to go — keep going!';
  } else {
    label = 'You’re checked out'; value = dur(r.remaining); sub = 'still needed — punch back in to finish your shift.';
  }
  setText('heroLabel', label);
  setText('heroValue', value);
  setText('heroSub', sub);
  $('chipYes').hidden = !r.done;
  $('chipNo').hidden = r.done;
}

function renderCompletion(r, nowS) {
  let completeAt = '--:--';
  let note = 'Paste punches to see';
  if (r.has) {
    if (r.completedAt !== null) { completeAt = clockOf(r.completedAt); note = 'Completed'; }
    else if (r.inside) { completeAt = clockOf(nowS + r.remaining); note = 'If you stay in office'; }
    else { completeAt = clockOf(nowS + r.remaining); note = 'If you punch in right now'; }
  }
  setText('completeLabel', dur(r.req) + ' complete at');
  setText('completeAt', completeAt);
  setText('completeNote', note);
  setText('remText', r.has ? dur(r.remaining) : '--');
}

function renderRing(r) {
  const pct = r.has ? Math.min(100, (r.eff / r.req) * 100) : 0;
  const c = RING_CIRCUMFERENCE;
  $('ringFill').setAttribute('stroke-dasharray', (c * pct / 100).toFixed(1) + ' ' + c.toFixed(1));
  setText('pct', Math.floor(pct) + '%');
  setText('effOfReq', (r.has ? dur(r.eff) : '0h 00m') + ' / ' + dur(r.req));
}

function renderStats(r, t) {
  const { has, inside } = r;
  setText('sArrival', has ? clockOf(t[0]) : '--:--');
  setText('sEff', has ? dur(r.eff) : '--');
  setText('sGross', has ? dur(r.gross) : '--');
  setText('sBreaks', has ? dur(r.breaks) : '--');
  setText('sLastLabel', inside ? 'Status' : 'Last out');
  setText('sLast', !has ? '--:--' : inside ? 'In office' : clockOf(t[t.length - 1]));
  setText('sPunches', has ? String(t.length) : '--');
}

function renderTimeline(r, t, nowS) {
  $('tlBody').hidden = !r.has;
  $('tlEmpty').hidden = r.has;
  if (!r.has) return;

  const start = Math.floor(t[0] / 3600) * 3600;
  const endC = Math.max(r.last, nowS, r.inside ? nowS + r.remaining : r.last);
  let end = Math.ceil(endC / 3600) * 3600;
  if (end - start < 4 * 3600) end = start + 4 * 3600;
  const span = end - start;
  const hours = span / 3600;
  const step = hours > 9 ? 2 : 1;

  let track = r.sessions.map((s) =>
    '<div class="block" style="left:' + ((s.a - start) / span * 100) + '%;width:' +
    Math.max(0.6, s.len / span * 100) + '%"></div>').join('');
  if (nowS >= start && nowS <= end) {
    track += '<div class="now-line" style="left:' + ((nowS - start) / span * 100) + '%"></div>';
  }
  $('track').innerHTML = track;

  let ticks = '';
  for (let h = 0; h <= hours; h += step) {
    const hh = Math.floor((start + h * 3600) / 3600) % 24;
    ticks += '<span style="left:' + (h * 3600 / span * 100) + '%">' + hourLabel(hh) + '</span>';
  }
  $('ticks').innerHTML = ticks;

  $('sessions').innerHTML = r.sessions.map((s, i) =>
    '<div class="session"><div><div class="session-n">Session ' + (i + 1) + '</div>' +
    '<div class="session-t">' + clockOf(s.a) + ' → ' + (s.open ? 'now' : clockOf(s.b)) + '</div></div>' +
    '<div class="session-d">' + dur(s.len) + '</div></div>').join('');
}

export function render() {
  const d = new Date();
  const nowS = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  setText('date', DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear());
  setText('clock', clockOf(nowS, true));

  const req = SHIFTS[state.shift];
  const t = parsePunches(state.log);
  const r = { ...calculateShift(t, nowS, req), req };

  renderHero(r, nowS);
  renderCompletion(r, nowS);
  renderRing(r);
  renderStats(r, t);
  renderTimeline(r, t, nowS);
}
