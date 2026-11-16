---
title: Compare
---

# Compare

How goome stacks up against the other UI picks, from Dear ImGui to Electron. goome is small and its whole point is overlays, but its also young. The others have years on it, so if you dont need an overlay one of them might fit you better. I tried to keep this fair.

## What I measured

Only goome got measured here. The hello is a UI kit window with a label and a button, same idea as ImGui's hello window.

| | goome 0.5.0 |
|:--|:--|
| Stripped binary | 764 KB (782,712 bytes) |
| `ldd` | `libc.so.6` and the loader, thats it |
| Link flags | none, `cc -O2 hello.c goome.c` |
| Start to first frame | about 60 ms, 40-130 ms over 12 runs |
| Idle memory (RSS) | 9.8 MB, 2.9 MB of it its own (anon) |

That was gcc 15.2 on Ubuntu x86_64, in a VM on X11 (Xvfb, so no GPU). goome loads the X11 and font libs by itself at runtime when they're there. They show up in the process but not in `ldd`, and its 21 libs mapped in total. Time is from the shell starting the process to the first `goome_ui_end` returning. A real desktop with a GPU and a compositor will be a bit different, treat these as rough. The VM was busy with other stuff, thats where the slow runs came from. Its bigger than the 648 KB the same hello was on 0.3.0, 0.4 and 0.5 put a lot in (RTL and Arabic shaping, emoji, IME, accessibility, animations).

**Dear ImGui + GLFW + OpenGL3 wasnt measured.** The plan was to build its GLFW + OpenGL3 hello next to goome's, but this machine has no GLFW and no X11 or OpenGL headers to build it with, so I skipped it instead of guessing. The facts below for ImGui come from its own repo.

## Side by side

None of these numbers except goome's were measured here. They're from the projects' own docs and releases, linked under the table.

| | goome | Dear ImGui + GLFW | WinForms | Electron | Qt 6 Widgets | egui (eframe) |
|:--|:--|:--|:--|:--|:--|:--|
| Language | C, plus C#, Python, Java, Godot, Rust, Node, Go, Zig, Lua | C++ | C# / .NET | JavaScript, HTML, CSS | C++, Python | Rust |
| OSes | Linux (X11, Wayland), Windows, macOS | anything GLFW runs on | Windows only | Linux, Windows, macOS | pretty much everywhere | Linux, Windows, macOS, web |
| Size of a hello | 764 KB, measured | not measured | needs the .NET runtime, trimming is off for WinForms [1] | the runtime zip is 95-110 MB [2] | Core + Gui + Widgets libs are about 26 MB installed on Ubuntu [3] | not measured |
| Runtime deps | libc, the rest is optional and loaded at runtime | GLFW and an OpenGL driver [4] | .NET | its own Chromium + Node | the Qt libs | a GPU driver (glow or wgpu) |
| Link flags | none | `-lGL` + `pkg-config --static --libs glfw3` on Linux in ImGui's example Makefile [4] | none, its .NET | none, its npm | `find_package(Qt6 ...)` + `Qt6::Widgets` | cargo does it |
| Click-through overlay | built in, per region: what you draw takes clicks, the rest goes through, every frame | whole window only, `GLFW_MOUSE_PASSTHROUGH` in GLFW 3.4 [5] | by hand with `WS_EX_LAYERED` + `WS_EX_TRANSPARENT` [6] | whole window, `setIgnoreMouseEvents` [7] | whole window, `Qt::WindowTransparentForInput` [8] | whole window, `with_mouse_passthrough` [9] |

Per region is the part goome is built around. With the others you can make a whole window let clicks through, then flip it on and off yourself as the mouse moves over your stuff. Electron even has a `forward` option for that, but only on Windows and macOS [7]. goome does it for you from the hit rects you send with each frame, see [Hit rects](hit-rects.md).

## Where the others are better

Dear ImGui is the one to beat for tools inside a game or engine. Its battle tested, it has backends for every renderer and every engine dev already knows it. goome's [offscreen mode](offscreen-mode.md) does the same job, but ImGui has had years more polish there.

