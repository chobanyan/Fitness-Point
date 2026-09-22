---
name: figma-qa
description: Compare this app's live/local pages against their Figma designs, find visual and UX discrepancies, and produce an English-language .xlsx bug report for developers. Use when asked to QA the site against Figma, do a design review, or find UI bugs vs the mockups.
---

# Figma vs Site QA

Repeatable design-QA pass: compare a rendered page of this app against its
Figma design and hand the developer a clean, English-language bug list in
`.xlsx`. Invoke again any time a new screen needs checking — just pass a new
Figma link.

## Usage

`/figma-qa <figma-frame-url> [site-url-or-"local"] [routes...]`

- `figma_url` (required): a Figma link with a `node-id` pointing at the
  specific frame/screen to check. If only given a whole-file link (no
  node-id), ask the user for a node-specific link instead of diffing the
  entire file in one pass.
- `target` (optional): `local` (default) starts/reuses `npm run dev` on
  `http://localhost:3000`, or pass a deployed URL (e.g. the Render URL from
  `render.yaml`).
- `routes` (optional): which routes to check. If omitted, infer from the
  Figma frame name/content and this app's known routes: `/` and
  `/booking-call` (landing + the 4-step booking modal: topic, day/slot,
  contact + recap, OTP verification, confirmation), `/admin/login`,
  `/admin` (bookings list), `/admin/settings`.

## Steps

1. **Resolve the Figma target.** Extract `fileKey` + `nodeId` from the URL.
   Call `mcp__Figma__get_metadata` on that node to enumerate meaningful
   sub-frames/states (each wizard step, error/empty/loading states, mobile
   vs desktop variants) so none are missed. Call `mcp__Figma__get_screenshot`
   per frame/state at a high `maxDimension` (~2000) for real detail.
2. **Pull exact design values.** Use `mcp__Figma__get_design_context` on the
   frames/components under test to get ground-truth colors, spacing,
   typography, radii — treat this as reference data for comparison, not
   code to paste in verbatim.
3. **Render the live page.** If `target` is local, ensure `npm run dev` is
   running (start it and wait for "Ready" if not; reuse if already up).
   Drive the pre-installed Chromium via Playwright: set the viewport to
   match the Figma frame's width, navigate to the route, wait for fonts and
   images to settle (no spinners), and actually interact with the UI to
   reach each state under review (click through the booking modal steps,
   trigger a validation error, log into `/admin` with the credentials in
   `.env`) rather than only checking first paint. Screenshot full-page for
   each state.
4. **Compare side by side**, frame-by-frame / state-by-state, for:
   - Layout & spacing (padding, gaps, alignment, element order)
   - Color (background/text/border/icon vs the Figma hex values)
   - Typography (font family, size, weight, line-height, wrapping/truncation)
   - Copy (missing/mismatched text, wrong locale, placeholder vs real content)
   - Components & states (missing hover/focus/disabled/error/empty/loading
     states, wrong icon, missing element)
   - Responsiveness (overflow/breakage at the target viewport; correct
     breakpoint used)
   - Assets (missing/wrong images, icons, logos)
   - Interaction fidelity (does the flow match what the design implies)

   Don't flag content that's expected to differ from a static mock (live
   dates/times, seeded/random data, real vs placeholder booking IDs) as a bug.
5. **Log each real discrepancy** — only ones actually visually confirmed by
   looking at both screenshots, never fabricated — with: page/route,
   component/area, a short crop or full screenshot from both Figma and the
   site (save PNGs to the scratchpad dir), a one-line description, expected
   vs actual, and a severity:
   - **Critical** — broken functionality or a fully missing element
   - **High** — clearly visible wrong layout/color/spacing, hurts usability
     or brand
   - **Medium** — noticeable spacing/typography mismatch on close look
   - **Low** — cosmetic nit
6. **Build the report.** Load the `xlsx` skill to produce the workbook
   properly (don't hand-roll the file format). All content in English:
   - Sheet "Summary": date, Figma frame(s) and routes covered, bug counts
     per severity.
   - Sheet "Bugs": one row per issue, columns `#, Page/Screen,
     Component/Area, Severity, Issue Description, Expected (Figma), Actual
     (Site), Notes/Repro Steps`.
7. **Deliver.** Save the workbook in the scratchpad dir as
   `figma-qa-report-<date>.xlsx` and send it with `SendUserFile`. Do not
   commit the report or screenshots into the git repo. In chat, give only a
   short summary (counts by severity, routes/frames covered) — the
   spreadsheet is the deliverable, not a chat transcript of every row.

## Notes

- This is a visual-judgment pass, not pixel-diff automation — actually look
  at both screenshots before writing each row.
- Reuse this skill for the next screen by calling it again with a new Figma
  link; nothing here is specific to one frame.
