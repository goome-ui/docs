---
title: "API: styles and custom widgets"
---

# API: styles and custom widgets

Made from `goome.h` 0.5.3 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [ui custom](ui-custom.md).

### goome_ui_pos <kbd>0.3</kbd>

```c
void goome_ui_pos(goome_ui *u, double x, double y);
```

next widget goes at x,y from the content top left (scroll included), the flow doesnt move

### goome_ui_size <kbd>0.3</kbd>

```c
void goome_ui_size(goome_ui *u, double w, double h);
```

next widget size, 0 = its own size for that side

### goome_ui_push_color <kbd>0.3</kbd>

```c
void goome_ui_push_color(goome_ui *u, int what, uint32_t argb);
```

`GOOME_S_` color fields

### goome_ui_push_num <kbd>0.3</kbd>

```c
void goome_ui_push_num(goome_ui *u, int what, double v);
```

`GOOME_S_RADIUS` and the other numbers

### goome_ui_push_radii <kbd>0.3</kbd>

```c
void goome_ui_push_radii(goome_ui *u, goome_radii r);
```

per corner, beats `GOOME_S_RADIUS` until popped

### goome_ui_push_font <kbd>0.3</kbd>

```c
void goome_ui_push_font(goome_ui *u, goome_font *f);
```

NULL = built in

### goome_ui_push_skin <kbd>0.3</kbd>

```c
void goome_ui_push_skin(goome_ui *u, int kind, const goome_skin *s);
```

`GOOME_SKIN_*`, NULL = no skin

### goome_ui_push_theme <kbd>0.3</kbd>

```c
void goome_ui_push_theme(goome_ui *u, const goome_theme *t);
```

a whole theme, one push

### goome_ui_pop <kbd>0.3</kbd>

```c
void goome_ui_pop(goome_ui *u, int n);
```

pops the last n pushes of any kind

### goome_ui_custom <kbd>0.3</kbd>

```c
int goome_ui_custom(goome_ui *u, const char *id, double w, double h, int flags, goome_ui_item *it);
```

DRAG_X or DRAG_Y alone locks that axis, 1 = something happened

### goome_ui_canvas <kbd>0.3</kbd>

```c
goome_canvas *goome_ui_canvas(goome_ui *u);
```

`goome_draw_*` on it lands in the ui right here, clipped like the widgets

### goome_ui_store <kbd>0.3</kbd>

```c
double *goome_ui_store(goome_ui *u, const char *id, int n);
```

n doubles kept per id, zero the first time
