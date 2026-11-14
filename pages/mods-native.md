---
title: Native DLL mods
---

# Native DLL mods <kbd>0.3</kbd>

Real mod menus for Windows games you dont have the source to. The DLL loads into the game, hooks the call that shows each frame and draws goome on top of everything the game drew, so it works in exclusive fullscreen too. Same idea as ReShade or a Dear ImGui mod menu. They live in the examples repo, [mods/native](https://github.com/goome-ui/examples/tree/main/mods/native). Read the [anti-cheat line](mods.md#anti-cheat) first.

| Folder | Hooks | For |
|:--|:--|:--|
| `dx11` | `IDXGISwapChain::Present` | Direct3D 11 games |
| `dx12` | `Present` + `ExecuteCommandLists` | Direct3D 12 games |
| `opengl` | `wglSwapBuffers` and `SwapBuffers` | OpenGL games |
| `vulkan` | `vkQueuePresentKHR` | Vulkan games |

## Build one

```sh
git clone https://github.com/goome-ui/examples
cd examples/mods/native
bash build.sh dx11
```

Swap `dx11` for `dx12`, `opengl` or `vulkan`. It needs `x86_64-w64-mingw32-gcc` (or set `CC`) and drops `build/dx11/version.dll`. The script fetches [MinHook](https://github.com/TsudaKageyu/minhook), and the Vulkan headers for the vulkan one, nothing is checked in. With MSVC the same sources build, you just need those two on your include path.

Put `version.dll` next to the game's exe and start the game. Insert hides and shows the menu.

## How it loads

Windows loads the mod as `version.dll` and the mod forwards every real call to the system one, the game never notices. Almost every game loads `version.dll` and it only has sixteen functions to pass on. A `dxgi.dll` or `winmm.dll` proxy works the same, `common/proxy.c` just lists other names.

Once its in it starts a thread, makes a throwaway device to read the swapchain vtable and hooks present with MinHook. From then on goome draws offscreen every frame and the matching [renderer backend](mods-renderers.md) puts it over the game's frame as one quad. dx12 also catches the game's command queue through `ExecuteCommandLists`, records its own command list and submits it there. vulkan hooks the create calls to find its device and swapchain, then records a pass over the image being shown.

Input goes through `common/mod.h`, which subclasses the game window with the [Win32 platform backend](mods-platforms.md#win32), so eaten input never reaches the game.

## Your own menu

The menu is `goome_mod_menu_draw` in `common/goome_menu.h`, a normal [UI kit](ui.md) frame:

```c
if (goome_ui_begin(u, 0)) {
    if (goome_ui_window(u, "my mod", &m->x, &m->y, &m->w, &m->h, GOOME_WIN_MOVE | GOOME_WIN_CLOSE, &m->open)) {
        goome_ui_toggle(u, "Noclip", &m->noclip);
        goome_ui_slider(u, "Move speed", &m->speed, 0.25, 8, "%.2fx");
    }
    goome_ui_window_end(u);
    goome_ui_end(u);
}
```

Change the fields in `goome_mod_menu` and the widgets, the hooks dont care whats in it.

## Testing it

`testgame/` has a tiny game per api that spins a triangle and counts every mouse and key message it handles. The test loads the mod next to it, checks the menu shows up in a screenshot, drags a slider across the menu and checks not one message got to the game, then clicks empty space and checks that one does.

```sh
cd testgame
bash build.sh
RUNNER=native bash run.sh
```

On Linux it runs under wine with Xvfb and mesa, `RUNNER=wine SKIP=vulkan bash run.sh`. CI runs all of them but vulkan on a real Windows runner and under wine. Vulkan only runs where theres a working swapchain.
