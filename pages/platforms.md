---
title: Where it works
---

# Where it works

goome picks the backend itself. `GOOME_BACKEND=x11` (or `wayland`, `gnome`, `portal`, `test`) forces one, and then it fails instead of falling back.

| Where | Overlay | Screen grab | Global hotkeys |
|:--|:--|:--|:--|
| sway, Hyprland, river, wayfire, labwc, niri | layer-shell | wlr-screencopy | control fifo |
| KDE Plasma 6, COSMIC | layer-shell | portal (asks once) | control fifo |
| GNOME (Wayland) | XWayland window | Mutter ScreenCast, no popup | control fifo |
| Cinnamon and other Wayland | XWayland window | portal (asks once) | control fifo |
| Any X11 desktop (XFCE, KDE X11, MATE, i3, openbox...) | X11 window | X11 | yes |
| Windows 10 / 11 | layered windows | GDI | yes |
| macOS 14+ | NSPanel | ScreenCaptureKit | yes, with Accessibility on |

> Only want your window on Windows, with no console box next to it? `GOOME_WINDOW_NO_CONSOLE` closes it for you, see [Hide the console on Windows](windows-console.md) <kbd>0.5.5</kbd>. It is off by default.

No system wide key grabs on Wayland, see [Hotkeys and the control fifo](hotkeys.md).

## What CI actually ran

The table says what each backend is meant to do. What a scripted CI run has checked, on machines with no GPU and no person ([Compare](compare.md#linux-window-managers-and-compositors) has the full tables):

- **X11:** 11 of 11 window managers pass (i3, openbox, fluxbox, icewm, metacity, marco, xfwm4 with and without picom, mutter, kwin, and none). Hotkeys and screen grabs are checked there too
- **Wayland:** sway (wlr-screencopy, grabs compared with grim, control fifo), labwc and mutter pass on Ubuntu and Arch, wayfire on Arch, kwin 5.27 on Ubuntu through the portal. Hyprland, river and niri never started in the harness, and COSMIC and Cinnamon were not tried, so those rows are what the code is written for, not something I saw run. weston and cage only half passed, see Compare
- **GNOME grabs:** `tests/gnome.sh` in c-goome checks Mutter ScreenCast and the portal path against a headless gnome-shell and a fake portal, but it is not part of the CI workflow. The overlay on GNOME is in CI, the "no popup" grab is not
- **Windows:** the runner is Windows Server 2025, not a 10 or 11 desktop. Layered windows, UI Automation, GDI grabs and hotkeys pass there
- **macOS:** the runners are macOS 15 and 26, nothing ran on 14. The runners cant record the screen, so CI only checks that a grab comes back "not allowed" instead of hanging, ScreenCaptureKit never gave a picture. Global hotkeys were not tried on a Mac either

`goome_caps(g)` says what actually works where you are, `goome_backend_name(g)` which backend you got. Java has `g.can(Goome.CAP_HOTKEYS)` and `g.backendName()`.

## The caps

| Cap | Means |
|:--|:--|
| `GOOME_CAP_CAPTURE` | `goome_capture` works |
| `GOOME_CAP_GLOBAL_POINTER` | `goome_pointer` knows where the mouse is everywhere, also outside your hits |
| `GOOME_CAP_HOTKEYS` | `goome_hotkey` works |
| `GOOME_CAP_HIDE_SELF` | `hide_self` really keeps your overlay out of grabs |
| `GOOME_CAP_KEYBOARD` | `goome_keyboard` can take the keyboard |
| `GOOME_CAP_WINDOW` <kbd>0.2</kbd> | window mode works here |
| `GOOME_CAP_CLIPBOARD` <kbd>0.2</kbd> | the clipboard functions reach the real clipboard |
| `GOOME_CAP_CURSOR` <kbd>0.2</kbd> | `goome_cursor` changes the real cursor |
| `GOOME_CAP_GRAB` <kbd>0.3</kbd> | `goome_grab` gets a real pointer grab, see [Taking input from the game](input-capture.md) |

## How it picks on Linux

1. X11 session (`XDG_SESSION_TYPE=x11`, or `DISPLAY` set without `WAYLAND_DISPLAY`): x11.
2. No Wayland display either: gives up with `GOOME_ENODISPLAY`.
3. GNOME on Wayland: x11 overlay on XWayland with mutter capture, then the portal, then no capture.
4. layer-shell + wlr-screencopy (sway, Hyprland, river, wayfire, labwc, niri).
5. layer-shell + portal (KDE, COSMIC).
6. x11 on XWayland + portal (Cinnamon and anything else without layer-shell).
7. An overlay with no capture. Drawing works, grabs return `GOOME_ENOTSUP`.

Any `GOOME_TEST_*` env var switches to the [test backend](testing.md).

Window mode <kbd>0.2</kbd> skips gnome and portal, they only do overlays. On GNOME Wayland with `DISPLAY` set it goes through XWayland for real window decorations. Offscreen mode doesnt use any of this.

## macOS permissions

Grabs need Screen Recording, hotkeys need Accessibility. macOS gives those to whatever app started your program, so from a terminal or IDE its that app in System Settings, not yours. A real .app bundle asks for itself. goome has to run on the main thread on Mac.

## Old systems

Linux builds are meant to work back to glibc 2.34. CI doesnt run on that old a glibc, it checks with `objdump` that the binaries dont use any symbol newer than 2.34. libwayland, libX11, xkbcommon, gio, gstreamer and fontconfig all load at runtime, if one is missing goome picks something else. Nothing to install to build the C library except a C compiler.
