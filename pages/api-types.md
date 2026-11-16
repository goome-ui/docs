---
title: "API: types and constants"
---

# API: types and constants

Made from `goome.h` 0.5.2 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.


## Structs

### goome

```c
typedef struct goome goome;
```

you only ever get a pointer to one

### goome_opts

```c
typedef struct {
    const char *title;     // NULL = "goome"
    int backend;           // GOOME_AUTO or force one, env GOOME_BACKEND wins
    const char *state_dir; // portal token + control fifo live here, NULL = neither
    int no_capture;        // overlay only, never asks for screen access
    int capture_fps;       // gnome/portal streams, 0 = 5
    int hide_self;         // keep our overlay out of grabs where the os lets us
    const char *test_frames, *test_script, *test_shots; // GOOME_TEST only, env GOOME_TEST_FRAMES/_SCRIPT/_SHOTS
    int mode;                  // GOOME_MODE_*
    int width, height;         // window / offscreen size, logical. 0 = 960x640
    int min_width, min_height; // window only, 0 = none
    int window_flags;          // GOOME_WINDOW_*
    double scale;              // offscreen only, 0 = 1
} goome_opts;
```

### goome_rect

```c
typedef struct {
    int x, y, w, h;
} goome_rect;
```

### goome_monitor

```c
typedef struct {
    int id;
    char name[64];
    goome_rect area; // logical desktop coords
    double scale;    // real px per logical px
    int pw, ph;      // real px
    int rotation;    // 0 90 180 270, +360 if mirrored. grabs and canvases already undo it
} goome_monitor;
```

### goome_image

```c
typedef struct {
    uint32_t *px; // 0xFFRRGGBB, goome owns it, good until the next grab of that monitor
    int w, h, stride; // real px, stride in pixels
    goome_rect area;
    int mon;
    int has_self;   // our overlay is in it, mask with goome_alpha_at
    int has_cursor; // the mouse got baked in at cursor (logical)
    goome_rect cursor;
} goome_image;
```

### goome_canvas

```c
typedef struct {
    uint32_t *px; // premultiplied argb
    int w, h, stride; // real px, stride in pixels
    double ox, oy, scale; // logical spot of px[0], real px per logical px
    int mon;
    int dx0, dy0, dx1, dy1; // drawn since the clear
    int cx0, cy0, cx1, cy1; // what the clear wiped
    int kx0, ky0, kx1, ky1; // clip in real px, drawing never leaves it
    int nclip;
    int clips[16][4];
} goome_canvas;
```

### goome_event

```c
typedef struct {
    int type;
    double x, y; // logical
    int mon;
    int button; // 1 left 2 middle 3 right
    int dy;     // scroll notches, +1 = down
    int key;    // lowercase ascii or GOOME_K_
    int mods;
    char text[8]; // utf-8 it typed, can be empty
    int id;
    char msg[64]; // GOOME_CONTROL line
} goome_event;
```

### goome_pacer

```c
typedef struct {
    long next;
    int fps;
} goome_pacer;
```

### goome_radii

```c
typedef struct {
    double tl, tr, br, bl;
} goome_radii;
```

### goome_bitmap

```c
typedef struct {
    uint32_t *px; // premultiplied argb
    int w, h, stride;
    int owned;
} goome_bitmap;
```

### goome_font

```c
typedef struct goome_font goome_font;
```

you only ever get a pointer to one

### goome_ui

```c
typedef struct goome_ui goome_ui;
```

you only ever get a pointer to one

### goome_skin <kbd>0.2</kbd>

```c
typedef struct {
    const goome_bitmap *bm;
    double l, t, r, b;
} goome_skin;
```

### goome_theme

```c
typedef struct {
    uint32_t bg, panel, border, text, text_dim, accent, accent_text, hover, active, input_bg, shadow;
    double radius, pad, gap, border_width, font_size, shadow_blur, anim_ms;
    goome_font *font; // NULL = built in, goome_ui_new puts the system font here and frees it
    goome_skin skin_button, skin_panel, skin_input;
    const goome_bitmap *icon[GOOME_ICON_COUNT];
    uint32_t icon_tint;
    goome_skin skin_checkbox, skin_radio, skin_toggle, skin_slider, skin_slider_fill, skin_scrollbar, skin_tab, skin_titlebar, skin_tooltip, skin_menu, skin_popup;
    uint32_t focus, select, caret, link, badge, toast, tooltip, danger, knob, dim;
    double check_size, check_radius, toggle_w, toggle_h, slider_h, slider_track, knob_size;
    double scroll_w, scroll_min, item_h, menu_item_h, tab_h, win_title_h, app_title_h, menubar_h, statusbar_h;
    double focus_w, focus_gap, sep_w, grip, indent, plot_w, spinner, caret_w;
    double win_min_w, win_min_h, pop_gap, menu_gap, tip_pad_x, tip_pad_y, tip_x, tip_y, tip_radius;
    double shadow_x, shadow_y, align, heading_size, small_size, ease;
    double hover_ms, press_ms, popup_ms, collapse_ms, toast_fade_ms;
    goome_font *font_heading, *font_mono, *font_small;
} goome_theme;
```

