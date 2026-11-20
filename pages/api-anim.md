---
title: "API: animations"
---

# API: animations

Made from `goome.h` 0.5.5 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [animations](animations.md).

### goome_ui_animating

```c
int goome_ui_animating(goome_ui *u);
```

1 while something still moves, draw again soon

### goome_ease <kbd>0.5</kbd>

```c
double goome_ease(int ease, double t);
```

### goome_ui_anim <kbd>0.5</kbd>

```c
double goome_ui_anim(goome_ui *u, const char *id, double target, double ms, int ease);
```

### goome_ui_anim_color <kbd>0.5</kbd>

```c
uint32_t goome_ui_anim_color(goome_ui *u, const char *id, uint32_t target, double ms, int ease);
```
