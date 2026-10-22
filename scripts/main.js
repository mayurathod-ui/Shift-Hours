import { RENDER_INTERVAL_MS } from './config.js';
import { $ } from './ui/dom.js';
import { state } from './ui/state.js';
import { render, updateDetected } from './ui/render.js';
import { bindEvents } from './ui/events.js';
import { initHeaderHeight } from './ui/header.js';
import { initKeka } from './services/keka.js';
import { initBookmarklet, importFromHash } from './services/bookmarklet.js';

state.log = $('log').value;

bindEvents();
initHeaderHeight();
initKeka();
initBookmarklet();
importFromHash();

updateDetected();
render();
setInterval(render, RENDER_INTERVAL_MS);
