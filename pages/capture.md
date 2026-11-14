---
title: Screen capture
---

# Screen capture

```c
goome_image img;
int e = goome_capture(g, 0, NULL, &img);
if (e == GOOME_OK) goome_save_ppm("screen.ppm", img.px, img.w, img.h, img.stride);
```

```csharp
if (g.TryCapture(0, null, out var img) == GoomeError.Ok)
    Goome.SavePpm("screen.ppm", img);
```

```python
img = g.capture_wait(0)
img.save_ppm("screen.ppm")
```

```java
Image img = g.captureWait(0, null, 50, 100);
img.savePpm("screen.ppm");
```

`goome_capture(g, mon, rect, &img)` grabs a monitor, or a rect of it if `rect` isnt NULL (logical coords). Pixels always come out `0xFFRRGGBB`.

## The image

| Field | What |
|:--|:--|
| `px` | the pixels, goome owns them. Good until you grab that monitor again |
| `w`, `h`, `stride` | real px, stride in pixels |
| `area`, `mon` | what got grabbed, logical |
| `has_self` | our own overlay is in it |
| `has_cursor`, `cursor` | the mouse got baked in, and where |

Java has the same fields on `Image` in camelCase (`img.hasSelf`). Using an `Image` after a newer grab of that monitor throws `GoomeException.Gone`, `img.copy()` keeps the pixels.

## Try again

GNOME and the portal stream the screen in the background, so the first grab right after opening can be `GOOME_EAGAIN`:

```c
int e = GOOME_EAGAIN;
for (int tries = 0; tries < 50 && e == GOOME_EAGAIN; tries++) {
    e = goome_capture(g, 0, NULL, &img);
    if (e == GOOME_EAGAIN) goome_poll(g, &ev, 100);
}
```

Same as `examples/grab.c`. Pythons `capture_wait` and Javas `captureWait(mon, rect, tries, waitMs)` already do this. Javas plain `capture` throws `GoomeException.Again` instead.

## Your own overlay in the grab

On Linux your overlay is in your own grabs. `img.has_self` tells you, and `goome_alpha_at(g, x, y)` gives how see-through it is at a spot if you want to mask it out.

On Windows (build 19041+) and Mac set `hide_self = 1` in `goome_opts` and the OS leaves it out. Check `GOOME_CAP_HIDE_SELF`.

## Permissions

- GNOME never shows a popup, goome asks mutter directly.
- KDE, COSMIC and Cinnamon show a "share your screen" dialog on the first grab. Set `state_dir` and the answer gets saved so it only asks once.
- macOS needs Screen Recording for whatever app starts yours (terminal, IDE).
- Windows and X11 dont ask.

Capture only starts on the first grab, so an overlay that never grabs never gets a popup. `no_capture = 1` turns it off completely.

Check `goome_caps(g) & GOOME_CAP_CAPTURE` before counting on it.
