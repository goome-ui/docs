---
title: "API: drawing"
---

# API: drawing

Made from `goome.h` 0.5.3 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [drawing](drawing.md).

### goome_clear

```c
void goome_clear(goome_canvas *c);
```

logical coords, the canvas scales them. colors are plain 0xAARRGGBB

### goome_draw_rect

```c
void goome_draw_rect(goome_canvas *c, double x, double y, double w, double h, uint32_t argb);
```

### goome_draw_round_rect

```c
void goome_draw_round_rect(goome_canvas *c, double x, double y, double w, double h, double radius, uint32_t argb);
```

### goome_draw_frame

```c
void goome_draw_frame(goome_canvas *c, double x, double y, double w, double h, double width, uint32_t argb);
```

### goome_draw_line

```c
void goome_draw_line(goome_canvas *c, double x0, double y0, double x1, double y1, double width, uint32_t argb);
```

### goome_draw_triangle

```c
void goome_draw_triangle(goome_canvas *c, double x0, double y0, double x1, double y1, double x2, double y2, uint32_t argb);
```

### goome_draw_image

```c
void goome_draw_image(goome_canvas *c, double x, double y, double w, double h, const uint32_t *img, int iw, int ih);
```

### goome_erase

```c
void goome_erase(goome_canvas *c, double x, double y, double w, double h);
```

### goome_draw_text

```c
double goome_draw_text(goome_canvas *c, double x, double y, const char *s, int big, uint32_t argb);
```

### goome_text_width

```c
double goome_text_width(const goome_canvas *c, const char *s, int big);
```

### goome_set_font

```c
void goome_set_font(int font);
```

### goome_font_count

```c
int goome_font_count(void);
```

### goome_canvas_blit

```c
void goome_canvas_blit(goome_canvas *dst, const goome_canvas *src, double alpha, double dx, double dy);
```

### goome_radius

```c
goome_radii goome_radius(double r);
```

### goome_clip_push

```c
void goome_clip_push(goome_canvas *c, double x, double y, double w, double h);
```

snaps to whole px, 16 deep, `goome_begin` resets it

### goome_clip_pop

```c
void goome_clip_pop(goome_canvas *c);
```

### goome_draw_rrect

```c
void goome_draw_rrect(goome_canvas *c, double x, double y, double w, double h, goome_radii r, uint32_t argb);
```

### goome_draw_rrect_line

```c
void goome_draw_rrect_line(goome_canvas *c, double x, double y, double w, double h, goome_radii r, double width, uint32_t argb);
```

### goome_draw_rrect_grad

```c
void goome_draw_rrect_grad(goome_canvas *c, double x, double y, double w, double h, goome_radii r, uint32_t from, uint32_t to, int sideways);
```

### goome_draw_shadow

```c
void goome_draw_shadow(goome_canvas *c, double x, double y, double w, double h, double radius, double blur, uint32_t argb);
```

blur like css box-shadow

### goome_draw_circle

```c
void goome_draw_circle(goome_canvas *c, double cx, double cy, double r, uint32_t argb);
```

### goome_draw_ring

```c
void goome_draw_ring(goome_canvas *c, double cx, double cy, double r, double width, uint32_t argb);
```

r = middle of the stroke

### goome_draw_arc

```c
void goome_draw_arc(goome_canvas *c, double cx, double cy, double r, double width, double a0, double a1, uint32_t argb);
```

radians, 0 = 3 oclock, clockwise, round caps

### goome_draw_poly

```c
void goome_draw_poly(goome_canvas *c, const double *xy, int n, uint32_t argb);
```

x,y pairs, nonzero fill
