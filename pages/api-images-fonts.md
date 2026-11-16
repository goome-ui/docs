---
title: "API: images and fonts"
---

# API: images and fonts

Made from `goome.h` 0.5.0 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [images fonts](images-fonts.md).

### goome_bitmap_load

```c
int goome_bitmap_load(const char *path, goome_bitmap *out);
```

png, jpeg, bmp, ppm, qoi. picks by content, not name

### goome_bitmap_load_mem

```c
int goome_bitmap_load_mem(const void *data, size_t n, goome_bitmap *out);
```

### goome_bitmap_error

```c
const char *goome_bitmap_error(void);
```

why the last load failed

### goome_bitmap_from_argb

```c
int goome_bitmap_from_argb(const uint32_t *argb, int w, int h, goome_bitmap *out);
```

plain argb in, copied

### goome_bitmap_free

```c
void goome_bitmap_free(goome_bitmap *b);
```

### goome_draw_bitmap

```c
void goome_draw_bitmap(goome_canvas *c, const goome_bitmap *b, double x, double y, double w, double h, goome_radii r, uint32_t tint);
```

### goome_draw_bitmap_part

```c
void goome_draw_bitmap_part(goome_canvas *c, const goome_bitmap *b, int sx, int sy, int sw, int sh, double x, double y, double w, double h, uint32_t tint);
```

### goome_draw_bitmap_nine <kbd>0.2</kbd>

```c
void goome_draw_bitmap_nine(goome_canvas *c, const goome_bitmap *b, double x, double y, double w, double h, double l, double t, double r, double bm);
```

l t r bm = border sizes in bitmap px

### goome_font_load

```c
goome_font *goome_font_load(const char *path);
```

.ttf .otf .ttc

### goome_font_load_index

```c
goome_font *goome_font_load_index(const char *path, int index);
```

face in a .ttc, fontconfig hands these out

### goome_font_load_mem

```c
goome_font *goome_font_load_mem(const void *data, size_t n, int copy);
```

### goome_font_system

```c
goome_font *goome_font_system(const char *name);
```

NULL = the desktops usual ui font

### goome_font_free

```c
void goome_font_free(goome_font *f);
```

### goome_text

```c
double goome_text(goome_canvas *c, goome_font *f, double size, double x, double y, const char *utf8, uint32_t argb);
```

y = top, NULL font = built in

### goome_text_measure

```c
double goome_text_measure(goome_font *f, double size, const char *utf8, double *height);
```

### goome_text_line_height

```c
double goome_text_line_height(goome_font *f, double size);
```

### goome_font_fallback <kbd>0.5</kbd>

```c
void goome_font_fallback(goome_font *f, goome_font *fallback);
```

tried in order for chars f doesnt have, f doesnt free it. `goome_font_system` adds the emoji font by itself

### goome_text_dir <kbd>0.5</kbd>

```c
void goome_text_dir(int dir);
```

paragraph direction for all text, AUTO = from the first strong letter of each line
