# Shift Hours

Calculate how long you've worked, how much is left, and when you can clock out.

**Live:** https://mayurathod-ui.github.io/Shift-Hours/

## Use it (works for anyone, any Keka company)

**One-click:** on the site, open *One-click import from Keka*, drag the button to your bookmarks bar once. Then, on your Keka site while logged in, click the bookmark. Shift Hours opens with today's punches filled in.

**Or paste:** copy your punch log (any text with times like `9:41:12 AM`), paste it, press Calculate.

## Privacy & security

- 100% static, client-side. No backend, no analytics, no accounts, nothing stored.
- The bookmarklet runs inside *your own* logged-in Keka tab and calls Keka's same-origin API. Your Keka token never leaves that tab; only the clock times are passed to this page, in the URL hash (never sent to any server).
- Input from the URL is validated to clock times only and is never rendered as HTML.
- Strict Content-Security-Policy; no third-party scripts.
- Read the bookmarklet yourself: [`scripts/services/bookmarklet.js`](scripts/services/bookmarklet.js).

Unofficial; not affiliated with Keka. Personal project, public for hosting convenience.
