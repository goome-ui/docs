---
title: Compare
---

# Compare

How goome stacks up against the other UI picks, from Dear ImGui to Electron. goome is small and its whole point is overlays, but its also 3 weeks old and has no stars yet. The others have years on it, so if you dont need what goome is built for, one of them probably fits you better. This page has a lot of numbers. Every one of them came out of a result file, a build I ran or the other projects own docs, and the page says which. Where something failed I wrote what failed and why instead of leaving a gap.

Last checked <b>2026-11-17</b>. Everything measured ran in GitHub Actions on that day, and the commands to run it again are at the [bottom](#how-to-run-it-yourself).

## goome in numbers

All of this is goome 0.5.2. One C file hello, `cc -std=c99 -Os hello.c`, window backend included, no link flags.

| | Linux | Windows | macOS arm64 | macOS x86_64 |
|:--|:--|:--|:--|:--|
| Stripped hello (`-Os`) | 584 KB | 427 KB | 483 KB | 504 KB |
| Compile time (`-Os`, best of 3) | 6.2 s | 10.7 s | 6.1 s | 10.2 s |
| Start to first frame, real window | 36 ms | 76 ms | 293 ms | 261 ms |
| Start to first frame, offscreen | 5.4 ms | 13.6 ms | 7.6 ms | 10.9 ms |
| Memory (RSS) of the hello in a window | 8.2 MB | 31.3 MB | 95.7 MB | 46.5 MB |
| 50 row dashboard, one frame | 2.63 ms | 4.52 ms | 3.60 ms | 7.20 ms |
| Same dashboard when nothing changed | 0.0014 ms | 0.0023 ms | 0.0025 ms | 0.0033 ms |

The dashboard frame is a full 960x640 frame in ms, ui build **plus rasterizing every pixel on the CPU** (offscreen mode, no vsync). That is a lot more than what ImGui, Nuklear, microui, Clay and egui do per frame, they stop at a list of triangles or commands. Dont read it against theirs, read it against LVGL, Qt, GTK and raygui, which rasterize too. The [frame cost](#frame-cost) section sorts that out. The "nothing changed" line is goome skipping the frame because no widget or animation moved, which is what a real app does when its idle.

More about the thing itself, counted from the repo and the live docs site:

| | |
|:--|:--|
| `goome.h` | 34,127 lines, 1,443,321 bytes. The whole library, the implementation is in the same file behind `GOOME_IMPLEMENTATION` |
| Public API | 202 functions (111 of them are `goome_ui_*`) and 310 enum constants in `include/goome.h` |
| Languages | 10: C, C#, Python, Java, Rust, Node, Go, Zig, Lua and GDScript through the Godot addon. The [builder](ui-builder.md) exports all 10 |
| Window backends | X11, Wayland (layer-shell, XWayland, GNOME Mutter), Win32, macOS NSPanel. Renderer backends for games: DX9, DX11, DX12, GL2, GL3, Vulkan, Metal, plus GLFW, SDL2, SDL3 and Win32 platform backends. CI never built the SDL3 one, see [below](#renderer-and-platform-backends-for-games-and-engines) |
| Browser | `goome build --web` makes a `.wasm`. Brickout is 308,445 bytes (133,896 gzipped) and Tidy is 374,683 bytes (158,875 gzipped), see [Try it](try.md) |
| Unit tests | 39,589 `CHECK` evaluations on Linux, 39,588 on Windows and on both Macs, all good |
| Age | first commit 2026-11-02, 3 weeks. 0 GitHub stars on 2026-11-17 |
| License | GPL-3.0 |

### Runner hardware and versions, measured on 2026-11-17

Every number on this page came from GitHub hosted runners, 4 jobs per run. There is no GPU on any of them, so everything that draws on a screen is software rendered (Mesa llvmpipe on Linux, a software GL or WARP on Windows). A real desktop with a GPU will be different, treat the numbers as "same machine, same day, different libraries", not as what your PC does.

| | Linux | Windows | macOS arm64 | macOS x86_64 |
|:--|:--|:--|:--|:--|
| Image | ubuntu-24.04 `20261111.x` | windows-2025 `20261103.298.1` | macos-26 `20261102.0473.1` / `20261112.0504.1` | macos-15 `20260824.0482.1` |
| CPU | AMD EPYC 9V45 / 9V74 or Intel Xeon 6975P-C (it changed from run to run), 4 cores, about 15.5 GB | AMD EPYC (family 25), 4 cores, 16 GB | Apple M1 (virtual), 3 cores, 7 GB | Intel i7-8700B, 4 cores, 14 GB |
| C compiler | gcc 13.3.0 | MinGW gcc 15.2.0 (13.1.0 in the Qt, GTK, Electron and Tauri run) | Apple clang 21.0.0 | Apple clang 17.0.0 |
| Display | Xvfb 1280x800 | the runner desktop | the runner desktop | the runner desktop |

The libraries ran in four separate workflow runs (goome, the C ones, the LVGL / raygui / egui ones and the Qt / GTK / Electron / Tauri ones). Github gave each run its own machine. That is why the Linux CPU in the table changes, and it is the biggest source of noise. I ran the C libraries (ImGui, Nuklear, microui, Clay) twice on the same commit to see how big it is: Linux frame times matched within 2%, Windows moved up to 60% (Clay dash 0.220 and 0.138 ms), macOS arm64 up to 45% (microui 0.021 and 0.030 ms) and macOS x86_64 up to 2.6 times (Nuklear 0.467 and 1.217 ms). Sizes never changed by a byte. So a Linux number is good to a few percent, a Windows or Mac arm64 number to about a half and a macOS x86_64 timing is a rough hint. First frame and memory numbers are the median of 5 runs.

Both result sets are on c-goome dev, see [how to run it yourself](#how-to-run-it-yourself).

## The libraries

Live numbers from `gh api repos/<owner>/<repo>`, taken on 2026-11-17. Stars are GitHub stars, so they say how many people clicked, not how good it is.

| | Created | Last push | Latest release | Stars | License |
|:--|:--|:--|:--|--:|:--|
| goome ([c-goome](https://github.com/goome-ui/c-goome)) | 2026-11-02 | 2026-11-17 | v0.5.2 (2026-11-16) | 0 | GPL-3.0 |
| [Dear ImGui](https://github.com/ocornut/imgui) | 2014-07-21 | 2026-11-16 | v1.93.0 (2026-10-14) | 77,147 | MIT |
| [Nuklear](https://github.com/Immediate-Mode-UI/Nuklear) | 2019-11-26 | 2026-11-05 | v4.13.4 (2026-10-31) | 11,516 | MIT or public domain, your pick |
| [microui](https://github.com/rxi/microui) | 2018-09-22 | 2024-08-13 | none, no tags either | 6,962 | MIT |
| [Clay](https://github.com/nicbarker/clay) | 2024-07-21 | 2026-05-20 | v0.14 (2025-06-06) | 18,421 | Zlib |
| [raygui](https://github.com/raysan5/raygui) | 2016-06-15 | 2026-11-10 | 5.0 (2026-07-20) | 5,289 | Zlib |
| [LVGL](https://github.com/lvgl/lvgl) | 2016-06-08 | 2026-11-16 | v9.6.0 (2026-09-16) | 25,188 | MIT |
| [egui](https://github.com/emilk/egui) | 2019-01-13 | 2026-11-17 | 0.37.0 (2026-10-15) | 32,343 | MIT or Apache-2.0 |
| [Qt](https://github.com/qt/qtbase) (qtbase mirror) | 2013-05-06 | 2026-11-17 | none on GitHub, the docs are for 6.12 | 3,137 | LGPLv3, GPLv3 or commercial |
| [GTK](https://github.com/GNOME/gtk) (GitHub mirror) | 2012-06-03 | 2026-11-17 | 4.24.1 (from its NEWS file) | 1,717 | LGPL-2.1 or later |
| [Electron](https://github.com/electron/electron) | 2013-04-12 | 2026-11-17 | v45.3.3 (2026-11-14) | 123,955 | MIT |
| [Tauri](https://github.com/tauri-apps/tauri) | 2019-07-13 | 2026-11-17 | tauri 2.12.6 on crates.io | 113,132 | Apache-2.0 or MIT |

raygui is the GUI half of the raylib stack, so where a row says raygui the numbers are raygui on raylib 6.2. Licenses are from each repo's LICENSE files, the [Qt licensing page](https://doc.qt.io/qt-6/licensing.html) and [gtk.org](https://www.gtk.org/). The Qt and GTK stars are from their GitHub mirrors, the real repos live on Qt's and GNOME's own gitlabs, so those two numbers dont say much.

Where goome loses here, plainly:

- it is 3 weeks old, has 0 stars, and I am the only one who has tested it. ImGui has 12 years of bug reports behind it
- the GPL-3.0 means that if you share something made with goome you have to share your source under the same license. Every other library in the table except Qt and GTK (LGPL) lets you keep your code closed
- the ecosystem is tiny. No third party widgets, no Stack Overflow answers, no editor like Qt Designer
- no docking, see below

## What each one is

| | Language | Single file | What a window needs | How it draws | Bindings |
|:--|:--|:--|:--|:--|:--|
| goome | C99 | yes, `goome.h` | nothing, libc only. X11, Wayland, fontconfig and the rest load at runtime when they are there | immediate mode, own CPU rasterizer into a window or a buffer. GPU backends are optional | 9 more languages in the repos, see above |
| Dear ImGui | C++ | no, 4 `.cpp` files (`misc/single_file/imgui_single_file.h` just includes them) | the core has no deps, its own example uses GLFW + OpenGL 3 | immediate mode, outputs draw lists, you render them | none official. The README lists 26 third party ones |
| Nuklear | C89 | yes, `nuklear.h`, 31,471 lines | nothing in the core, but it makes no window and no renderer. Its demo uses GLFW + OpenGL 3 + GLEW | immediate mode, command list or vertex buffer | none official, 12 third party repos for 10 languages |
| microui | C89 | one `.c` and one `.h`, about 1,500 lines | nothing in the core, the demo uses SDL2 + OpenGL | immediate mode, command list | none |
| raygui | C | the `raygui.h` yes, but it needs raylib (59,339 lines) | raylib, which brings GLFW and OpenGL | immediate mode through raylib, GL or raylib's software renderer | none for raygui, raylib lists 70+ third party |
| Clay | C99 | yes, `clay.h`, about 4.8k lines | nothing. It only does layout, you pick a renderer | layout only, outputs a sorted render command array | 2 listed (Odin, Rust) |
| LVGL | C | no, a big tree configured with `lv_conf.h` | nothing, a PC window needs SDL2 or another driver | retained widgets, software rasterizer with optional GPU units | 4 pages in its docs (MicroPython, PikaScript, JavaScript, C++ marked in progress) |
| egui | Rust | no, a cargo workspace | `eframe` brings winit and glow or wgpu | immediate mode, outputs triangle meshes | none, "if you are not using Rust, egui is not for you" |
| Qt 6 Widgets | C++ | no | the Qt shared libs and plugins, or a static build | retained widgets, raster paint engine | PySide6 is official, the rest are third party |
| GTK 4 | C | no | system GTK, glib, pango, cairo, harfbuzz, graphene, epoxy | retained widgets, GSK scene graph | maintained: C++, D, Go, Java, Guile, JavaScript, Perl, Python, Rust, Vala (which ones cover 4 and not 3 I didnt check) |
| Electron | JavaScript | no | ships Chromium and Node inside every app | the DOM, Chromium paints it | n/a, native code through Node addons |
| Tauri 2 | Rust | no | the OS webview: WebView2, WKWebView or WebKitGTK | the DOM in the system webview | n/a, a JS api for the webview |

Sources: [ImGui README](https://github.com/ocornut/imgui/blob/master/docs/README.md), [Nuklear README](https://github.com/Immediate-Mode-UI/Nuklear/blob/master/README.md), [microui README](https://github.com/rxi/microui/blob/master/README.md), [raygui](https://github.com/raysan5/raygui/blob/master/README.md) and [raylib](https://github.com/raysan5/raylib/blob/master/README.md), [Clay README](https://github.com/nicbarker/clay/blob/main/README.md), [LVGL docs](https://github.com/lvgl/lvgl/tree/master/docs/src/integration), [egui README](https://github.com/emilk/egui/blob/main/README.md), [GTK bindings](https://www.gtk.org/docs/language-bindings/), [Qt for Python](https://doc.qt.io/qtforpython-6/), [Electron](https://github.com/electron/electron/blob/main/docs/tutorial/native-code-and-electron.md), [Tauri](https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/concept/architecture.mdx). I read all of them on 2026-11-17, and grepped the actual source of the C and Rust libraries instead of trusting the READMEs.

## The hard parts

Text shaping, screen readers, IME, docking and the browser. Yes, no or partial, with what the library itself says.

| | Shaping and RTL | Screen readers | IME (preedit) | Docking | Browser (wasm) |
|:--|:--|:--|:--|:--|:--|
| goome | Arabic and Hebrew shaping, bidi, color emoji and fallback fonts, tests hash the pixels. No GPOS or contextual GSUB, no Indic or Thai ([details](emoji-rtl.md#whats-left-out)) | tree is handed to AT-SPI, UI Automation and NSAccessibility. What was and wasnt checked is [below](#typing-and-screen-readers) | yes on X11, Wayland, Windows and Mac, with preedit events. In CI one engine passed, see [below](#typing-and-screen-readers) | no | yes for apps (not overlays), `goome build --web` |
| Dear ImGui | no, the README says text shaping, RTL and bidi are not supported ([README](https://github.com/ocornut/imgui/blob/master/docs/README.md)) | no, same sentence | partial. It only tells the OS where the candidate window goes, it never shows the preedit string | the `docking` branch only, not master ([FAQ](https://github.com/ocornut/imgui/blob/master/docs/FAQ.md)) | yes, Emscripten examples for SDL2, SDL3 and GLFW ([BACKENDS](https://github.com/ocornut/imgui/blob/master/docs/BACKENDS.md)) |
| Nuklear | no, UTF-8 only | no | partial. You feed it finished runes with `nk_input_unicode`, no preedit | no | no official build. One `__EMSCRIPTEN__` guard in the header, nothing in the repo builds or ships a web demo |
| microui | no, text size is a callback you write | no | partial. `mu_input_text` takes finished UTF-8, the demo ignores `SDL_TEXTEDITING` | no | only a third party browser demo linked from the README |
| raygui + raylib | no, raylib says text drawing does not support RTL or ligatures | no | partial. Finished codepoints only, no preedit | no | yes through raylib's Web platform |
| Clay | no, you write the text measure callback | no | no text input at all | no | yes, "15kb uncompressed .wasm" per the README |
| LVGL | partial. Bidi and Arabic forms exist but are off by default, Indic is limited, no HarfBuzz | no | partial. Ships its own Pinyin keyboard widget, the SDL driver forwards `SDL_TEXTINPUT` only | no | yes through Emscripten, `lv_web_emscripten` |
| egui | partial. Shapes with `harfrust` since 0.35, no bidi (`TODO heed bidi characters` in the source) | yes with AccessKit on desktop. On the web only an experimental speech reader | yes, `Ime::Preedit` through winit, composition events on the web | no, a separate crate `egui_tiles` exists | yes |
| Qt 6 Widgets | yes, HarfBuzz is bundled | yes, UI Automation, NSAccessibility, AT-SPI. Qt for WebAssembly only basic, tested with VoiceOver | yes, per platform input contexts | yes, `QDockWidget` | yes, Qt for WebAssembly, Widgets are in the tested list |
| GTK 4 | yes, Pango, HarfBuzz and FriBidi | Orca through AT-SPI by default. Windows and macOS only through an AccessKit build that is off by default | yes, per backend im contexts | no in core, GNOME's libpanel adds it on top of libadwaita | no. Broadway streams a native app to a browser, it is not wasm |
| Electron | inherited from Chromium, Electron has no docs for it | yes, the Chromium tree. Switches on when a reader is running | yes, from Chromium, no Electron docs for it | no, web libraries like dockview do it inside one window | n/a, the app is not compiled to wasm, the Chromium inside can run wasm |
| Tauri 2 | whatever the OS webview does | whatever the OS webview does, Tauri documents nothing | the OS webview, undocumented in Tauri | no, same web libraries | n/a, the front end may contain wasm, the Rust side is native |

Sources: [Qt accessibility](https://doc.qt.io/qt-6/accessible.html), [Qt wasm](https://doc.qt.io/qt-6/wasm.html), [QDockWidget](https://doc.qt.io/qt-6/qdockwidget.html), [GTK meson.build](https://github.com/GNOME/gtk/blob/main/meson.build), [GTK a11y backends](https://github.com/GNOME/gtk/blob/main/gtk/a11y/meson.build), [Broadway](https://github.com/GNOME/gtk/blob/main/docs/reference/gtk/broadway.md), [libpanel](https://gitlab.gnome.org/GNOME/libpanel), [Electron accessibility](https://github.com/electron/electron/blob/main/docs/tutorial/accessibility.md), [Tauri webview versions](https://github.com/tauri-apps/tauri-docs/blob/v2/src/content/docs/reference/webview-versions.md), [egui releases](https://github.com/emilk/egui/blob/main/RELEASES.md), [egui-winit IME](https://github.com/emilk/egui/tree/main/crates/egui-winit), [LVGL browser](https://github.com/lvgl/lvgl/blob/master/docs/src/integration/pc/browser.mdx). Checked 2026-11-17. For Electron I found no doc of its own about shaping or IME, so those cells say it comes from Chromium. I did not read Chromium's source for the HarfBuzz part.

goome has no docking, so if you want a dockable tool window layout, that alone rules goome out.

## Clicking through

This is what goome is built around. A transparent window the OS lets clicks fall through, except where you drew something.

| | Transparent window | Click-through, whole window | Click-through, only where you didnt draw | Wayland |
|:--|:--|:--|:--|:--|
| goome | yes, overlay mode | yes, no hit rects means all of it | yes, built in. You send the hit rects with every frame and goome keeps the OS input region in step, see [Hit rects](hit-rects.md) | layer-shell, XWayland and GNOME all work, table [below](#wayland-compositors) |
| Dear ImGui | no API. The docking branch uses `GLFW_MOUSE_PASSTHROUGH` only for dragged viewports | no | no | no |
| Nuklear, microui, Clay, LVGL | no window code | no | no. Clay has element to element pass-through inside its layout, not at the OS | no |
| raygui + raylib | yes, `FLAG_WINDOW_TRANSPARENT` | yes, `FLAG_WINDOW_MOUSE_PASSTHROUGH`, only on the GLFW and RGFW backends, the SDL backend logs not supported, needs an undecorated window | no | follows GLFW or RGFW, I didnt check |
| egui | yes, `with_transparent` | yes, `ViewportCommand::MousePassthrough` (winit's hit test) | no region api, you would toggle it yourself | follows winit |
| Qt 6 Widgets | yes, `WA_TranslucentBackground` | yes, `Qt::WindowTransparentForInput` | yes through `setMask`, per the docs it is a hint. On macOS the source only masks the drawing, so per region input there is not confirmed | yes in the Qt source (empty or masked input region), not in the docs |
| GTK 4 | yes, RGBA surface and a compositor | yes, an empty input region | yes, `gdk_surface_set_input_region` on X11, Wayland and Win32. macOS collapses it to the bounding rectangle, Broadway ignores it | yes, `wl_surface_set_input_region` |
| Electron | yes, but "you cannot click through the transparent area" | yes, `setIgnoreMouseEvents`, all 3 desktop OSes | no region api. `forward: true` lets you toggle it from the page, macOS and Windows only | the docs on `main` say X11 and Wayland, I did not check that this is in 45.x |
| Tauri 2 | yes | yes, `set_ignore_cursor_events` | no, one bool | not documented. The Linux code (tao on GTK 3) should work, I did not run it |

Sources: [Qt namespace docs](https://github.com/qt/qtbase/blob/dev/src/corelib/global/qnamespace.qdoc), [qwaylandwindow.cpp](https://github.com/qt/qtbase/blob/dev/src/plugins/platforms/wayland/qwaylandwindow.cpp), [gdk_surface_set_input_region](https://github.com/GNOME/gtk/blob/main/gdk/gdksurface.c), [Electron BrowserWindow](https://github.com/electron/electron/blob/main/docs/api/browser-window.md), [Electron custom window styles](https://github.com/electron/electron/blob/main/docs/tutorial/custom-window-styles.md), [Tauri window](https://github.com/tauri-apps/tauri/blob/dev/crates/tauri/src/window/mod.rs), [tao](https://github.com/tauri-apps/tao/blob/dev/src/platform_impl/linux/event_loop.rs), [raylib platform code](https://github.com/raysan5/raylib/tree/master/src/platforms), [egui ViewportBuilder](https://docs.rs/egui/latest/egui/viewport/struct.ViewportBuilder.html), [ImGui backends](https://github.com/ocornut/imgui/blob/docking/backends/imgui_impl_glfw.cpp). Checked 2026-11-17. The Qt, GTK, Electron and Tauri cells come from reading docs and source, I did not run any click-through test for them, the way I did for goome in the [Wayland and X11 tables](#linux-window-managers-and-compositors).

The others can do the "whole window passes clicks" half. Qt and GTK can do the per region half too. Per region with the API being a list of rects you pass every frame, same thing you draw with, is the goome part.

## Size, build time, startup, memory and frame cost

The same two scenes in every library, written the way that library wants them written, default theme and default font:

- **hello**: one window titled Hello, a label "hello world", a button "Click me", a label "clicks: 0"
- **dash**: one 960x640 window with 50 rows, each row a label "row N", a button "Open", a checkbox "On" and a slider "Value", all on one line. All 50 rows are submitted every frame, nothing is virtualized

`n/a` is never a shrug. Each one has a note under its table that says what ran and what happened. A runner with no GPU and no OpenGL driver is a fact about the runner, so I say that and do not call it a bug in the library.

### Binary size

Stripped hello, `-Os` and gc-sections where the toolchain does that, Rust with `opt-level=s`, lto and strip. This is the **hello with no window system and no GPU** (a null backend), what each library costs by itself:

| Library | Linux | Windows | macOS arm64 | macOS x86_64 |
|:--|:--|:--|:--|:--|
| goome 0.5.2 | 584 KB | 427 KB | 483 KB | 504 KB |
| Dear ImGui | 394 KB | 780 KB | 421 KB | 418 KB |
| Nuklear | 126 KB | 259 KB | 135 KB | 126 KB |
| microui | 18.1 KB | 295 KB | 34.5 KB | 18.1 KB |
| Clay | 62.3 KB | 83.5 KB | 90.6 KB | 76.5 KB |
| LVGL | 426 KB | 2.9 MB | 470 KB | 453 KB |
| raygui (raylib) | 604 KB | 622 KB | 168 KB | 159 KB |
| egui | 3.1 MB | 3.0 MB | 2.2 MB | 2.9 MB |
| Qt 6 Widgets | 22.4 KB | 46.5 KB | 73.5 KB | 36.9 KB |
| GTK 4 | 14.1 KB | 40.5 KB | 34.3 KB | 9.9 KB |
| Electron | 274 MB | 357 MB | 257 MB | 261 MB |
| Tauri 2 | 3.4 MB | 3.0 MB | 3.0 MB | 3.2 MB |



What is in each number, because they are not the same thing:

- **goome** is the whole thing, the executable also contains the X11, Wayland, Win32 or Cocoa window code, fonts, the software rasterizer, IME and accessibility. It is the only library in the table that opens a window with nothing else linked in. The same exe is the "real window" one below
- **ImGui, Nuklear, microui, Clay** are the library plus a hello that runs the ui and walks the output. No window, no renderer. microui and Clay use a fixed 8 pixel wide text measure stub instead of a font, so they are smaller than they would be with one
- **LVGL** is the core, widgets, default theme, Montserrat 14 and its software renderer into a RAM framebuffer. On Windows it is 2.9 MB, I did not find out why. Linux, macOS arm64 and x86_64 are 426 to 470 KB for the same source
- **raygui** is raygui and raylib built with its memory platform (the `rlsw` software rasterizer, no window). The Mac numbers are much smaller than Linux and Windows, I did not find out why
- **egui** is egui, epaint and emath with the default fonts, tessellating, no window
- **Qt and GTK**: the stripped exe is tiny because everything is in shared libraries. GTK cant run without a display, there is no null backend. Their real cost is in the next table
- **Electron** has no null backend. Every app is the whole Chromium runtime, so the number is the size of `node_modules/electron/dist` after `npm install`
- **Tauri** has no null backend either, the number is the release binary with the html embedded. The OS webview is not counted

microui is 295 KB on Windows against 18 KB on Linux and 18 KB on macOS x86_64, same source and flags. That looks wrong but it is what the runner gave me, twice (the second run gave the same 302,080 bytes). The only thing I can point at is that microui formats and parses numbers with `sprintf` and `strtod`, and the MinGW C runtime pulls a lot in for those. I did not confirm that by looking at the link map.

Now with a real window, still stripped, plus what the executable needs next to it:

| Library | Linux | Windows | macOS arm64 | macOS x86_64 |
|:--|:--|:--|:--|:--|
| goome 0.5.2 | 584 KB (same exe) | 427 KB (same exe) | 483 KB (same exe) | 504 KB (same exe) |
| Dear ImGui | 430 KB | 1.0 MB | 444 KB | 449 KB |
| Nuklear | n/a<sup>1</sup> | n/a<sup>1</sup> | n/a<sup>1</sup> | n/a<sup>1</sup> |
| microui | n/a<sup>2</sup> | n/a<sup>2</sup> | n/a<sup>2</sup> | n/a<sup>2</sup> |
| Clay | n/a<sup>3</sup> | n/a<sup>3</sup> | n/a<sup>3</sup> | n/a<sup>3</sup> |
| LVGL | 458 KB | 562 KB | 493 KB | 484 KB |
| raygui (raylib) | 801 KB | 640 KB | n/a<sup>4</sup> | 382 KB |
| egui | 4.9 MB | 4.5 MB | 3.4 MB | 4.1 MB |
| Qt 6 Widgets | 22.4 KB + 20 MB shared libs | 46.5 KB + 31 MB shared libs | 73.5 KB + 37 MB shared libs | 36.9 KB + 42 MB shared libs |
| GTK 4 | 14.1 KB + 19 MB shared libs | 40.5 KB + 23 MB shared libs | 34.3 KB + 25 MB shared libs | 9.9 KB + 22 MB shared libs |
| Electron | 274 MB installed | 357 MB installed | 257 MB installed | 261 MB installed |
| Tauri 2 | 3.4 MB + system webview | 3.0 MB + system webview | 3.0 MB + system webview | 3.2 MB + system webview |

1. Nuklear has no window code of its own, so there is no window to time. I did not build one of its GLFW or SDL demos.
2. microui has no window code of its own, so there is no window to time. I did not build its SDL2 demo.
3. Clay only does layout and produces render commands, it has no window or renderer, so there is no window to time.
4. raygui: raylib 6.2 with GLFW, the link of the real window hello failed with the undefined symbol CAMetalLayer, the link line in my harness was missing the QuartzCore framework. I fixed the line and re-ran, but the macOS arm64 runner pool did not give the re-run a machine (2 tries, each cancelled after 15 minutes in the queue). The x86_64 re-run linked.

ImGui's number is its own `example_glfw_opengl3` style hello (ImGui + GLFW backend + OpenGL 3 backend) on top of a shared GLFW, the executable only. Nuklear, microui and Clay make no windows, so they have no row here.

### Compile time

Best of 3, wall seconds, `-Os`, **including the library's implementation**, so ImGui is its 4 `.cpp` files, LVGL is all 483 of its files compiled with 4 jobs, and egui and Tauri are a clean `cargo build --release` of the whole dependency tree (Tauri only once, a cold build, not best of 3). Qt and GTK only compile the hello, the libraries already exist on the machine.

| Library | Linux | Windows | macOS arm64 | macOS x86_64 |
|:--|:--|:--|:--|:--|
| goome 0.5.2 | 6.2 s | 10.7 s | 6.1 s | 10.2 s |
| Dear ImGui | 11.5 s | 22.0 s | 6.9 s | 26.2 s |
| Nuklear | 3.7 s | 6.7 s | 2.3 s | 5.8 s |
| microui | 0.28 s | 0.65 s | 0.28 s | 0.61 s |
| Clay | 1.1 s | 2.0 s | 0.83 s | 1.8 s |
| LVGL | 17.1 s | 35.8 s | 16.6 s | 32.5 s |
| raygui (raylib) | 10.3 s | 22.0 s | n/a<sup>1</sup> | 23.2 s |
| egui | 44.5 s | 89.2 s | 82.6 s | 262.1 s |
| Qt 6 Widgets | 1.2 s | 2.4 s | 3.0 s | 6.6 s |
| GTK 4 | 0.28 s | 0.66 s | 1.0 s | 1.3 s |
| Electron | n/a<sup>2</sup> | n/a<sup>2</sup> | n/a<sup>2</sup> | n/a<sup>2</sup> |
| Tauri 2 | 122.7 s | 314.5 s | 181.5 s | 484.8 s |

1. raygui: raylib 6.2 with GLFW, the link of the real window hello failed with the undefined symbol CAMetalLayer, the link line in my harness was missing the QuartzCore framework. I fixed the line and re-ran, but the macOS arm64 runner pool did not give the re-run a machine (2 tries, each cancelled after 15 minutes in the queue). The x86_64 re-run linked.
2. Electron has no compile step, the app is JS and HTML run by the stock Electron binary.

goome compiles in about 6 seconds on Linux because it is one 34k line C file that includes everything. A project that includes `goome.h` without `GOOME_IMPLEMENTATION` pays 0.03 to 0.11 s for the declarations only (0.025 s on Linux, 0.07 on Windows, 0.04 on macOS arm64, 0.11 on macOS x86_64). That is the number you pay on every file but one.

### Start to first frame and memory

Process start to the first frame being presented in a real window, median of 5 runs, with the resident memory (RSS) of the process at that point. For Electron and Tauri it is all the processes of the app added together.

| Library | Linux | Windows | macOS arm64 | macOS x86_64 |
|:--|:--|:--|:--|:--|
| goome 0.5.2 | 36 ms, 8 MB | 76 ms, 31 MB | 293 ms, 96 MB | 261 ms, 46 MB |
| Dear ImGui | 59 ms, 104 MB | n/a<sup>1</sup> | n/a<sup>2</sup> | n/a<sup>2</sup> |
| Nuklear | n/a<sup>3</sup> | n/a<sup>3</sup> | n/a<sup>3</sup> | n/a<sup>3</sup> |
| microui | n/a<sup>4</sup> | n/a<sup>4</sup> | n/a<sup>4</sup> | n/a<sup>4</sup> |
| Clay | n/a<sup>5</sup> | n/a<sup>5</sup> | n/a<sup>5</sup> | n/a<sup>5</sup> |
| LVGL | 87 ms, 122 MB | 78 ms, 34 MB | 445 ms, 82 MB | 366 ms, 38 MB |
| raygui (raylib) | 74 ms, 102 MB | n/a<sup>6</sup> | n/a<sup>7</sup> | n/a<sup>8</sup> |
| egui | 78 ms, 109 MB | n/a<sup>6</sup> | 395 ms, 93 MB | 975 ms, 48 MB |
| Qt 6 Widgets | 29 ms, 30 MB | 94 ms, 31 MB | 711 ms, 93 MB | 959 ms, 48 MB |
| GTK 4 | 73 ms, 96 MB | 398 ms, 87 MB | 526 ms, 97 MB | 1334 ms, 45 MB |
| Electron | 218 ms, 602 MB | 310 ms, 275 MB | 1024 ms, 371 MB | 2136 ms, 227 MB |
| Tauri 2 | 687 ms, 324 MB | 553 ms, 287 MB | 2116 ms, 93 MB | 1102 ms, 45 MB |

1. ImGui with GLFW and OpenGL 3: glfwCreateWindow failed on the Windows runner with "WGL: The driver does not appear to support OpenGL". The runner has no GPU driver and the Mesa build I tried ships no opengl32.dll. That is the runner, not ImGui.
2. ImGui with GLFW and OpenGL 3: glfwCreateWindow failed on the macOS runner with "NSGL: Failed to find a suitable pixel format" (core 3.2 and legacy contexts both tried). On the arm64 runner the attempt also hung for 30 minutes, so I stopped running it. The macOS VM has no usable OpenGL, that is the runner, not ImGui.
3. Nuklear has no window code of its own, so there is no window to time. I did not build one of its GLFW or SDL demos.
4. microui has no window code of its own, so there is no window to time. I did not build its SDL2 demo.
5. Clay only does layout and produces render commands, it has no window or renderer, so there is no window to time.
6. raygui: both variants (GLFW with Mesa, and raylib native Win32 with its software renderer) started but never printed READY, stderr empty. I did not find out why.
7. raygui: raylib 6.2 with GLFW, the link of the real window hello failed with the undefined symbol CAMetalLayer, the link line in my harness was missing the QuartzCore framework. I fixed the line and re-ran, but the macOS arm64 runner pool did not give the re-run a machine (2 tries, each cancelled after 15 minutes in the queue). The x86_64 re-run linked.
8. raygui: the real window hello linked and started on the Intel runner but never printed READY (stderr empty). ImGui fails on the same runners with an NSGL pixel format error, so I think it is the missing OpenGL on the runner, but I did not confirm that.

Linux is Xvfb with Mesa llvmpipe, so the GL libraries are drawing on the CPU. goome does not use GL for this, it draws itself. The Macs and the Windows runner are VMs, startup there is dominated by the VM and a window server that has no GPU, which is why every Mac number is 260 ms and up. Qt starts quickest on Linux (29 ms) and goome is second (36 ms). On Windows Qt (94 ms) and goome (76 ms) are close, GTK takes 398 ms. Electron and Tauri start slowest: Tauri 687 ms on Linux and 2,116 ms on macOS arm64, Electron 218 ms on Linux and 2,136 ms on macOS x86_64.

Memory: goome is the smallest only on Linux, 8 MB against Qt 30 MB, GTK 96 MB, ImGui 104 MB, egui 109 MB and LVGL 122 MB. On Windows it ties with Qt (31 MB, LVGL is 34 MB). On macOS arm64 goome is 96 MB, about the same as Qt, GTK, egui and Tauri (92 to 97 MB), and LVGL is lower at 82 MB. On macOS x86_64 goome is 46 MB, LVGL is 38 MB. I did not dig into why the Mac and Windows windows cost goome more than Linux (its offscreen run is 6 to 23 MB everywhere). The Electron number is 602 MB on Linux across 6 processes.

### Frame cost

The first thing to say is that the libraries stop at different places, so a single table would lie. Every frame below goes **from the start of the ui build up to the point listed in the "stops at" column**. Milliseconds per frame, the average of 2,000 frames after 100 warm up frames, no vsync, the dashboard scene:

| Library | Linux | Windows | macOS arm64 | macOS x86_64 |
|:--|:--|:--|:--|:--|
| goome 0.5.2 | 2.63 | 4.52 | 3.60 | 7.20 |
| Dear ImGui | 0.0315 | 0.0536 | 0.0283 | 0.0952 |
| Nuklear | 0.168 | 0.237 | 0.208 | 0.467 |
| microui | 0.0180 | 0.0442 | 0.0211 | 0.0968 |
| Clay | 0.146 | 0.220 | 0.0971 | 0.275 |
| LVGL | 0.603 | 0.727 | 0.564 | 1.74 |
| raygui (raylib) | 5.59 | 5.87 | n/a<sup>1</sup> | n/a<sup>1</sup> |
| egui | 0.760 | 0.772 | 0.681 | 1.43 |
| Qt 6 Widgets | 1.80 | 3.08 | 8.70 | 35.4 |
| GTK 4 | 4.14 | 9.93 | 11.5 | 26.2 |
| Electron | 0.933 | 1.36 | 1.26 | 3.97 |
| Tauri 2 | 1.95 | 1.32 | 1.44 | 4.05 |

1. raylib built with its memory platform printed 0.0 ms per frame on macOS, which cannot be right (nothing drawn or a timer that returns 0). Linux and Windows worked. There is no valid number, and no real window number either, see the first frame table.

| Library | The frame stops at | What that means |
|:--|:--|:--|
| goome | CPU rasterized 960x640 frame in memory (offscreen mode) | ui and every pixel. This is the number to put next to LVGL, raygui, Qt and GTK |
| Dear ImGui | draw lists (`ImDrawData`) | no pixels. You still send these to a GPU |
| Nuklear | `nk_convert` vertex, element and command buffers | no pixels |
| microui | command list walked with `mu_next_command` | no pixels, no real text measuring |
| Clay | render command array | layout only, no widgets, no pixels, no real text measuring. Its buttons and sliders are plain boxes with no hover or drag |
| LVGL | full software render into a RAM framebuffer, screen invalidated each frame | pixels. The widgets are built once, only the redraw is timed, so it skips the per frame submit of 50 rows |
| raygui | raylib's `rlsw` software rasterizer, 960x640, plus the framebuffer copy | pixels. Linux and Windows only, see the note |
| egui | tessellated triangle meshes | no pixels |
| Qt 6 Widgets | layout and `QWidget::render` into a `QImage` with the raster engine, offscreen platform | pixels |
| GTK 4 | measure, allocate, snapshot and `gsk_render_node_draw` into a cairo image | pixels |
| Electron | the DOM scene changed, then forced style and layout (`offsetHeight`), no paint | retained DOM, layout only |
| Tauri 2 | same as Electron, in the OS webview | retained DOM, layout only |

The "no pixels" libraries are 3 to 150 times faster than goome on this table because they do less (egui 3.5 times, Nuklear and Clay about 16 and 18, ImGui about 80, microui about 150). The honest comparison for the dashboard is goome (2.63 ms Linux) against the ones that also fill the pixels in software: LVGL 0.60, Qt 1.80, GTK 4.14 and raygui 5.59. LVGL is the fastest of that group, but it is retained: its 50 rows were created once, the table above measures redrawing them, not rebuilding them. goome and raygui rebuild all 50 rows every frame. When nothing changes goome skips the frame and costs 0.0015 ms (see the first table).

The hello frame is the same story with a small scene:

| Library | Linux | Windows | macOS arm64 | macOS x86_64 |
|:--|:--|:--|:--|:--|
| goome 0.5.2 | 1.87 | 3.10 | 2.59 | 4.91 |
| Dear ImGui | 0.0029 | 0.0047 | 0.0021 | 0.0067 |
| Nuklear | 0.0100 | 0.0133 | 0.0112 | 0.0298 |
| microui | 0.0003 | 0.0007 | 0.0003 | 0.0011 |
| Clay | 0.0024 | 0.0038 | 0.0014 | 0.0031 |
| LVGL | 0.135 | 0.120 | 0.0769 | 0.135 |
| raygui (raylib) | 1.04 | 1.43 | n/a<sup>1</sup> | n/a<sup>1</sup> |
| egui | 0.0089 | 0.0107 | 0.0155 | 0.0337 |
| Qt 6 Widgets | 0.0551 | 0.0845 | 0.119 | 0.397 |
| GTK 4 | 0.120 | 0.234 | 0.297 | 0.787 |
| Electron | 0.0127 | 0.0185 | 0.0246 | 0.134 |
| Tauri 2 | 0.0770 | 0.0201 | 0.0410 | 0.130 |

1. raylib built with its memory platform printed 0.0 ms per frame on macOS, which cannot be right (nothing drawn or a timer that returns 0). Linux and Windows worked. There is no valid number, and no real window number either, see the first frame table.

goome's hello frame is 1.87 ms on Linux, almost the same as the dashboard, because both fill the same 960x640 window. The 50 rows only add about 0.8 ms on top of the fill. ImGui draws the same hello into a few triangles in 0.003 ms.

Electron and Tauri also did a second version that waits for `requestAnimationFrame` so it includes paint and composite. Electron dash: 3.0 ms Linux, 4.6 Windows, 4.3 macOS arm64, 9.2 macOS x86_64. Tauri dash: 14.6, 15.6, 18.0 and 69.8 ms, which is the webview's frame pacing (about 16 ms is 60 Hz), not how long it works. The runners might also cap it, so treat the Tauri numbers as a lower limit of "can paint at 60 Hz", not as speed.

## Where goome works

Everything in this section is something I built or ran in GitHub Actions on 2026-11-16 or 2026-11-17, and says which. "Built" means it compiled and nothing more. "Ran" means a program used it and a check passed. The runners are VMs with no GPU, and none of them is a person at a desktop, so all of this proves "works on a clean machine with a scripted user", not "feels good".

### Platforms and window modes

| Platform | Overlay | App window | Offscreen | What ran in CI |
|:--|:--|:--|:--|:--|
| Linux, X11 | yes, X11 window with an input shape | yes | yes | 11 of 11 window managers pass the overlay checks, `x11.sh` 291 checks pass, 39,589 unit checks pass |
| Linux, Wayland | layer-shell (wlroots), XWayland (GNOME and others), see the compositor table | yes | yes | `wayland.sh` 183 checks pass on sway, then 8 compositor and distro pairs pass all 3 checks |
| Windows 10 / 11 | layered windows | yes | yes | `win32.ps1` 65 checks and `uia.ps1` 19 checks pass, 39,588 unit checks pass. The runner is Windows Server 2025, I have no run on a 10 or 11 desktop edition |
| macOS 14+ | NSPanel | yes | yes | `macos.sh` 29 and `macax.sh` 18 checks pass on arm64 (macOS 26) and x86_64 (macOS 15), 39,588 unit checks each. No run on macOS 14. `macos.sh` has no click-through check, so overlay clicks on a Mac were not tested by clicking |
| Browser | no | yes, `goome build --web` | n/a | the wasm job builds it, checks the wasm frames match the native frames and runs the web apps under node. The runner has no browser, so a browser run is only my own looking at the [Try it](try.md) page |

Run ids: the platform checks above are dev run 43976597087 (2026-11-16) and `tools/verify` run 44138128178 (2026-11-17), which is also where the compositor and IME results come from. The counts are in `tools/verify/ci-facts.json`, see [how to run it yourself](#how-to-run-it-yourself).

### Renderer and platform backends (for games and engines)

| Backend | What ran in CI | On what |
|:--|:--|:--|
| GL3 | glfw + gl3 and sdl2 + gl3 on Linux, win32 + gl3 under wine. Skipped on the real Windows runner, its GL is 1.1 "GDI Generic". Not built on macOS | Mesa llvmpipe 4.5 |
| GL2 | glfw + gl2 on Linux, win32 + gl2 on the Windows runner and under wine | llvmpipe, and Microsoft's GDI Generic GL 1.1 |
| DX9 | the frame compared with goome's software frame, worst pixel difference 0 | Windows runner, D3DDEVTYPE_HAL on a machine with no GPU (software vertex processing) |
| DX11 | same compare, difference 0 | WARP, feature level 11_0 |
| DX12 | same compare, difference 0 | WARP |
| Vulkan | same compare, difference 0, with validation layers on Linux | lavapipe on Linux and on Windows |
| Metal | offscreen render and readback, difference 0, with the Metal debug layer | the "Apple Paravirtual device" of the macOS runners, arm64 and x86_64 |
| GLFW | Linux only | Xvfb + llvmpipe |
| SDL2 | Linux only | Xvfb + llvmpipe |
| SDL3 | **never compiled or run in CI**. CI tries `apt-get install libsdl3-dev`, Ubuntu 24.04 has no such package, so the test skips itself. Afterwards I ran the `sdl3_gl` test by hand on Ubuntu 26.04 (SDL 3.4.2, gcc 15): it builds with `-Werror` and passes for gl3 and GLES 3, 1 Linux run, not CI | Mesa llvmpipe under Xvfb, by hand |
| Win32 | real Windows runner (tests, UI Automation, live desktop) and under wine | |

Source: c-goome `ci.yml` and `tests/gfx`, dev run 44116261831 (2026-11-17), main run 43957463865 (2026-11-16), logs read by me. Nothing here ran on a real GPU, and DX9, DX11 and DX12 only ran on software devices.

### Languages

Latest main CI run of each repo, 2026-11-17, "Update 0.5.2" commit, all jobs green on Linux, Windows, macOS arm64 and macOS x86_64 (Go, Lua, Node, Rust, Python, C#, Java and Godot test or build on all four, Zig builds on all four):

| Language | Repo, run | Jobs |
|:--|:--|:--|
| C | c-goome, dev run 43976597087 | linux, windows, macos x2, wasm, gfx x4 |
| C# | csharp-goome 44094642343 | tests on 4 OSes (1,472 checks on mac and Windows, 1,473 on Linux), mods, pack |
| Python | python-goome 44089870414 | linux, linux-py38, windows, macos x2 |
| Java | java-goome 44091419989 | tests on 4 OSes, jars |
| Rust | rust-goome 44089665303 | tests on 4 OSes, windows-gnu, msrv, package |
| Node | node-goome 44092945711 | build on 4 OSes, node18, install |
| Go | go-goome 44091426029 | tests on 4 OSes, Go 1.23 |
| Zig | zig-goome 44093280771 | build on 4 OSes |
| Lua | lua-goome 44089889558 | tests on 4 OSes, luarocks |
| GDScript (Godot) | godot-goome 44088405139 | build on 3 OSes, oldest Godot (4.4.1), package |

For C#, Java and Godot I read what the jobs do. The C# job compares every frame byte for byte with the C examples on Linux. For the others I only know the jobs are green, I did not read each test. On what is *not* tested, see the next table.

### Engines and tools

This is the table where goome claims the most and CI proves the least. Read the last column.

| Target | What exists | What CI actually did | What it did not do |
|:--|:--|:--|:--|
| Unity (own project) | package `com.goome-ui.goome` 0.5.2, from git, the GitHub release or OpenUPM | built the package C# against hand written UnityEngine stubs, ran GoomeSharp tests through plain .NET | no Unity editor or player ran, so "works in Unity" is built, not run |
| Unity mods, BepInEx 5 and 6 | zips on the csharp-goome 0.5.2 release | compiled against the BepInEx and Unity 2019.4.40 reference dlls, ran the mod helper against a fake Unity with the real HarmonyX (55 checks) | no game, no BepInEx loaded it |
| Unity mods, MelonLoader | one zip, Mono | compiled against the MelonLoader 0.7.2 reference dll | never loaded by MelonLoader. IL2CPP templates compile only |
| Godot 4 | addon zips on the release, not in the Asset Library | a real Godot 4.7.2 on Linux, Windows and macOS (and 4.4.1 on Linux) loads the extension and runs a scripted test, 155 ok lines on Linux, `--headless` | no window, no GPU, never drew through Godot's renderer |
| Minecraft Fabric | `goome-fabric-0.5.2.jar` on the GitHub release (MC 26.3), not on Modrinth | built the jar and checked what is inside | Minecraft was never started |
| Minecraft NeoForge | `goome-neoforge-0.5.2.jar`, same release | same as Fabric | Minecraft was never started |
| OBS plugin, Linux | `.deb` on the release | the real libobs 32.2.0 under Xvfb loads the plugin, renders the timer, a click on Start changes the frame | the OBS app itself was not started |
| OBS plugin, Windows and macOS | installer and pkg on the release | built, Windows installer silently installed and removed, both ran the pixel test against a fake libobs | OBS never loaded the plugin on either |
| VS Code extension | on the Marketplace and Open VSX, 0.5.2 | 51 tests in a real VS Code extension host on Linux, Windows and macOS | other VS Code versions, vscode.dev |
| JetBrains plugin | on the JetBrains Marketplace | 56 tests on IntelliJ Platform 2024.3.6 on all three OSes, Plugin Verifier for IC, IU, Rider, PyCharm and CLion builds | Rider, PyCharm and CLion were never started |
| raylib | `engines/raylib` example (raylib 5.5) | built and ran under Xvfb + llvmpipe for 8 seconds, Linux only | no picture check, Windows and macOS |
| SDL2 + GL3 | `engines/sdl_gl3` example, `goome_sdl2.h` | example ran 8 seconds. The c-goome sdl2 test checks pixels and input | the example has no pixel check |
| LOVE2D | `engines/love2d` example (LuaJIT FFI) | `love` from apt ran it 8 seconds on Linux | no picture check |
| Native DLL mods (Windows games) | `version.dll` mods for DX11, DX12, OpenGL, Vulkan in `examples/mods/native`. No DX9 mod | a test game with the mod loaded: menu visible in a framebuffer readback, a slider drag leaks 0 mouse messages to the game, a click on empty space still reaches it. Real Windows runner: OpenGL and D3D11. Under wine: OpenGL, D3D11 and D3D12 | the Vulkan mod only compiles, D3D12 has no log line on the Windows runner, no real game, no anti-cheat |

Sources: the workflow files and logs of the repos named, read 2026-11-17: [csharp-goome](https://github.com/goome-ui/csharp-goome/actions), [godot-goome](https://github.com/goome-ui/godot-goome/actions), [java-goome](https://github.com/goome-ui/java-goome/actions), [obs-goome](https://github.com/goome-ui/obs-goome/actions), [vscode-goome](https://github.com/goome-ui/vscode-goome/actions), [jetbrains-goome](https://github.com/goome-ui/jetbrains-goome/actions), [examples](https://github.com/goome-ui/examples/actions). The [Unity mods](mods-unity.md) page used to say it works in every Unity version and on IL2CPP, which nothing in CI backed up. It now says it has never run in a real Unity.

### Linux window managers and compositors

I ran goome against 11 X11 window managers and 12 Wayland compositors on 2 distros, in a headless CI job where a script moves a pointer and clicks. The compositors that did not work are listed with the exact line the job printed. None of those is confirmed to be a goome bug, and where I say it was the harness or the runner, that is what the log shows.

**X11, 11 of 11 pass.** For each one: goome shows up (the pixel under the overlay changes), a click inside a hit rect reaches goome, and a click outside it reaches the window below.

| Window manager | Overlay shown | Click in the hit rect reaches goome | Click outside reaches the window below |
|:--|:--|:--|:--|
| none (bare X server) | yes | yes | yes |
| i3 | yes | yes | yes |
| openbox | yes | yes | yes |
| fluxbox | yes | yes | yes |
| icewm | yes | yes | yes |
| metacity | yes | yes | yes |
| marco | yes | yes | yes |
| xfwm4 | yes | yes | yes |
| xfwm4 + picom | yes | yes | yes |
| mutter (X11) | yes | yes | yes |
| kwin (X11) | yes | yes | yes |

**Wayland.** 3 checks per compositor: **open** (goome opens an overlay), **hit** (a click inside the hit rect reaches goome), **through** (a click outside it reaches the window underneath). Ubuntu 24.04 and Arch (rolling, the day of the run):

| Compositor | Ubuntu 24.04 | Arch |
|:--|:--|:--|
| sway | pass x3, 1.9, layer-shell | pass x3, 1.12, layer-shell |
| labwc | pass x3, 0.7.1, layer-shell | pass x3, 0.20.3, layer-shell |
| wayfire | not run: wayfire 0.9.0 started and quit with "Failed to get DRM file descriptor" on the headless runner<sup>1</sup> | pass x3, 0.11.0, layer-shell |
| mutter | pass x3, 46.2, X11 overlay on XWayland with Mutter capture | pass x3, 51.1, same |
| kwin | pass x3, 5.27.11, Wayland with the portal | open failed, goome did not open, the log has nothing else<sup>2</sup> |
| weston (desktop shell) | open pass (via XWayland), hit pass, through failed<sup>3</sup> | open pass, hit failed, through pass<sup>3</sup> |
| weston (kiosk shell) | open pass, hit pass, through failed<sup>3</sup> | open pass, hit failed, through pass<sup>3</sup> |
| weston (headless backend) | open pass, no click could be sent<sup>4</sup> | open pass, no click could be sent<sup>4</sup> |
| cage | open failed: "no display to draw on"<sup>5</sup> | open pass (XWayland), hit failed, through pass<sup>5</sup> |
| river | not run, river is not in Ubuntu 24.04's packages | not started: river refused the init file the harness wrote ("contains the string riverctl")<sup>6</sup> |
| niri | not run, not in Ubuntu 24.04's packages | not started: niri 26.04 never made a Wayland socket<sup>7</sup> |
| Hyprland | not run, not in Ubuntu 24.04's packages | not started: no Wayland socket<sup>7</sup> |

So: **8 of the 24 pairs pass all 3 checks** (sway, labwc and mutter on both distros, kwin on Ubuntu, wayfire on Arch). The other 16 failed in CI, each with the reason below. I would not say goome does not work on those compositors, I would say this harness did not get a result from them.

1. wayfire 0.9.0 on Ubuntu needs a DRM device ("Failed to get DRM file descriptor, try specifying a valid WLR_RENDER_DRM_DEVICE") and the headless runner has none. wayfire 0.11.0 on Arch started and passed.
2. kwin on Arch printed no error. I did not find out why.
3. On Ubuntu (weston 13.0.0) goome opened and got the click inside its rect, but the window underneath saw only a pointer enter and no button event for the click outside. On Arch (weston 15.0.1) it is the other way round: the click inside never reached goome (its log has 2 motions and 0 button downs) while the click outside reached the window below. The clicks are sent through XWayland with X11 test input. Each compositor passes one of the two click checks on each distro, so I think it is the click injection and not goome, but I did not prove it.
4. weston's headless backend has no input device and no virtual pointer protocol, so a click cant be sent at all.
5. cage on Ubuntu could not give goome a display. On Arch goome opened through XWayland (cage has no layer-shell), the click inside the rect never arrived (the log has 2 motions and no button), and the click outside went through.
6. river printed "The init file ... contains the string riverctl" and stopped. The harness wrote that init file, so this is the harness, not goome.
7. The compositor process started, but never opened its socket in the time the job gave it. I did not read further.

Real wlroots desktops (sway, labwc, wayfire) use layer-shell, which is the clean path. GNOME and weston use an XWayland overlay. KDE Plasma 6 and COSMIC are documented as layer-shell, KWin 5.27 on Ubuntu got the portal path in this run and it passed.

### Typing and screen readers

**Typing (IME).** goome puts the IME candidate window at the caret and draws the preedit text underlined, see [Typing other languages](ime.md). What CI tried, Japanese or Chinese typed by a script into an input:

| Setup | Result |
|:--|:--|
| X11 + ibus + mozc (Japanese) | **pass.** Preedit events `n`, then `に`, and the committed text `にほんご` landed in the input |
| X11 + ibus + libpinyin | failed, the job could not make ibus switch to the engine ("Set global engine failed: Timeout was reached"), so no IME was active. goome reported no error |
| X11 + ibus + anthy | failed, the package `ibus-anthy` is not in Ubuntu 24.04's repos |
| X11 + fcitx5 (mozc, pinyin, anthy) | failed. fcitx5 registered its XIM server (`XIM_SERVERS = @server=fcitx`) and `XMODIFIERS` was set, but goome answered "no X input method here" and got no preedit. I did not find out which side is at fault, so I am not calling it either a goome bug or a harness mistake |
| Wayland (sway) + fcitx5 mozc, fcitx5 pinyin, ibus libpinyin | failed. goome reported no error but got no preedit and no text. goome's input got the plain letters (`nihao`) and no composition. I did not find out why |
| macOS x86_64, Kotoeri (Japanese) and Pinyin | failed before typing: selecting the input source with `TISSelectInputSource` returned error -50 on the runner, so the plain ABC layout stayed active and the letters arrived as letters |
| macOS arm64 | no result. The job for it was cancelled after 15 minutes |
| Windows, Microsoft Pinyin on Windows Server 2025 | failed. The zh-CN language pack installed and the text service activated (create 0, activate 0), but goome received no preedit and no text. I did not find out why |

So: **one of the 12 setups I tried ran correctly end to end (ibus + mozc on X11).** The other 11 are either things the runners cant do or things I did not find the cause of. For a real check you need a person on a desktop. The unit tests for the IME code run in the normal CI and pass.

**Screen readers.** goome builds an accessibility tree every frame and hands it to AT-SPI, UI Automation and NSAccessibility. What was checked:

| What | Result |
|:--|:--|
| The tree through the OS api, no screen reader involved | pass: `atspi.sh` 20 checks on Linux, `uia.ps1` 19 on Windows, `macax.sh` 18 on both Macs. A client asks the OS for the roles, names and values of the widgets and presses the button through the api |
| Orca 46.1 on Linux | partly. Orca started, spoke "Screen reader on." and "Name entry Bo." (the first field), but gave no speech for the button "Press me" or the "Dark mode" check box, although the script moved the focus to each one |
| NVDA 2026.3 on Windows | failed. NVDA was running and said the window title "goome a11y", but no speech line with "Press me" in it after the script moved the focus to the button |
| Narrator on Windows | no result. Narrator was running, but it has no speech log and the runner has no audio device, so what it said cant be read |
| VoiceOver on macOS x86_64 | no result. The AppleScript call to VoiceOver timed out (-1712) and the runner would not let the job turn on UI scripting |
| VoiceOver on macOS arm64 | no result, the job was cancelled |

**Nobody has used goome with a screen reader as a person**, in a real session, with a real voice. What I can say is that the tree is there, the OS api returns it, and Orca spoke the first widget. I cant say it reads well. Qt and GTK have had years of that, and Qt says it supports each OS's reader, see the table above.

## Which one should you use

Picking by what you are building, not by who has the most stars. The ones that fit better than goome are listed first where they do.

| You are making | Use | Why, and what goome does about it |
|:--|:--|:--|
| A tool window inside a game or engine you own | **Dear ImGui** | 12 years of polish, a backend for every renderer, docking on its branch, everyone already knows it. goome has an [offscreen mode](offscreen-mode.md) for the same job, plus IME, RTL and screen readers, but it has had a few weeks of use, not years |
| A desktop app people will use every day, with translations, a designer and screen readers that have been tested for years | **Qt** | the most complete one here. Docking, HarfBuzz, every OS's accessibility api, Qt Linguist and Qt Designer. Heavier (20 to 42 MB of shared libs next to the exe) and LGPL or paid |
| A GNOME or Linux first app | **GTK 4** | native on Linux and Wayland, Pango shaping, Orca. Windows and macOS are possible but the reader support there is opt-in |
| An app with web skills, the same on every OS, with the whole npm world | **Electron** | the biggest ecosystem and a real accessibility story. 257 to 357 MB installed and 227 to 602 MB of memory for a hello in my runs |
| The same, but small | **Tauri** | the Rust side is about 3 MB plus the system webview. The web part differs per OS webview and Tauri documents nothing about screen readers or IME |
| An app in Rust | **egui** | made for Rust, shapes text, has AccessKit and IME with preedit, runs in the browser. 2.2 to 3.1 MB for a hello |
| A screen on an embedded board or microcontroller | **LVGL** | thats what it is for, 426 to 470 KB on Linux and macOS for a hello with its own software renderer, runs on bare metal. goome needs an OS |
| A few widgets on top of a renderer you already have, in C, as small as possible | **microui** (18 KB), **Nuklear** (126 KB) | they give you a command list and nothing else. No window, no fonts, no accessibility. goome is bigger (about 500 KB) because it also opens the window, draws itself, shapes text and talks to the OS |
| A layout engine for your own renderer | **Clay** | layout only, 62 KB, 15 kB wasm. Not a widget kit |
| Quick tools or games with raylib | **raygui** | already there if you use raylib. No IME preedit, no accessibility |
| A dockable tool layout | **Dear ImGui (docking branch)**, **Qt**, **egui_tiles** | goome has no docking |
| A closed source app | not goome | goome is GPL-3.0, you would have to share your source. MIT, Zlib and Apache libraries in this table dont ask that, Qt and GTK do it with the LGPL if you link them dynamically |
| A **see-through overlay** that takes clicks only where you drew something: HUD, stream overlay, in game menu, sticky notes, key display | **goome** | built for it, per region click-through from the hit rects you send, works on X11, Wayland, Windows and macOS with the same code. 11 of 11 X11 window managers, 8 of 24 Wayland pairs in the harness, see above. Qt and GTK can do it with more code and a lot more weight. egui, raylib and Tauri can do the whole window only |
| App windows, overlays and offscreen drawing from one library, in C or a binding | **goome** | one 34k line file, 10 languages, a window with nothing else linked in |
| A small app you can also put in a web page | **goome** (apps only), egui, Qt for WebAssembly | goome's Brickout is 308 KB as wasm (134 KB gzipped). egui and Qt also run in a browser, and ImGui and Clay do too |
| A mod menu in someone else's game | **goome**, Dear ImGui | both do it. ImGui has the bigger pile of examples and tutorials, goome has [Unity, Minecraft and native DLL](mods.md) packages that are built, with the caveats in the engine table |

Where goome wins, in one place: single file with no libraries to link or install (you still need a C compiler), window code included in a 427 to 584 KB executable, see-through overlays with per region click-through, app windows, overlays and offscreen from one library, 10 languages, and a browser build. Where it loses: 3 weeks old, 0 stars, the GPL, no docking, a small ecosystem, no designer, a little testing with real screen readers and real IMEs, and engine support that is built but mostly not run inside the engines.

## How to run it yourself

Everything is in [c-goome](https://github.com/goome-ui/c-goome) on the `dev` branch until the next release (the links say `dev` for that reason, they will move to the tag):

- [`tools/bench`](https://github.com/goome-ui/c-goome/tree/dev/tools/bench) is the benchmark: `run.py`, `setup.py`, the shared timer in `bench_util.h`, one file per library in `libs/` and the hello and dash programs in a folder per library
- [`tools/verify`](https://github.com/goome-ui/c-goome/tree/dev/tools/verify) is the compositor, window manager, IME and screen reader checks plus `ci-facts.json` and `verify-results.json`, the raw 103 results the tables above came from
- [`tools/bench/results/2026-11-17`](https://github.com/goome-ui/c-goome/tree/dev/tools/bench/results/2026-11-17) holds the result files of the runs on this page
- [`.github/workflows/bench.yml`](https://github.com/goome-ui/c-goome/blob/dev/.github/workflows/bench.yml) and [`verify.yml`](https://github.com/goome-ui/c-goome/blob/dev/.github/workflows/verify.yml) only run by hand, they dont run on pushes

On GitHub, all libraries or just some, on all 4 OSes:

```sh
gh workflow run bench.yml -R goome-ui/c-goome --ref dev -f libs="goome imgui nuklear microui clay lvgl raygui egui qt gtk4 electron tauri"
gh workflow run verify.yml -R goome-ui/c-goome --ref dev
gh run download <run id> -R goome-ui/c-goome -D out
```

Locally, one library on your own machine (the competitors are cloned by the script, nothing of theirs is in the repo):

```sh
git clone -b dev https://github.com/goome-ui/c-goome && cd c-goome
python3 tools/bench/setup.py imgui
python3 tools/bench/run.py goome imgui --out bench.json
```

The runs on this page:

| What | Run |
|:--|:--|
| goome | All four from [44144595009](https://github.com/goome-ui/c-goome/actions/runs/44144595009) (its macOS arm64 job was cancelled twice after 15 minutes of waiting for a runner and succeeded on the third try) |
| Dear ImGui, Nuklear, microui, Clay | [44127640847](https://github.com/goome-ui/c-goome/actions/runs/44127640847), run again on the merged workflow as [44144760372](https://github.com/goome-ui/c-goome/actions/runs/44144760372) |
| LVGL, raygui, egui | [44119653691](https://github.com/goome-ui/c-goome/actions/runs/44119653691), raygui again with the macOS link fixed as [44145242865](https://github.com/goome-ui/c-goome/actions/runs/44145242865) |
| Qt, GTK 4, Electron, Tauri | [44119617770](https://github.com/goome-ui/c-goome/actions/runs/44119617770) |
| Compositors, window managers, IME, screen readers | [44138128178](https://github.com/goome-ui/c-goome/actions/runs/44138128178) (verify) |
| Unit and platform check counts | [43976597087](https://github.com/goome-ui/c-goome/actions/runs/43976597087) (ci on dev) |

How the numbers were taken:

- sizes: `strip` after the build, `-Os` with `-ffunction-sections -fdata-sections` and `--gc-sections` or `-dead_strip`, Rust with `opt-level=s`, lto and strip
- compile: best of 3 wall clock seconds including the library's own source (egui and Tauri are clean cargo builds, Tauri once)
- first frame and memory: the hello prints READY after the first frame is presented, 5 runs, median, RSS summed over the process tree
- frame cost: 100 warm up frames then 2,000 timed frames per scene, no vsync, `bench_now_ms` from `bench_util.h`, or the language's monotonic clock
- the ImGui real window numbers are Linux only because the macOS and Windows runners have no usable OpenGL, and raygui and egui had the same kind of trouble where the tables say so
- the competitor versions are the ones in the "latest release" column, from `git clone --depth 1 --branch <tag>` where a tag exists, and the commit of each is in the result files

## Sources

Every link is next to the thing it backs up, in the tables above. Library facts were read on 2026-11-17 from each project's own repo and docs. Live numbers (stars, dates, releases) came from `gh api repos/<owner>/<repo>` the same day.

Last checked: **2026-11-17**. If something here is out of date, [open an issue](https://github.com/goome-ui/docs/issues), the numbers are cheap to run again.
