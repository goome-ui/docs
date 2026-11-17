---
title: "API: input capture"
---

# API: input capture

Made from `goome.h` 0.5.3 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [input capture](input-capture.md).

### goome_grab <kbd>0.3</kbd>

```c
int goome_grab(goome *g, int on);
```

overlay: focus + pointer capture until `goome_grab`(g, 0). window: drags keep going outside it

### goome_grabbed <kbd>0.3</kbd>

```c
int goome_grabbed(goome *g);
```

### goome_ui_wants <kbd>0.3</kbd>

```c
int goome_ui_wants(goome_ui *u);
```

`GOOME_WANT_*` bits, good after `goome_ui_feed` and `goome_ui_end`

### goome_ui_auto_grab <kbd>0.3</kbd>

```c
void goome_ui_auto_grab(goome_ui *u, int wants);
```

what the ui takes from the os by itself, default both, 0 = the app does it
