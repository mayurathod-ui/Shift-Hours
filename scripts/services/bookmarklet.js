import { $ } from '../ui/dom.js';
import { state } from '../ui/state.js';
import { render, updateDetected } from '../ui/render.js';

/**
 * One-click import for any Keka user, with no backend and no token ever leaving Keka.
 *
 * The bookmarklet runs on the user's own, already logged-in Keka tab: it reads today's
 * punches from Keka's same-origin API and opens this page with only the clock times in
 * the URL hash (#p=...). A hash is never sent to any server.
 */
function bookmarkletBody(site) {
  return `(async()=>{try{
var S=localStorage,t=null,k;
for(k of ['access_token','accessToken']){if(S.getItem(k)){t=S.getItem(k);break}}
if(!t)for(k=0;k<S.length;k++){var n=S.key(k),v=S.getItem(n)||'';if(/token/i.test(n)&&/^"?eyJ[\\w-]+\\.[\\w-]+\\.[\\w-]+"?$/.test(v)){t=v;break}}
if(!t)throw Error('Open this on your Keka page while logged in');
t=t.replace(/^"|"$/g,'');
var d=new Date(),p=function(x){return String(x).padStart(2,'0')},
day=d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()),
r=await fetch('/k/default/api/mytime/attendance/summary?from='+day+'&to='+day,{headers:{Authorization:'Bearer '+t,Accept:'application/json'}});
if(!r.ok)throw Error('Keka returned '+r.status+' - are you on your Keka attendance site?');
var j=await r.json(),
times=(j.data||[]).filter(function(x){return(x.attendanceDate||'').slice(0,10)===day})
.flatMap(function(x){return(x.timeEntries||[]).map(function(e){return e.timestamp})})
.filter(Boolean).map(function(s){return new Date(s)}).sort(function(a,b){return a-b})
.map(function(x){var h=x.getHours(),m=h%12||12;return m+':'+p(x.getMinutes())+':'+p(x.getSeconds())+(h<12?' AM':' PM')});
if(!times.length)throw Error('No punches found for today');
window.open('${site}#p='+encodeURIComponent(times.join(',')),'_blank','noopener,noreferrer');
}catch(e){alert('Shift Hours: '+e.message)}})()`.replace(/\n/g, '');
}

/** Point the "drag me" link at a bookmarklet that opens this exact page. */
export function initBookmarklet() {
  const link = $('bmLink');
  if (!link) return;
  const site = location.origin + location.pathname;
  link.href = 'javascript:' + encodeURIComponent(bookmarkletBody(site));
  // Clicking (instead of dragging) would run it on this page; explain instead.
  link.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Drag this button to your bookmarks bar, then click that bookmark while you are on your Keka page.');
  });
}

/** Fill the log from #p=09:31:13 AM,... and calculate immediately. */
export function importFromHash() {
  const m = /^#p=(.+)$/.exec(location.hash);
  if (!m) return;
  let times;
  try { times = decodeURIComponent(m[1]).split(','); } catch (e) { return; }
  // Untrusted input: keep only well-formed clock times, capped, and only ever set as plain text.
  times = times.filter((t) => /^\d{1,2}:\d{2}(:\d{2})? [AP]M$/.test(t)).slice(0, 200);
  if (!times.length) return;
  $('log').value = times.join('\n');
  state.log = $('log').value;
  history.replaceState(null, '', location.pathname + location.search);
  updateDetected();
  render();
}
