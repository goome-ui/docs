---
title: The three modes
---

# The three modes

Since 0.2. Pick one with `goome_opts.mode` when you open. Drawing and UI code is the same in all three, just the pixels end up somewhere else.

| Mode | What you get | Good for |
|:--|:--|:--|
| `GOOME_MODE_OVERLAY` | a see-through layer over every monitor, only hit rects take clicks | HUDs, stream widgets, game overlays, desktop tools |
| `GOOME_MODE_WINDOW` <kbd>0.2</kbd> | one normal window with a title bar, resizable, movable, minimizable | small apps, anything you'd have used WinForms for |
| `GOOME_MODE_OFFSCREEN` <kbd>0.2</kbd> | no OS window, just a pixel buffer you read | Unity, Godot, your own engine, rendering on a server |

Overlay is `0`, so zeroed `goome_opts` works like 0.1 did.

```c
goome *g = goome_open(&(goome_opts){.title = "notes", .mode = GOOME_MODE_WINDOW, .width = 800, .height = 600}, NULL);
```

`goome_mode(g)` says which one you got. In Java its `new Options().mode(Goome.MODE_WINDOW)` and `g.mode()`.

## What stays the same

`goome_begin`, draw, `goome_end`, `goome_poll`, and the UI kit. A window resize is a `GOOME_MONITORS` like any monitor change.

## What changes

| | Overlay | Window | Offscreen |
|:--|:--|:--|:--|
| monitors | every real monitor | one, the window's client area at 0,0 | one, your buffer at 0,0 |
| who gets clicks | only your hit rects | the whole window | whatever you `goome_push` |
| keyboard | only after `goome_keyboard(g, 1)` | always while focused | whatever you push |
| hotkeys and capture | yes | yes | no |
| `goome_frame` | no | yes | yes |

- [Overlay mode](overlay-mode.md)
- [Window mode](window-mode.md) <kbd>0.2</kbd>
- [Offscreen mode](offscreen-mode.md) <kbd>0.2</kbd>

Window mode apps can also [run in the browser](browser.md) <kbd>0.5.2</kbd>, compiled to webassembly.
