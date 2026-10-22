import { $ } from './dom.js';
import { state } from './state.js';
import { render, updateDetected } from './render.js';

const PASTE_LABEL_MS = 1600;

function pasteFromClipboard() {
  const lbl = $('pasteLbl');
  const flash = (t) => { lbl.textContent = t; setTimeout(() => { lbl.textContent = 'Paste'; }, PASTE_LABEL_MS); };
  const fallback = () => { $('log').focus(); $('log').select(); flash('Press Ctrl+V'); };

  if (!navigator.clipboard || !navigator.clipboard.readText) return fallback();
  navigator.clipboard.readText().then((txt) => {
    if (!txt) return flash('Clipboard empty');
    $('log').value = txt;
    updateDetected();
    flash('Pasted ✓');
  }).catch(fallback);
}

export function bindEvents() {
  $('log').addEventListener('input', updateDetected);

  $('calcBtn').addEventListener('click', () => {
    state.log = $('log').value;
    state.shift = $('shift').value;
    render();
  });

  $('pasteBtn').addEventListener('click', pasteFromClipboard);

  $('clearBtn').addEventListener('click', () => {
    $('log').value = '';
    state.log = '';
    updateDetected();
    render();
    $('log').focus();
  });
}
