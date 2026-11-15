---
title: Window mode
---

# Window mode <kbd>0.2</kbd>

One real top level window with a title bar, resize, move, minimize and maximize, the UI kit in it. Basically WinForms but C and every OS.

```c
goome_opts o = {
    .title = "notes",
    .mode = GOOME_MODE_WINDOW,
    .width = 800, .height = 600,
    .min_width = 400, .min_height = 300,
    .window_flags = GOOME_WINDOW_RESIZABLE | GOOME_WINDOW_CENTER,
};
goome *g = goome_open(&o, NULL);
```

`width` and `height` are the logical client size. 0 gives you 960x640.

## How it differs from overlay mode

The window is monitor 0. `goome_monitors` gives one entry: `area` = `{0, 0, w, h}` in logical px, `scale` = the window's DPI scale, `pw`/`ph` in real px, `name` = the title. `goome_begin(g, 0)` is the client area, event coords start at its top left and `mon` is always 0.

The whole window takes input, hit rects dont do routing anymore ([`goome_hit`](api-core.md) still checks them). Keyboard is on whenever it has focus.

Resizing sends `GOOME_MONITORS`, and so does moving to a screen with another DPI. Hotkeys and capture work like overlay mode.

## Flags

| Flag | What it does |
|:--|:--|
| `GOOME_WINDOW_RESIZABLE` | the user can resize it |
| `GOOME_WINDOW_BORDERLESS` | no OS title bar or border, draw your own (the UI kit's `goome_ui_app` can) |
| `GOOME_WINDOW_TRANSPARENT` | the canvas alpha becomes real per pixel window alpha, so you can make shaped windows |
| `GOOME_WINDOW_ON_TOP` | stays above other windows |
| `GOOME_WINDOW_HIDDEN` | starts hidden, show it with `goome_window_show(g, 1)` |
| `GOOME_WINDOW_CENTER` | opens centered on the screen |

On Windows a transparent window has no title bar, use your own (`goome_ui_app` with `GOOME_APP_TITLEBAR`). Without `GOOME_WINDOW_TRANSPARENT` its opaque and anything see-through lands on black, so fill the background or let `goome_ui_app` do it.

## New events

| Event | When |
|:--|:--|
| `GOOME_CLOSE` | close button, alt+f4, or cmd+w on macOS. goome does **not** close by itself, thats up to you |
| `GOOME_FOCUS` | `id` is 1 when the window got focus, 0 when it lost it |
| `GOOME_DROP` | a file got dropped on the window. `x`, `y` say where, `msg` has the path cut at 63 bytes and `goome_drop_path(g)` has all of it until the next poll |

## Controlling the window

```c
goome_window_title(g, "notes - todo.txt");
goome_window_size(g, 1024, 700);
goome_window_state(g, GOOME_STATE_MAXIMIZED);
int x, y;
if (goome_window_pos(g, &x, &y, 0) == GOOME_OK) printf("at %d,%d\n", x, y);
```

`goome_window_pos` is the top left of the client area, not the frame. Its `GOOME_ENOTSUP` on Wayland, Wayland doesnt tell apps where their window is. `goome_window_get_state` gives `GOOME_STATE_NORMAL`, `_MINIMIZED`, `_MAXIMIZED` or `_FULLSCREEN`.

Own title bar (with `GOOME_WINDOW_BORDERLESS`): call `goome_window_drag(g, 0)` on the mouse press and the OS does the move. `GOOME_EDGE_*` bits instead of 0 resize from that edge. The OS eats the real button release during the move, so goome pushes a `GOOME_UP` itself, otherwise your buttons would stay stuck pressed.

## Cursor and clipboard

```c
goome_cursor(g, GOOME_CURSOR_IBEAM);
goome_clipboard_set(g, "hello");
char buf[256];
int n = goome_clipboard_get(g, buf, sizeof(buf));
```

`goome_clipboard_get` returns the full length, which can be bigger than your buffer (it still cuts and nul terminates). On X11 and Wayland it can block up to ~250 ms asking the app that owns the clipboard. The UI kit already does both, ibeam over text inputs and ctrl+c/x/v in them.

## Several windows

One `goome` is one window. Want two, open two:

```c
goome *main_win = goome_open(&(goome_opts){.title = "main", .mode = GOOME_MODE_WINDOW}, NULL);
goome *tools = goome_open(&(goome_opts){.title = "tools", .mode = GOOME_MODE_WINDOW, .width = 300, .height = 500}, NULL);
```

Poll both every frame, timeout 0 on all but one.

## How it looks on each OS

| Where | Window |
|:--|:--|
| X11 | a normal managed window, decorations from your window manager |
| Wayland with xdg-decoration (KDE, sway...) | xdg_toplevel with server side decorations |
| GNOME on Wayland | XWayland when `DISPLAY` is set, so real GNOME decorations. Otherwise goome draws a thin title bar itself |
| Windows | `WS_OVERLAPPEDWINDOW`, per monitor DPI |
| macOS | a normal NSWindow |

`GOOME_CSD=1` makes goome draw its own title bar on Wayland even when the compositor offers decorations.

The GNOME and portal backends are overlay only, AUTO skips them in window mode and picks Wayland, X11, Win32 or macOS.

UI side is on [App mode and menus](ui-app.md). `goome_ui_app` fills the window with a menu bar and status bar, plus a title bar with working buttons if its borderless.
