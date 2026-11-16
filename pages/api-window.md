---
title: "API: windows, cursor and clipboard"
---

# API: windows, cursor and clipboard

Made from `goome.h` 0.5.0 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [window mode](window-mode.md).

### goome_window_title <kbd>0.2</kbd>

```c
int goome_window_title(goome *g, const char *title);
```

### goome_window_size <kbd>0.2</kbd>

```c
int goome_window_size(goome *g, int w, int h);
```

logical client size

### goome_window_pos <kbd>0.2</kbd>

```c
int goome_window_pos(goome *g, int *x, int *y, int set);
```

`set=1` moves it, 0 reads it. ENOTSUP where the os wont say (wayland)

### goome_window_state <kbd>0.2</kbd>

```c
int goome_window_state(goome *g, int state);
```

`GOOME_STATE_*`

### goome_window_get_state <kbd>0.2</kbd>

```c
int goome_window_get_state(goome *g);
```

### goome_window_drag <kbd>0.2</kbd>

```c
int goome_window_drag(goome *g, int edges);
```

native move (0) or resize (`GOOME_EDGE_*` bits) from the press happening now

### goome_window_show <kbd>0.2</kbd>

```c
int goome_window_show(goome *g, int on);
```

### goome_cursor <kbd>0.2</kbd>

```c
int goome_cursor(goome *g, int shape);
```

### goome_cursor_shape <kbd>0.2</kbd>

```c
int goome_cursor_shape(goome *g);
```

last one asked for, offscreen embedders read this

### goome_clipboard_set <kbd>0.2</kbd>

```c
int goome_clipboard_set(goome *g, const char *utf8);
```

### goome_clipboard_get <kbd>0.2</kbd>

```c
int goome_clipboard_get(goome *g, char *buf, int cap);
```

full length (can be > cap-1, buf gets cut + nul), <0 error. can block ~250ms on x11/wayland

### goome_drop_path <kbd>0.2</kbd>

```c
const char *goome_drop_path(goome *g);
```

full path of the last `GOOME_DROP`, good until the next poll
