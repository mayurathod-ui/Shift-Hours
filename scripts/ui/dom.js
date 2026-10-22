export const $ = (id) => document.getElementById(id);

export function setText(id, value) {
  const el = $(id);
  if (el.textContent !== value) el.textContent = value;
}
