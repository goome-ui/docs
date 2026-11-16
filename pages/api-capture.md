---
title: "API: capture and hotkeys"
---

# API: capture and hotkeys

Made from `goome.h` 0.5.2 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [capture](capture.md).

### goome_capture

```c
int goome_capture(goome *g, int mon, const goome_rect *r, goome_image *img);
```

### goome_alpha_at

```c
int goome_alpha_at(goome *g, double x, double y);
```

### goome_hotkey

```c
int goome_hotkey(goome *g, const char *combo, int id);
```

### goome_parse_combo

```c
int goome_parse_combo(const char *combo, int *key, int *mods);
```

### goome_control_path

```c
const char *goome_control_path(goome *g);
```

### goome_send

```c
int goome_send(const char *state_dir, const char *msg);
```