WinForms has the Visual Studio designer and comes with Windows. For a quick Windows only tool thats hard to beat.

Electron is huge, but its the web. If you already know HTML and CSS you can build almost anything and it looks the same everywhere. VS Code and Discord are Electron.

Qt is the most complete one. It has native looking widgets, a real designer, translations with Qt Linguist [10] and screen reader support thats been around for years [11]. goome talks to screen readers too since 0.5 (AT-SPI, UI Automation and NSAccessibility), but nobody has tried that with a real screen reader yet. It also does emoji, right to left text and IME input, but theres nothing for translating your strings, you do that yourself.

egui is the nice pick if you're in Rust and want something made for Rust, and it runs in the browser too. goome has a Rust crate now <kbd>0.5</kbd> but its a wrapper over the C.

goome makes sense when you want a small overlay or app with no deps, from C or one of the bindings, and you need clicks to go through everything you didnt draw. For a big desktop app that needs translations and screen reader support you can count on, use Qt.

## Sources

1. [Known trimming incompatibilities](https://learn.microsoft.com/en-us/dotnet/core/deploying/trimming/incompatibilities#windows-forms), Microsoft Learn
2. [Electron v33.0.0 release](https://github.com/electron/electron/releases/tag/v33.0.0), the `electron-v33.0.0-*.zip` assets: darwin-arm64 95 MB, linux-x64 101 MB, win32-x64 110 MB
3. Ubuntu package metadata for Qt 6.10.2: `libqt6core6t64` 6.4 MB, `libqt6gui6` 11.2 MB, `libqt6widgets6` 8.3 MB installed, see [packages.ubuntu.com](https://packages.ubuntu.com/search?keywords=libqt6widgets6)
4. [Dear ImGui](https://github.com/ocornut/imgui) and its [example_glfw_opengl3 Makefile](https://github.com/ocornut/imgui/blob/master/examples/example_glfw_opengl3/Makefile)
5. [GLFW window hints](https://www.glfw.org/docs/latest/window_guide.html#window_hints_wnd), `GLFW_MOUSE_PASSTHROUGH`
6. [Extended window styles](https://learn.microsoft.com/en-us/windows/win32/winmsg/extended-window-styles), Microsoft Learn
7. [BrowserWindow.setIgnoreMouseEvents](https://www.electronjs.org/docs/latest/api/browser-window#winsetignoremouseeventsignore-options), Electron docs
8. [Qt::WindowType](https://doc.qt.io/qt-6/qt.html#WindowType-enum), Qt docs
9. [ViewportBuilder](https://docs.rs/egui/latest/egui/viewport/struct.ViewportBuilder.html), egui docs
10. [Qt Linguist Manual](https://doc.qt.io/qt-6/qtlinguist-index.html), Qt docs
11. [Accessibility](https://doc.qt.io/qt-6/accessible.html), Qt docs

The goome hello and the commands are below if you want to check my numbers.

```c
#include "goome.h"

int main(void)
{
    goome *g = goome_open_app("hello", 640, 400, NULL);
    if (!g) return 1;
    goome_ui *u = goome_ui_new(g);
    int clicks = 0;
    double x = 40, y = 40, w = 300, h = 160;
    for (;;) {
        goome_event ev;
        while (goome_poll(g, &ev, 16) > 0) {
            if (ev.type == GOOME_QUIT || ev.type == GOOME_CLOSE) return 0;
            goome_ui_feed(u, &ev);
        }
        if (!goome_ui_begin(u, 0)) continue;
        goome_ui_window(u, "Hello", &x, &y, &w, &h, GOOME_WIN_MOVE, NULL);
        goome_ui_label(u, "hello world");
        if (goome_ui_button(u, "Click me")) clicks++;
        goome_ui_label(u, "clicks: %d", clicks);
        goome_ui_window_end(u);
        goome_ui_end(u);
    }
}
```

```sh
cc -std=c99 -O2 -o hello hello.c goome.c
strip hello && ls -l hello && ldd hello
grep VmRSS /proc/$(pgrep -x hello)/status
```
