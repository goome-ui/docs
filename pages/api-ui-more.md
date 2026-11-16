---
title: "API: more ui widgets"
---

# API: more ui widgets

Made from `goome.h` 0.5.0 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [ui tables](ui-tables.md).

### goome_ui_input_ex <kbd>0.3</kbd>

```c
int goome_ui_input_ex(goome_ui *u, const char *label, char *buf, int cap, int flags, const char *hint);
```

### goome_ui_text_edit <kbd>0.2</kbd>

```c
int goome_ui_text_edit(goome_ui *u, const char *id, char *buf, int cap, double h, int flags);
```

multiline, `GOOME_EDIT_*`, 1 = changed

### goome_ui_table_begin <kbd>0.2</kbd>

```c
int goome_ui_table_begin(goome_ui *u, const char *id, int cols, double h, int flags);
```

`GOOME_TABLE_*`

### goome_ui_table_column <kbd>0.2</kbd>

```c
void goome_ui_table_column(goome_ui *u, const char *name, double width);
```

0 = share the rest

### goome_ui_table_sort <kbd>0.2</kbd>

```c
int goome_ui_table_sort(goome_ui *u, int *col, int *desc);
```

1 = sort changed this frame, after the columns

### goome_ui_table_row <kbd>0.2</kbd>

```c
void goome_ui_table_row(goome_ui *u);
```

### goome_ui_table_next <kbd>0.2</kbd>

```c
void goome_ui_table_next(goome_ui *u);
```

### goome_ui_table_end <kbd>0.2</kbd>

```c
void goome_ui_table_end(goome_ui *u);
```

### goome_ui_tree <kbd>0.2</kbd>

```c
int goome_ui_tree(goome_ui *u, const char *label, int *open);
```

1 = open, then `goome_ui_tree_end`

### goome_ui_tree_end <kbd>0.2</kbd>

```c
void goome_ui_tree_end(goome_ui *u);
```

### goome_ui_list_clip <kbd>0.2</kbd>

```c
int goome_ui_list_clip(goome_ui *u, int count, double row_h, int *first, int *last);
```

in a scroll area, only draw first..last

### goome_ui_drag_float <kbd>0.2</kbd>

```c
int goome_ui_drag_float(goome_ui *u, const char *label, double *v, double speed, double min, double max, const char *fmt);
```

### goome_ui_drag_int <kbd>0.2</kbd>

```c
int goome_ui_drag_int(goome_ui *u, const char *label, int *v, double speed, int min, int max);
```

### goome_ui_number <kbd>0.2</kbd>

```c
int goome_ui_number(goome_ui *u, const char *label, double *v, double step, const char *fmt);
```

### goome_ui_plot_lines <kbd>0.2</kbd>

```c
void goome_ui_plot_lines(goome_ui *u, const char *label, const float *v, int n, double min, double max, double h);
```

### goome_ui_plot_bars <kbd>0.2</kbd>

```c
void goome_ui_plot_bars(goome_ui *u, const char *label, const float *v, int n, double min, double max, double h);
```

### goome_ui_split_begin <kbd>0.2</kbd>

```c
int goome_ui_split_begin(goome_ui *u, const char *id, int vertical, double *frac);
```

### goome_ui_split_next <kbd>0.2</kbd>

```c
void goome_ui_split_next(goome_ui *u);
```

### goome_ui_split_end <kbd>0.2</kbd>

```c
void goome_ui_split_end(goome_ui *u);
```

### goome_ui_drag_source <kbd>0.2</kbd>

```c
int goome_ui_drag_source(goome_ui *u, const char *type, const void *data, int len);
```

the widget before it can be dragged

### goome_ui_drop_target <kbd>0.2</kbd>

```c
int goome_ui_drop_target(goome_ui *u, const char *type, void *buf, int cap);
```

widget before it, bytes dropped or 0

### goome_ui_spinner <kbd>0.2</kbd>

```c
void goome_ui_spinner(goome_ui *u, double size);
```

### goome_ui_link <kbd>0.2</kbd>

```c
int goome_ui_link(goome_ui *u, const char *text);
```

1 = clicked

### goome_ui_badge <kbd>0.2</kbd>

```c
void goome_ui_badge(goome_ui *u, const char *text, uint32_t argb);
```

### goome_ui_push_icon <kbd>0.3</kbd>

```c
void goome_ui_push_icon(goome_ui *u, int icon, const goome_bitmap *b);
```

### goome_ui_scale <kbd>0.3</kbd>

```c
void goome_ui_scale(goome_ui *u, double s);
```

### goome_ui_cfg <kbd>0.3</kbd>

```c
goome_ui_config *goome_ui_cfg(goome_ui *u);
```

### goome_ui_config_default <kbd>0.3</kbd>

```c
void goome_ui_config_default(goome_ui_config *c);
```

### goome_ui_bind <kbd>0.3</kbd>

```c
int goome_ui_bind(goome_ui *u, int act, const char *combos);
```
