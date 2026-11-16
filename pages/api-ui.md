---
title: "API: ui kit"
---

# API: ui kit

Made from `goome.h` 0.5.0 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [ui](ui.md).

### goome_ui_new

```c
goome_ui *goome_ui_new(goome *g);
```

### goome_ui_free

```c
void goome_ui_free(goome_ui *u);
```

### goome_ui_theme

```c
goome_theme *goome_ui_theme(goome_ui *u);
```

### goome_ui_theme_dark

```c
void goome_ui_theme_dark(goome_theme *t);
```

leaves font alone

### goome_ui_theme_light

```c
void goome_ui_theme_light(goome_theme *t);
```

### goome_ui_feed

```c
int goome_ui_feed(goome_ui *u, const goome_event *ev);
```

1 if the ui used it

### goome_ui_begin

```c
goome_canvas *goome_ui_begin(goome_ui *u, int mon);
```

NULL = nothing to draw on, skip the frame

### goome_ui_end

```c
void goome_ui_end(goome_ui *u);
```

sends the frame with every widgets hit area

### goome_ui_hit

```c
void goome_ui_hit(goome_ui *u, double x, double y, double w, double h);
```

### goome_ui_window

```c
int goome_ui_window(goome_ui *u, const char *title, double *x, double *y, double *w, double *h, int flags, int *open);
```

### goome_ui_window_end

```c
void goome_ui_window_end(goome_ui *u);
```

### goome_ui_row

```c
void goome_ui_row(goome_ui *u, int cols);
```

### goome_ui_same_line

```c
void goome_ui_same_line(goome_ui *u);
```

### goome_ui_space

```c
void goome_ui_space(goome_ui *u, double px);
```

### goome_ui_separator

```c
void goome_ui_separator(goome_ui *u);
```

### goome_ui_width

```c
void goome_ui_width(goome_ui *u, double w);
```

next widget, 0 = fill

### goome_ui_label

```c
void goome_ui_label(goome_ui *u, const char *fmt, ...);
```

### goome_ui_heading

```c
void goome_ui_heading(goome_ui *u, const char *text);
```

### goome_ui_wrapped

```c
void goome_ui_wrapped(goome_ui *u, const char *text);
```

### goome_ui_button

```c
int goome_ui_button(goome_ui *u, const char *label);
```

### goome_ui_image_button

```c
int goome_ui_image_button(goome_ui *u, const char *id, const goome_bitmap *b, double w, double h);
```

### goome_ui_image

```c
void goome_ui_image(goome_ui *u, const goome_bitmap *b, double w, double h, double radius);
```

### goome_ui_checkbox

```c
int goome_ui_checkbox(goome_ui *u, const char *label, int *v);
```

### goome_ui_toggle

```c
int goome_ui_toggle(goome_ui *u, const char *label, int *v);
```

### goome_ui_radio

```c
int goome_ui_radio(goome_ui *u, const char *label, int *v, int value);
```

### goome_ui_slider

```c
int goome_ui_slider(goome_ui *u, const char *label, double *v, double min, double max, const char *fmt);
```

### goome_ui_slider_int

```c
int goome_ui_slider_int(goome_ui *u, const char *label, int *v, int min, int max);
```

### goome_ui_input

```c
int goome_ui_input(goome_ui *u, const char *label, char *buf, int cap);
```

### goome_ui_combo

```c
int goome_ui_combo(goome_ui *u, const char *label, int *sel, const char *const *items, int n);
```

### goome_ui_selectable

```c
int goome_ui_selectable(goome_ui *u, const char *label, int selected);
```

### goome_ui_tabs

```c
int goome_ui_tabs(goome_ui *u, const char *id, const char *const *names, int n, int *sel);
```

### goome_ui_collapsing

```c
int goome_ui_collapsing(goome_ui *u, const char *label, int *open);
```

### goome_ui_progress

```c
void goome_ui_progress(goome_ui *u, double frac, const char *text);
```

### goome_ui_color

```c
int goome_ui_color(goome_ui *u, const char *label, uint32_t *argb);
```

### goome_ui_tooltip

```c
void goome_ui_tooltip(goome_ui *u, const char *text);
```

for the widget right before it

### goome_ui_hovered

```c
int goome_ui_hovered(goome_ui *u);
```

the widget right before it

### goome_ui_scroll_begin

```c
int goome_ui_scroll_begin(goome_ui *u, const char *id, double h);
```

always call scroll_end

### goome_ui_scroll_end

```c
void goome_ui_scroll_end(goome_ui *u);
```

### goome_ui_push_id

```c
void goome_ui_push_id(goome_ui *u, const char *id);
```

same labels in a loop, push the index first

### goome_ui_pop_id

```c
void goome_ui_pop_id(goome_ui *u);
```

### goome_ui_theme_make <kbd>0.3</kbd>

```c
void goome_ui_theme_make(goome_theme *t, uint32_t accent, int dark, double radius);
```

### goome_ui_theme_preset <kbd>0.3</kbd>

```c
int goome_ui_theme_preset(goome_theme *t, int preset);
```