### goome_ui_item <kbd>0.3</kbd>

```c
typedef struct {
    double x, y, w, h; // where it ended up, logical
    int hovered, pressed, held, released, clicked, double_clicked, right_clicked, focused;
    double mx, my;         // pointer, logical
    double dx, dy;         // moved this frame while held, after the axis lock
    double drag_x, drag_y; // since the press, after the axis lock
    int key;               // key pressed this frame while focused with GOOME_SHIFT etc ored in, 0 = none
} goome_ui_item;
```

### goome_combo <kbd>0.3</kbd>

```c
typedef struct {
    int key, mods;
} goome_combo;
```

### goome_ui_config <kbd>0.3</kbd>

```c
typedef struct {
    int tip_delay_ms, dbl_click_ms, dbl_click_px, drag_px, repeat_delay_ms, repeat_ms, blink_ms, menu_delay_ms, toast_ms;
    double scroll_lines;
    int raise_on_click, esc_closes, tab_nav, focus_on_mouse;
    int cursor[GOOME_CUR_COUNT];
    goome_combo keys[GOOME_ACT_COUNT][4];
    double (*ease)(double t, void *user);
    void *ease_user;
    const char *mask;
} goome_ui_config;
```

### goome_a11y_node <kbd>0.5</kbd>

```c
typedef struct {
    int role, parent, states;
    double x, y, w, h;
    char label[96], value[64];
    uint32_t id;
    double num, min, max;
    int caret;
} goome_a11y_node;
```

## Enums

### GOOME_*

```c
enum { GOOME_AUTO, GOOME_WAYLAND, GOOME_GNOME, GOOME_PORTAL, GOOME_X11, GOOME_WIN32, GOOME_MACOS, GOOME_TEST, GOOME_OFFSCREEN };
```

New in 0.2: `GOOME_OFFSCREEN`.

### GOOME_MODE_* <kbd>0.2</kbd>

```c
enum { GOOME_MODE_OVERLAY, GOOME_MODE_WINDOW, GOOME_MODE_OFFSCREEN };
```

### GOOME_WINDOW_* <kbd>0.2</kbd>

```c
enum {
    GOOME_WINDOW_RESIZABLE = 1, GOOME_WINDOW_BORDERLESS = 2, GOOME_WINDOW_TRANSPARENT = 4,
    GOOME_WINDOW_ON_TOP = 8, GOOME_WINDOW_HIDDEN = 16, GOOME_WINDOW_CENTER = 32, GOOME_WINDOW_NO_TITLEBAR = 64,
};
```

New in 0.5: `GOOME_WINDOW_NO_TITLEBAR`.

### GOOME_*

```c
enum {
    GOOME_OK = 0,
    GOOME_ENOTSUP = -1,
    GOOME_EDENIED = -2,
    GOOME_ENODISPLAY = -3,
    GOOME_EGONE = -4,
    GOOME_EAGAIN = -5,
    GOOME_ENOMEM = -6,
    GOOME_EARG = -7,
};
```

### GOOME_CAP_*

```c
enum {
    GOOME_CAP_CAPTURE = 1,
    GOOME_CAP_GLOBAL_POINTER = 2,
    GOOME_CAP_HOTKEYS = 4,
    GOOME_CAP_HIDE_SELF = 8,
    GOOME_CAP_KEYBOARD = 16,
    GOOME_CAP_WINDOW = 32,
    GOOME_CAP_CLIPBOARD = 64,
    GOOME_CAP_CURSOR = 128,
    GOOME_CAP_GRAB = 256,
};
```

New in 0.2: `GOOME_CAP_WINDOW`, `GOOME_CAP_CLIPBOARD`, `GOOME_CAP_CURSOR`.

New in 0.3: `GOOME_CAP_GRAB`.

### GOOME_WANT_* <kbd>0.3</kbd>

```c
enum { GOOME_WANT_MOUSE = 1, GOOME_WANT_KEYBOARD = 2 };
```

### GOOME_*

