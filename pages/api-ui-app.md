---
title: "API: ui app, menus and popups"
---

# API: ui app, menus and popups

Made from `goome.h` 0.5.5 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [ui app](ui-app.md).

### goome_ui_app <kbd>0.2</kbd>

```c
int goome_ui_app(goome_ui *u, const char *title, int flags);
```

root panel filling monitor 0, after `goome_ui_begin`

### goome_ui_app_end <kbd>0.2</kbd>

```c
void goome_ui_app_end(goome_ui *u);
```

### goome_ui_menubar_begin <kbd>0.2</kbd>

```c
int goome_ui_menubar_begin(goome_ui *u);
```

### goome_ui_menubar_end <kbd>0.2</kbd>

```c
void goome_ui_menubar_end(goome_ui *u);
```

### goome_ui_menu_begin <kbd>0.2</kbd>

```c
int goome_ui_menu_begin(goome_ui *u, const char *label);
```

1 = open, nest for submenus

### goome_ui_menu_end <kbd>0.2</kbd>

```c
void goome_ui_menu_end(goome_ui *u);
```

### goome_ui_menu_item <kbd>0.2</kbd>

```c
int goome_ui_menu_item(goome_ui *u, const char *label, const char *shortcut, int *checked);
```

1 = clicked, checked can be NULL

### goome_ui_menu_separator <kbd>0.2</kbd>

```c
void goome_ui_menu_separator(goome_ui *u);
```

### goome_ui_context_begin <kbd>0.2</kbd>

```c
int goome_ui_context_begin(goome_ui *u, const char *id);
```

right click on the widget before it (or empty space) opens it

### goome_ui_context_end <kbd>0.2</kbd>

```c
void goome_ui_context_end(goome_ui *u);
```

### goome_ui_popup_open <kbd>0.2</kbd>

```c
void goome_ui_popup_open(goome_ui *u, const char *id);
```

### goome_ui_popup_begin <kbd>0.2</kbd>

```c
int goome_ui_popup_begin(goome_ui *u, const char *id);
```

### goome_ui_popup_end <kbd>0.2</kbd>

```c
void goome_ui_popup_end(goome_ui *u);
```

### goome_ui_popup_close <kbd>0.2</kbd>

```c
void goome_ui_popup_close(goome_ui *u);
```

closes the innermost open popup, menu or modal

### goome_ui_modal_begin <kbd>0.2</kbd>

```c
int goome_ui_modal_begin(goome_ui *u, const char *title, int *open);
```

centered, dims the rest, esc closes

### goome_ui_modal_end <kbd>0.2</kbd>

```c
void goome_ui_modal_end(goome_ui *u);
```

### goome_ui_toast <kbd>0.2</kbd>

```c
void goome_ui_toast(goome_ui *u, const char *text, int ms);
```

### goome_ui_statusbar <kbd>0.2</kbd>

```c
void goome_ui_statusbar(goome_ui *u, const char *text);
```

with `GOOME_APP_STATUSBAR`

### goome_ui_focused <kbd>0.2</kbd>

```c
int goome_ui_focused(goome_ui *u);
```

the widget right before it has keyboard focus

### goome_ui_set_focus <kbd>0.2</kbd>

```c
void goome_ui_set_focus(goome_ui *u);
```

focus goes to the next widget
