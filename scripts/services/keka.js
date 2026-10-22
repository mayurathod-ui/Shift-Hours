import { KEKA_SYNC_INTERVAL_MS, KEKA_LOGIN_POLL_MS } from '../config.js';
import { clockOf } from '../core/format.js';
import { $ } from '../ui/dom.js';
import { state } from '../ui/state.js';
import { render, updateDetected } from '../ui/render.js';

let loginTimer = null;

function setUi(mode, msg, btn) {
  $('kekaBar').hidden = false;
  $('kekaDot').className = 'keka-dot' + (mode === 'on' ? ' on' : mode === 'wait' ? ' wait' : '');
  $('kekaMsg').textContent = msg;
  $('kekaBtn').textContent = btn;
  $('kekaBtn').dataset.mode = mode;
}

async function getJson(url, opt) {
  const r = await fetch(url, opt);
  const j = await r.json();
  j._status = r.status;
  return j;
}

async function sync() {
  const j = await getJson('/api/punches');
  if (j._status === 401) { setUi('off', 'Login required', 'Connect'); return false; }
  if (j.error) { setUi('off', 'Keka error: ' + j.error, 'Retry'); return false; }

  $('log').value = j.times.join('\n');
  state.log = $('log').value;
  updateDetected();
  render();

  const t = new Date();
  const now = clockOf(t.getHours() * 3600 + t.getMinutes() * 60);
  setUi('on', 'Live from Keka · ' + j.times.length + ' punches · ' + now, 'Sync');
  return true;
}

async function login() {
  setUi('wait', 'Log in to Keka in the window that opened…', 'Waiting');
  await getJson('/api/login', { method: 'POST' });
  clearInterval(loginTimer);
  loginTimer = setInterval(async () => {
    const s = await getJson('/api/status');
    if (s.login === 'waiting') return;
    clearInterval(loginTimer);
    if (s.login === 'error') return setUi('off', 'Login failed: ' + s.error, 'Retry');
    sync();
  }, KEKA_LOGIN_POLL_MS);
}

/** Live Keka sync (needs `npm start`; the page stays usable without it). */
export async function initKeka() {
  // The Keka bridge only exists on a local `npm start`; the hosted site is paste-only.
  if (!['localhost', '127.0.0.1'].includes(location.hostname)) return;

  $('kekaBtn').addEventListener('click', () => {
    const mode = $('kekaBtn').dataset.mode;
    if (mode === 'wait') return;
    if (mode === 'on') sync(); else login();
  });

  try {
    const s = await getJson('/api/status');
    if (s.connected) {
      sync();
      setInterval(() => { if (document.visibilityState === 'visible') sync(); }, KEKA_SYNC_INTERVAL_MS);
    } else {
      setUi('off', 'Keka not connected', 'Connect');
      login(); // first visit: open Keka login straight away
    }
  } catch (e) { /* no server: manual paste only */ }
}
