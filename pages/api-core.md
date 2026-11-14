---
title: "API: open, poll and frames"
---

# API: open, poll and frames

Made from `goome.h` 0.2.0 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [frames](frames.md).

### goome_open

```c
goome *goome_open(const goome_opts *o, int *err);
```

### goome_open_app <kbd>0.2</kbd>

```c
goome *goome_open_app(const char *title, int w, int h, int *err);
```

a normal resizable window, centered

### goome_close

```c
void goome_close(goome *g);
```

### goome_error

```c
const char *goome_error(goome *g);
```

### goome_strerror

```c
const char *goome_strerror(int err);
```

### goome_backend_name

```c
const char *goome_backend_name(goome *g);
```

### goome_caps

```c
int goome_caps(goome *g);
```

### goome_monitors

```c
int goome_monitors(goome *g, goome_monitor *out, int max);
```

### goome_begin

```c
goome_canvas *goome_begin(goome *g, int mon);
```

### goome_end

```c
int goome_end(goome *g, goome_canvas *c, const goome_rect *hits, int nhits);
```

### goome_damage

```c
void goome_damage(goome_canvas *c, const goome_rect *r);
```

### goome_poll

```c
int goome_poll(goome *g, goome_event *ev, int timeout_ms);
```

### goome_pointer

```c
int goome_pointer(goome *g, double *x, double *y, int *buttons);
```

### goome_keyboard

```c
int goome_keyboard(goome *g, int on);
```

### goome_pace

```c
int goome_pace(goome_pacer *p, int fps);
```

### goome_now_ms

```c
long goome_now_ms(void);
```

### goome_mode <kbd>0.2</kbd>

```c
int goome_mode(goome *g);
```

### goome_push <kbd>0.2</kbd>

```c
int goome_push(goome *g, const goome_event *ev);
```

queue an event, any mode

### goome_resize <kbd>0.2</kbd>

```c
int goome_resize(goome *g, int w, int h, double scale);
```

offscreen only

### goome_frame <kbd>0.2</kbd>

```c
int goome_frame(goome *g, goome_image *out);
```

last frame `goome_end` sent, px = premultiplied argb, good until the next `goome_begin`

### goome_hit <kbd>0.2</kbd>

```c
int goome_hit(goome *g, double x, double y);
```

1 if x,y is in the hit rects of the last `goome_end`

### goome_frame_dirty <kbd>0.3</kbd>

```c
int goome_frame_dirty(goome *g, goome_rect *r);
```

real px rect that changed since the last call, 0 = nothing, 1 = r filled. first one after open/resize is the whole frame

### goome_frame_copy <kbd>0.3</kbd>

```c
int goome_frame_copy(goome *g, void *dst, int dst_stride_bytes, int format, const goome_rect *r);
```

copy r (real px, NULL = whole) of the last frame, dst = r's top left

### goome_save_ppm

```c
int goome_save_ppm(const char *path, const uint32_t *px, int w, int h, int stride);
```