```c
enum {
    GOOME_NONE, GOOME_DOWN, GOOME_UP, GOOME_MOTION, GOOME_SCROLL, GOOME_KEY,
    GOOME_HOTKEY, GOOME_CONTROL, GOOME_MONITORS, GOOME_QUIT,
    GOOME_CLOSE, // window close button / alt-f4 / cmd-w, the app decides
    GOOME_FOCUS, // id = 1 gained, 0 lost
    GOOME_DROP,  // a file dropped on the window, msg = path (cut at 63 bytes, goome_drop_path has all of it), x,y = where
    GOOME_TEXT,    // an ime, dead key or compose finished some text, msg = it (cut at 63 bytes, goome_event_text has all of it)
    GOOME_PREEDIT, // the text being composed changed, msg = it, id = caret byte offset in it. empty = composing ended
};
```

New in 0.2: `GOOME_CLOSE`, `GOOME_FOCUS`, `GOOME_DROP`.

New in 0.5: `GOOME_TEXT`, `GOOME_PREEDIT`.

### GOOME_CURSOR_* <kbd>0.2</kbd>

```c
enum {
    GOOME_CURSOR_ARROW, GOOME_CURSOR_IBEAM, GOOME_CURSOR_HAND, GOOME_CURSOR_MOVE,
    GOOME_CURSOR_RESIZE_EW, GOOME_CURSOR_RESIZE_NS, GOOME_CURSOR_RESIZE_NWSE, GOOME_CURSOR_RESIZE_NESW,
    GOOME_CURSOR_WAIT, GOOME_CURSOR_NO, GOOME_CURSOR_HIDDEN,
};
```

### GOOME_EDGE_* <kbd>0.2</kbd>

```c
enum { GOOME_EDGE_LEFT = 1, GOOME_EDGE_RIGHT = 2, GOOME_EDGE_TOP = 4, GOOME_EDGE_BOTTOM = 8 };
```

### GOOME_STATE_* <kbd>0.2</kbd>

```c
enum { GOOME_STATE_NORMAL, GOOME_STATE_MINIMIZED, GOOME_STATE_MAXIMIZED, GOOME_STATE_FULLSCREEN };
```

### GOOME_K_*

```c
enum {
    GOOME_K_BACKSPACE = 8, GOOME_K_TAB = 9, GOOME_K_ENTER = 13, GOOME_K_ESC = 27, GOOME_K_SPACE = 32, GOOME_K_DELETE = 127,
    GOOME_K_F1 = 0x81, GOOME_K_F12 = 0x8C,
    GOOME_K_LEFT = 0x90, GOOME_K_RIGHT, GOOME_K_UP, GOOME_K_DOWN, GOOME_K_HOME, GOOME_K_END, GOOME_K_PGUP, GOOME_K_PGDN, GOOME_K_INSERT,
};
```

### GOOME_*

```c
enum { GOOME_SHIFT = 0x100, GOOME_CTRL = 0x200, GOOME_ALT = 0x400, GOOME_SUPER = 0x800 };
```

### GOOME_FMT_* <kbd>0.3</kbd>

```c
enum { GOOME_FMT_BGRA_PREMUL, GOOME_FMT_RGBA_PREMUL, GOOME_FMT_BGRA, GOOME_FMT_RGBA };
```

byte order in memory, the non premul ones unpremultiply

### GOOME_DIR_* <kbd>0.5</kbd>

```c
enum { GOOME_DIR_AUTO, GOOME_DIR_LTR, GOOME_DIR_RTL };
```

### GOOME_ICON_* <kbd>0.3</kbd>

```c
enum {
    GOOME_ICON_ARROW_DOWN, GOOME_ICON_ARROW_RIGHT, GOOME_ICON_ARROW_UP, GOOME_ICON_ARROW_LEFT,
    GOOME_ICON_CHECK, GOOME_ICON_RADIO_DOT, GOOME_ICON_CLOSE, GOOME_ICON_MINIMIZE, GOOME_ICON_MAXIMIZE, GOOME_ICON_RESTORE,
    GOOME_ICON_RESIZE, GOOME_ICON_SORT_UP, GOOME_ICON_SORT_DOWN, GOOME_ICON_PLUS, GOOME_ICON_MINUS,
    GOOME_ICON_SLIDER_KNOB, GOOME_ICON_TOGGLE_KNOB, GOOME_ICON_COLLAPSE, GOOME_ICON_EXPAND, GOOME_ICON_DRAG_HANDLE,
    GOOME_ICON_TOAST, GOOME_ICON_PICKER,
    GOOME_ICON_COUNT
};
```

