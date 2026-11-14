---
title: Offscreen mode
---

# Offscreen mode <kbd>0.2</kbd>

For Unity, Godot and the like, or rendering on a box with no screen. No OS window, no desktop library, no thread, never blocks. goome draws into a pixel buffer, you push input with `goome_push`, read the frame with `goome_frame` and upload it wherever (usually a texture).

```c
goome *g = goome_open(&(goome_opts){.mode = GOOME_MODE_OFFSCREEN, .width = 640, .height = 400, .scale = 2}, NULL);
```

The buffer is `width` x `height` logical px at `scale` (0 means 1), so that one is 1280x800 real px. `GOOME_BACKEND=offscreen` picks it too, and `goome_backend_name` says `offscreen`.

## A frame

```c
goome_event in = {.type = GOOME_DOWN, .x = 120, .y = 80, .button = 1};
goome_push(g, &in);

goome_event ev;
while (goome_poll(g, &ev, 0) > 0) goome_ui_feed(u, &ev);

if (goome_ui_begin(u, 0)) {
    if (goome_ui_window(u, "Settings", &x, &y, &w, &h, GOOME_WIN_MOVE, NULL))
        goome_ui_slider(u, "Volume", &volume, 0, 1, "%.2f");
    goome_ui_window_end(u);
    goome_ui_end(u);
}

goome_image img;
if (goome_frame(g, &img) == GOOME_OK)
    upload_texture(img.px, img.w, img.h, img.stride);
```

`goome_poll` gives back what you pushed plus whatever goome queued itself (like `GOOME_MONITORS` after a resize). Use 0 as the timeout from an engine, it never waits longer than you say.

## The pixels

`goome_frame` is the last frame `goome_end` sent.

px is **premultiplied** ARGB, not the `0xFF...` you get from screen grabs, so draw the texture with a premultiplied alpha blend. Its only good until the next `goome_begin`. Rows go top to bottom and most engines want bottom up, flip the quad or the UVs. On little endian each pixel is `B G R A` in memory, so `BGRA32` style formats take it as is.

Works in window mode and on the test backend too, good for tests.

## Input

Build `goome_event`s and push them. Coords are logical px from the buffer's top left.

| What happened | Push this |
|:--|:--|
| mouse moved | `GOOME_MOTION` with `x`, `y` |
| button pressed / released | `GOOME_DOWN` / `GOOME_UP` with `x`, `y`, `button` (1 left, 2 middle, 3 right) |
| wheel | `GOOME_SCROLL` with `x`, `y`, `dy` (+1 is one notch down) |
| key | `GOOME_KEY` with `key` (lowercase ascii or `GOOME_K_*`), `mods`, and the typed utf-8 in `text` |
| window lost focus | `GOOME_FOCUS` with `id = 0` |

`goome_push` works in every mode too, for scripting your app or sending yourself custom events.

## Size, cursor and clipboard

`goome_resize(g, w, h, scale)` changes the buffer size and queues `GOOME_MONITORS`, call it when the engine's view resizes.

`goome_cursor_shape(g)` is the cursor the UI kit wants right now. Copy it to your engine's cursor if you show one.

Theres no real clipboard here, just a string goome holds. On ctrl+v put the engine's clipboard in with `goome_clipboard_set` first, after a copy read it with `goome_clipboard_get` and give it to the engine.

## Unity and friends

[Getting started in Unity](start-unity.md) has a whole MonoBehaviour. Game mods and other engines have their own section, [Mods and engines](mods.md). `goome_frame_dirty` and `goome_frame_copy` there only copy what changed.
