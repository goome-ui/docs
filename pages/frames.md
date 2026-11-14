---
title: Frames, damage and pacing
---

# Frames, damage and pacing

## A frame

```c
goome_canvas *c = goome_begin(g, 0);
if (c) {
    goome_draw_rect(c, 10, 10, 100, 40, 0xC0000000);
    goome_end(g, c, &hit, 1);
}
```

`goome_begin(g, mon)` gives you that monitor's canvas, already cleared. Draw, then `goome_end` sends it with the hit rects. NULL from `goome_begin` means theres nothing to draw on right now (like the monitor just went away), skip the frame. One begin/end per monitor.

Immediate mode, no scene graph. You draw everything every frame, and whatever you dont draw is gone.

## Damage

Draw functions track what they touched (`dx0..dy1` on the canvas). `goome_begin` only wipes what got drawn last time (`cx0..cy1`) and `goome_end` only uploads the union of both. A small HUD on a 5120x1440 screen moves a few KB.

If you write `c->px` yourself tell goome:

```c
c->px[y * c->stride + x] = 0xFFFF0000;
goome_damage(c, &(goome_rect){x0, y0, w, h});
goome_damage(c, NULL);
```

A logical rect marks that area, NULL the whole canvas. Pixels are premultiplied ARGB, half see-through red is `0x80800000` not `0x80FF0000`.

## Pacing

Only draw when something changed or the UI is still animating.

```c
goome_pacer pace = {0};
for (;;) {
    int wait = goome_pace(&pace, 60);
    while (goome_poll(g, &ev, wait) > 0) {
        handle(&ev);
        wait = goome_pace(&pace, 60);
    }
    draw();
}
```

`goome_pace(&p, fps)` returns ms until the next frame is due, 0 if its due now. Use it as the poll timeout and you sleep in poll until an event or draw time. If you fall way behind it doesnt catch up, just restarts from now.

Mostly idle app, wait longer when nothing moves:

```c
int wait = dirty || goome_ui_animating(u) ? goome_pace(&pace, 60) : 500;
```

`examples/ui.c` does that and sits at almost 0% CPU until you touch it.

## Reading back a frame <kbd>0.3</kbd>

`goome_frame(g, &img)` gives the pixels the last `goome_end` sent ([what they look like](offscreen-mode.md#the-pixels)). Window mode, [offscreen mode](offscreen-mode.md) and the test backend. Good until the next `goome_begin`.