### GOOME_WIN_*

```c
enum { GOOME_WIN_MOVE = 1, GOOME_WIN_RESIZE = 2, GOOME_WIN_COLLAPSE = 4, GOOME_WIN_NO_TITLE = 8, GOOME_WIN_CLOSE = 16 };
```

### GOOME_INPUT_* <kbd>0.3</kbd>

```c
enum { GOOME_INPUT_PASSWORD = 1, GOOME_INPUT_READONLY = 2, GOOME_INPUT_NUMBER = 4, GOOME_INPUT_NO_SELECT_ON_FOCUS = 8, GOOME_INPUT_ENTER_RETURNS = 16 };
```

### GOOME_APP_* <kbd>0.2</kbd>

```c
enum { GOOME_APP_TITLEBAR = 1, GOOME_APP_MENUBAR = 2, GOOME_APP_STATUSBAR = 4, GOOME_APP_NO_PAD = 8 };
```

### GOOME_EDIT_* <kbd>0.2</kbd>

```c
enum { GOOME_EDIT_READONLY = 1, GOOME_EDIT_LINE_NUMBERS = 2, GOOME_EDIT_WRAP = 4, GOOME_EDIT_MONO = 8 };
```

### GOOME_TABLE_* <kbd>0.2</kbd>

```c
enum { GOOME_TABLE_SORTABLE = 1, GOOME_TABLE_RESIZABLE = 2, GOOME_TABLE_STRIPES = 4, GOOME_TABLE_BORDERS = 8 };
```

### GOOME_S_* <kbd>0.3</kbd>

```c
enum {
    GOOME_S_BG, GOOME_S_PANEL, GOOME_S_BORDER, GOOME_S_TEXT, GOOME_S_TEXT_DIM, GOOME_S_ACCENT, GOOME_S_ACCENT_TEXT,
    GOOME_S_HOVER, GOOME_S_ACTIVE, GOOME_S_INPUT_BG, GOOME_S_SHADOW,
    GOOME_S_RADIUS, GOOME_S_PAD, GOOME_S_GAP, GOOME_S_BORDER_WIDTH, GOOME_S_FONT_SIZE, GOOME_S_SHADOW_BLUR, GOOME_S_ANIM_MS,
    GOOME_S_FOCUS, GOOME_S_SELECT, GOOME_S_CARET, GOOME_S_LINK, GOOME_S_BADGE, GOOME_S_TOAST, GOOME_S_TOOLTIP, GOOME_S_DANGER, GOOME_S_KNOB, GOOME_S_DIM,
    GOOME_S_CHECK_SIZE, GOOME_S_CHECK_RADIUS, GOOME_S_TOGGLE_W, GOOME_S_TOGGLE_H, GOOME_S_SLIDER_H, GOOME_S_SLIDER_TRACK, GOOME_S_KNOB_SIZE,
    GOOME_S_SCROLL_W, GOOME_S_SCROLL_MIN, GOOME_S_ITEM_H, GOOME_S_MENU_ITEM_H, GOOME_S_TAB_H, GOOME_S_WIN_TITLE_H, GOOME_S_APP_TITLE_H, GOOME_S_MENUBAR_H, GOOME_S_STATUSBAR_H,
    GOOME_S_FOCUS_W, GOOME_S_FOCUS_GAP, GOOME_S_SEP_W, GOOME_S_GRIP, GOOME_S_INDENT, GOOME_S_PLOT_W, GOOME_S_SPINNER, GOOME_S_CARET_W,
    GOOME_S_WIN_MIN_W, GOOME_S_WIN_MIN_H, GOOME_S_POP_GAP, GOOME_S_MENU_GAP, GOOME_S_TIP_PAD_X, GOOME_S_TIP_PAD_Y, GOOME_S_TIP_X, GOOME_S_TIP_Y, GOOME_S_TIP_RADIUS,
    GOOME_S_SHADOW_X, GOOME_S_SHADOW_Y, GOOME_S_ALIGN, GOOME_S_HEADING_SIZE, GOOME_S_SMALL_SIZE, GOOME_S_EASE,
    GOOME_S_HOVER_MS, GOOME_S_PRESS_MS, GOOME_S_POPUP_MS, GOOME_S_COLLAPSE_MS, GOOME_S_TOAST_FADE_MS,
    GOOME_S_COUNT
};
```

### GOOME_ALIGN_* <kbd>0.3</kbd>

```c
enum { GOOME_ALIGN_AUTO, GOOME_ALIGN_LEFT, GOOME_ALIGN_CENTER, GOOME_ALIGN_RIGHT };
```

