/** Publish the sticky header height as --hdr-h. */
export function initHeaderHeight() {
  const h = document.querySelector('header');
  const set = () => document.documentElement.style.setProperty('--hdr-h', h.offsetHeight + 'px');
  set();
  window.addEventListener('resize', set);
  if (window.ResizeObserver) new ResizeObserver(set).observe(h);
}
