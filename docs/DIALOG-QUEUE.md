# Bootbox 6.1.0 — LIFO Dialog Queue & Native Polish

This document describes the dialog-queue work shipped in **Bootbox 6.1.0**: why it exists, how it behaves, the public API, accessibility changes, migration notes, and how it was verified.

## Motivation

Bootbox wraps Bootstrap modals for `alert` / `confirm` / `prompt` / `dialog`. Before 6.1.0, each call appended and showed another Bootstrap modal. Multiple open dialogs stacked in the DOM with no managed order — messy backdrops, focus, and dismiss behavior.

Compared with [SweetAlert2](https://sweetalert2.github.io/), Bootbox also lacked a clear multi-dialog policy: SweetAlert2 replaces the active popup; Bootbox stacked. Neither matched the desired UX:

1. Do **not** void older dialogs when a new one opens.
2. **Park** the current dialog and show the latest.
3. When the latest is dismissed, **restore** the previous one (and so on).
4. Provide a **dismiss all** path that clears everything with no restore.

Phase 1 kept Bootstrap + jQuery (Bootbox’s identity), added the queue, and improved a11y. It intentionally did **not** add SweetAlert2-style icons, toasts, timers, or a theme engine.

## Behavior overview

```
open dialog A  →  A visible
open dialog B  →  A parked (hidden, kept in DOM) · B visible
dismiss B      →  B destroyed (unless reusable) · A restored
open dialog C  →  A parked · C visible
dismissAll()   →  C and A cleared · nothing restored
```

The stack is **LIFO** (last in, first out): the most recently opened queued dialog is on top; older dialogs wait underneath in order.

| Situation | Result |
|-----------|--------|
| First queued dialog opens | Becomes the active dialog |
| Another queued dialog opens while one is active | Active dialog is **parked** (hidden, not destroyed); new dialog becomes active |
| Top dialog dismissed normally | Destroyed if `reusable` is false; previous parked dialog is **shown** again |
| Callback returns `false` | Top dialog stays open; stack unchanged |
| `hideAll()` / `dismissAll()` | Active + all parked dialogs cleared; **no** restore |
| `queue: false` | Legacy concurrent stacking (no park/restore) |

Parked dialogs keep their DOM, event handlers, and form state (for example, typed prompt values survive park → restore).

## Public API

### Option: `queue` (default `true`)

Available on `setDefaults` and per-dialog options for `alert`, `confirm`, `prompt`, and `dialog`.

```js
// Global (recommended app default)
bootbox.setDefaults({ queue: true });

// Per call
bootbox.alert({ message: 'Hello', queue: true });

// Legacy concurrent Bootstrap stacking
bootbox.alert({ message: 'Side by side', queue: false });
bootbox.setDefaults({ queue: false });
```

### `bootbox.hideAll()` / `bootbox.dismissAll()`

Aliases of the same function. Dismisses the active dialog and every parked dialog, clears the queue, and does **not** restore anything.

```js
bootbox.alert('First');
bootbox.alert('Second'); // parks First
bootbox.dismissAll();    // both gone
```

Non-`reusable` dialogs are removed from the DOM. `reusable: true` dialogs are hidden but left in the DOM (same teardown rules as before, applied across the whole stack).

### `bootbox.clearQueue()`

Clears internal queue pointers (`active` + stack) **without** hiding or destroying dialogs. Useful when host code manages DOM lifecycle itself (for example, test isolation). Prefer `dismissAll()` in application code when you want dialogs gone.

```js
bootbox.clearQueue();
```

## Examples

### Sequential alerts that must all be seen

```js
bootbox.alert('Saved draft');
bootbox.alert('Upload finished'); // parks "Saved draft"
// User dismisses "Upload finished" → "Saved draft" returns
```

### Confirm interrupted by an alert

```js
bootbox.confirm('Delete this item?', function (ok) {
  if (ok) {
    // ...
  }
});

// Later, before the user answers:
bootbox.alert('Connection restored');
// Confirm is parked; after the alert is dismissed, confirm is shown again
```

### Prompt value preserved across park

```js
bootbox.prompt({
  title: 'Your name',
  callback: function (value) { /* ... */ }
});
// User types into the input, then another dialog opens and parks the prompt.
// After the top dialog is dismissed, the prompt returns with the typed value intact.
```

### Dismiss everything

```js
bootbox.dismissAll();
// or
bootbox.hideAll();
```

## Accessibility changes (6.1.0)

| Change | Detail |
|--------|--------|
| `aria-modal="true"` | Set on the root `.bootbox` dialog element |
| `aria-describedby` | Points at the `.bootbox-body` id |
| `aria-labelledby` | Set when a title is present; points at the `.modal-title` id |
| Close button | Keeps `aria-label="Close"`; **removed** conflicting `aria-hidden="true"` |

Focus still moves to the primary accept button on show (and to the prompt input for prompts). Esc handling remains Bootbox-owned (`keyboard: false` on Bootstrap; Esc triggers Bootbox’s escape path on the active dialog).

## What did **not** change

- Still depends on **jQuery** + **Bootstrap** Modal (peer dependencies unchanged).
- Still callback-based (no Promise wrapper in 6.1.0).
- No SweetAlert2-style icons, toasts, timers, progress steps, or mixin theme API.
- Bundle split unchanged (`bootbox.js` / `bootbox.locales.js` / `bootbox.all.js`).

A later major (Phase 2, deferred) may drop jQuery in favor of Bootstrap 5’s native Modal API. The queue registry is designed so that show/hide backend can be swapped later.

## Migration from ≤ 6.0.x

| Before | After (6.1.0 default) |
|--------|------------------------|
| Multiple `.bootbox` modals could be `.show` at once | Only one queued dialog is visible; others are parked |
| `hideAll()` hid every `.bootbox` via Bootstrap | Same intent, but also clears the LIFO stack and tears down parked dialogs without restore |
| Close button had `aria-hidden="true"` | Close button is exposed to assistive tech via `aria-label` |

If an app relied on **two visible Bootbox modals at once**, set:

```js
bootbox.setDefaults({ queue: false });
```

or pass `queue: false` on those calls.

Version bump is **minor** (`6.1.0`) with a changelog callout: default multi-open behavior changes for queued dialogs.

## Implementation notes (for contributors)

Primary source: [`bootbox.js`](../bootbox.js).

- Module-private state: `activeDialog`, `dialogStack`, per-dialog `bb-meta` (`parking`, `dismissAll`, `tracked`).
- `queueAwareShow` parks the current tracked dialog (if any), then shows the new one immediately so callers keep synchronous `modal('show')` semantics.
- Park hides set `meta.parking` so `hide` / `hidden` handlers skip unbind/destroy; final dismiss runs normal teardown then `restoreNext()`.
- `prompt` still builds with `show: false` then calls `queueAwareShow` when it should appear, so prompts participate in the queue.

Tests:

- [`tests/queue.test.js`](../tests/queue.test.js) — park/restore, LIFO depth, dismissAll, `return false`, prompt value, reusable, `queue: false`
- [`tests/helpers/cleanup.js`](../tests/helpers/cleanup.js) — resets `queue` default and `clearQueue()` between specs without deleting shared dialog DOM used by older suites

Verified with Karma against Bootstrap 4 and Bootstrap 5 (`npm test`).

## Related files

| File | Role |
|------|------|
| [`bootbox.js`](../bootbox.js) | Queue + a11y implementation |
| [`CHANGELOG.md`](../CHANGELOG.md) | 6.1.0 release notes |
| [`README.md`](../README.md) | Short latest-release blurb |
| [`tests/queue.test.js`](../tests/queue.test.js) | Queue behavior tests |
| [`dist/bootbox*.js`](../dist/) | Built artifacts |