### GOOME_EASE_* <kbd>0.3</kbd>

```c
enum { GOOME_EASE_SMOOTH, GOOME_EASE_LINEAR, GOOME_EASE_OUT, GOOME_EASE_IN_OUT, GOOME_EASE_BACK, GOOME_EASE_CUSTOM, GOOME_EASE_IN, GOOME_EASE_SPRING, GOOME_EASE_BOUNCE };
```

New in 0.5: `GOOME_EASE_IN`, `GOOME_EASE_SPRING`, `GOOME_EASE_BOUNCE`.

### GOOME_SKIN_* <kbd>0.3</kbd>

```c
enum {
    GOOME_SKIN_BUTTON, GOOME_SKIN_PANEL, GOOME_SKIN_INPUT,
    GOOME_SKIN_CHECKBOX, GOOME_SKIN_RADIO, GOOME_SKIN_TOGGLE, GOOME_SKIN_SLIDER_TRACK, GOOME_SKIN_SLIDER_FILL, GOOME_SKIN_SCROLLBAR,
    GOOME_SKIN_TAB, GOOME_SKIN_TITLEBAR, GOOME_SKIN_TOOLTIP, GOOME_SKIN_MENU, GOOME_SKIN_POPUP,
    GOOME_SKIN_COUNT
};
```

### GOOME_ITEM_* <kbd>0.3</kbd>

```c
enum { GOOME_ITEM_DRAG_X = 1, GOOME_ITEM_DRAG_Y = 2, GOOME_ITEM_FOCUSABLE = 4, GOOME_ITEM_NO_HIT = 8, GOOME_ITEM_REPEAT = 16 };
```

### GOOME_PRESET_* <kbd>0.3</kbd>

```c
enum { GOOME_PRESET_DARK, GOOME_PRESET_LIGHT, GOOME_PRESET_MIDNIGHT, GOOME_PRESET_PAPER, GOOME_PRESET_MINT, GOOME_PRESET_HIGH_CONTRAST, GOOME_PRESET_ROSE, GOOME_PRESET_COUNT };
```

### GOOME_ACT_* <kbd>0.3</kbd>

```c
enum {
    GOOME_ACT_COPY, GOOME_ACT_CUT, GOOME_ACT_PASTE, GOOME_ACT_UNDO, GOOME_ACT_REDO, GOOME_ACT_SELECT_ALL,
    GOOME_ACT_WORD_LEFT, GOOME_ACT_WORD_RIGHT, GOOME_ACT_DEL_WORD_LEFT, GOOME_ACT_DEL_WORD_RIGHT, GOOME_ACT_DOC_START, GOOME_ACT_DOC_END,
    GOOME_ACT_COUNT
};
```

### GOOME_CUR_* <kbd>0.3</kbd>

```c
enum {
    GOOME_CUR_BUTTON, GOOME_CUR_INPUT, GOOME_CUR_LINK, GOOME_CUR_DRAG_VALUE, GOOME_CUR_SPLIT_X, GOOME_CUR_SPLIT_Y, GOOME_CUR_GRIP,
    GOOME_CUR_COLUMN, GOOME_CUR_DRAG_DROP, GOOME_CUR_CUSTOM_X, GOOME_CUR_CUSTOM_Y, GOOME_CUR_CUSTOM_XY,
    GOOME_CUR_COUNT
};
```

### GOOME_ROLE_* <kbd>0.5</kbd>

```c
enum {
    GOOME_ROLE_NONE, GOOME_ROLE_WINDOW, GOOME_ROLE_BUTTON, GOOME_ROLE_CHECKBOX, GOOME_ROLE_RADIO, GOOME_ROLE_SLIDER, GOOME_ROLE_TEXT,
    GOOME_ROLE_INPUT, GOOME_ROLE_COMBO, GOOME_ROLE_LIST, GOOME_ROLE_ITEM, GOOME_ROLE_TAB, GOOME_ROLE_MENU, GOOME_ROLE_MENUITEM,
    GOOME_ROLE_TABLE, GOOME_ROLE_TREE, GOOME_ROLE_PROGRESS, GOOME_ROLE_IMAGE, GOOME_ROLE_GROUP, GOOME_ROLE_DIALOG,
};
```

### GOOME_A11Y_* <kbd>0.5</kbd>

```c
enum { GOOME_A11Y_FOCUSED = 1, GOOME_A11Y_CHECKED = 2, GOOME_A11Y_DISABLED = 4, GOOME_A11Y_EXPANDED = 8, GOOME_A11Y_SELECTED = 16 };
```
