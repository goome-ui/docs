---
title: "API: accessibility"
---

# API: accessibility

Made from `goome.h` 0.5.2 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [accessibility](accessibility.md).

### goome_ui_a11y <kbd>0.5</kbd>

```c
void goome_ui_a11y(goome_ui *u, int on);
```

### goome_ui_a11y_role <kbd>0.5</kbd>

```c
void goome_ui_a11y_role(goome_ui *u, int role, const char *label);
```

### goome_ui_a11y_value <kbd>0.5</kbd>

```c
void goome_ui_a11y_value(goome_ui *u, const char *value);
```

### goome_a11y_tree <kbd>0.5</kbd>

```c
int goome_a11y_tree(goome_ui *u, goome_a11y_node *out, int max);
```
