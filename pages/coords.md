---
title: Coords and monitors
---

# Coords and monitors

## Everything is logical

Every position going in or out of goome is logical desktop coords. A 4K screen at 200% is 1920x1080 logical, and a 100 wide box is 100 logical px at any scaling. goome does the real pixels.

Draw calls, hit rects, event `x` / `y`, `goome_pointer`, capture rects, monitor areas, all logical.

## Monitors

```c
goome_monitor mons[16];
int n = goome_monitors(g, mons, 16);
for (int i = 0; i < n; i++)
    printf("%s %dx%d at %d,%d scale %.2f\n", mons[i].name, mons[i].area.w, mons[i].area.h, mons[i].area.x, mons[i].area.y, mons[i].scale);
```

| Field | What |
|:--|:--|
| `id` | the monitor's index, what you pass to `goome_begin` and `goome_capture` |
| `name` | what the OS calls it, like `DP-1` |
| `area` | where it sits on the desktop, logical |
| `scale` | real px per logical px, like 1, 1.25 or 2 |
| `pw`, `ph` | its real size in px |
| `rotation` | 0, 90, 180 or 270, plus 360 if mirrored. Canvases and grabs already undo it, you never have to |

Monitor 0 is the primary one, if the OS says which.

Plugging, unplugging or a scale change gives you a `GOOME_MONITORS` event. Call `goome_monitors` again and move your stuff off any screen thats gone.

## Canvases carry the scale

`goome_begin(g, mon)` gives you that monitor's `goome_canvas`. Pixels are real px, plus `ox`, `oy` (logical spot of `px[0]`) and `scale`. Draw functions take logical coords and handle it.

Writing `c->px` yourself: logical `x` is real column `(x - c->ox) * c->scale`, and `stride` is in pixels not bytes.

## Text width

Use `goome_text_width` on the canvas you draw on. Past scale 1.75 the built in font doubles so width / scale is wrong.

## In window and offscreen mode <kbd>0.2</kbd>

One monitor, your window or buffer, `area` is `{0, 0, w, h}`. Event coords start at its top left. Resizes come as `GOOME_MONITORS`.
