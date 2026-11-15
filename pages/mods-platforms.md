---
title: Platform backends
---

# Platform backends <kbd>0.3</kbd>

These turn the host window's input into goome events and tell you which ones goome ate. Same folder and same stb style as the [renderer backends](mods-renderers.md).

| Header | For | Eaten comes back from |
|:--|:--|:--|
| `goome_win32.h` | any Win32 window, the usual way into a Windows game | `goome_win32_wndproc(..., &eaten)` |
| `goome_glfw.h` | GLFW 3 | its own callbacks, or the `goome_glfw_*` functions |
| `goome_sdl2.h` | SDL 2 | `goome_sdl2_event` |
| `goome_sdl3.h` | SDL 3 | `goome_sdl3_event` |

All of them have `_init`, `_set_ui`, `_frame` and `_shutdown`. `_frame` goes once a frame and picks up size changes. It also syncs the cursor shape and the clipboard. `_set_ui` hands it your `goome_ui`, without it the keyboard never counts as eaten.

## Eaten input

If goome ate an event, don't give it to the game. Thats how dragging a slider doesnt also spin the camera.

- The mouse is eaten when its over something goome drew that takes clicks, or while a press that started on goome is still held, even off the ui.
- Keys and text are eaten while goome wants the keyboard, a text box has focus or a modal is open.

goome still gets every event either way, so clicking off a text box unfocuses it.

Its the [`goome_ui_wants`](input-capture.md#goome_ui_wants) idea. Every mod and engine page here blocks input this way, through a backend or by checking `goome_ui_wants` itself.

## Win32

Subclass the game window and ask goome first:

```c
static goome *g;
static WNDPROC game_proc;

static LRESULT CALLBACK my_proc(HWND h, UINT m, WPARAM w, LPARAM l)
{
    int eaten;
    LRESULT r = goome_win32_wndproc(g, h, m, w, l, &eaten);
    return eaten ? r : CallWindowProcW(game_proc, h, m, w, l);
}

static void hook_window(HWND hwnd, goome_ui *u)
{
    goome_win32_init(g, hwnd);
    goome_win32_set_ui(g, u);
    game_proc = (WNDPROC)SetWindowLongPtrW(hwnd, GWLP_WNDPROC, (LONG_PTR)my_proc);
}
```

It eats `WM_INPUT` too, so games that read raw mouse input dont see the drag either.

## GLFW

```c
goome_glfw_init(g, win, 1);
goome_glfw_set_ui(g, u);
```

With 1 it puts its own callbacks in front of yours, and yours only get called for what goome didnt eat. Pass 0 to keep your callbacks and call `goome_glfw_cursor_pos`, `_mouse_button`, `_scroll`, `_key`, `_char` and `_focus` from them yourself. They return 1 when its eaten.

## SDL2 and SDL3

```c
goome_sdl2_init(g, win);
goome_sdl2_set_ui(g, u);
SDL_Event e;
while (SDL_PollEvent(&e))
    if (!goome_sdl2_event(g, &e)) game_handle(&e);
goome_sdl2_frame(g);
```

SDL3 is the same with `sdl3` in the names.

## Your own input

No backend, push `goome_event`s yourself ([offscreen mode](offscreen-mode.md#input) has the table) and check `goome_ui_wants(u)` before the game reads anything.
