---
title: Home
permalink: /
---

# goome docs

**[Try it in your browser](try.md)** <kbd>0.5.2</kbd>, a game and an app made with goome, running right here.

See-through overlays, normal app windows, game mod menus and engine ui for any C program. One file, no dependencies, Linux, Windows, Mac. Hotkeys, screen grabs, fonts, images and a UI kit are in there too.

One header (`goome.h`), nothing to link. Linux (X11 and Wayland), Windows 10 / 11 and macOS 14+, from C, C#, Python, Java, Rust, Node, Go, Zig or Lua. Theres a Godot addon and an OBS plugin too. The library itself needs nothing but libc, you still need a C compiler to build with it from C, and Go, Rust, Node and Lua compile it for you on install (C#, Java and the Python wheels ship it prebuilt). What CI has and hasnt run is on [Where it works](platforms.md#what-ci-actually-ran) and [Compare](compare.md#where-goome-works), the CI machines are Ubuntu 24.04, Windows Server 2025 and macOS 15 / 26.

## Getting going

**Overlay on top of everything.** The default:

```c
goome *g = goome_open(&(goome_opts){.title = "my overlay"}, NULL);
```

More in [Overlay mode](overlay-mode.md).

**A normal app** <kbd>0.2</kbd>. Resizable window with the UI kit in it:

```c
goome *g = goome_open_app("My app", 960, 640, NULL);
```

Same call in the bindings: `Goome.OpenApp` in C#, `goome.open_app` in Python, `Goome.openApp` or `new App` in Java, `goome::App::new` in Rust, `new goome.App` in Node, `goome.NewApp` in Go, `Goome.openApp` in Zig and `goome.app` in Lua. [Window mode](window-mode.md) has the rest.

**Inside Unity, Godot or another engine** <kbd>0.2</kbd>. No OS window, goome draws into a buffer and your engine shows it as a texture:

```c
goome *g = goome_open(&(goome_opts){.mode = GOOME_MODE_OFFSCREEN, .width = 640, .height = 400}, NULL);
```

See [Offscreen mode](offscreen-mode.md). For Unity there's [a page](start-unity.md). Godot doesnt need any of this by hand, its [one node](start-godot.md).

Full programs are on [Getting started in C](start-c.md), [C#](start-csharp.md), [Python](start-python.md), [Java](start-java.md), [Rust](start-rust.md), [Node](start-node.md), [Go](start-go.md), [Zig](start-zig.md) and [Lua](start-lua.md). Or skip the setup with `goome new`, see [Templates and goome new](templates.md) <kbd>0.4</kbd>.

The [UI builder](ui-builder.md) <kbd>0.3</kbd> lets you drag widgets around and copy out C, C#, Python, Java, GDScript, Rust, Node, Go, Zig or Lua. Its preview runs real goome now <kbd>0.5</kbd>.

## What changed lately

The newest is 0.5.5. C gets a version first, the bindings, the editor plugins and `goome-cli` follow a little later, so [Versions](versions.md) tells you which one each has. Everything that came in a version has a little <kbd>0.5</kbd>-style tag next to it in the menu and on the page, and [Versions](versions.md#what-each-version-brought) lists what each release added.

## The repos

| Repo | What it is |
|:--|:--|
| [c-goome](https://github.com/goome-ui/c-goome) | the C library, everything else is built on it |
| [csharp-goome](https://github.com/goome-ui/csharp-goome) | C# bindings for .NET 8 |
| [python-goome](https://github.com/goome-ui/python-goome) | Python bindings over ctypes |
| [java-goome](https://github.com/goome-ui/java-goome) | Java bindings and the Minecraft mods |
| [godot-goome](https://github.com/goome-ui/godot-goome) | goome as a Godot 4.4+ addon |
| [rust-goome](https://github.com/goome-ui/rust-goome) | Rust crates, `goome` and `goome-sys`, on crates.io <kbd>0.5</kbd> |
| [node-goome](https://github.com/goome-ui/node-goome) | a Node N-API addon with TypeScript types <kbd>0.5</kbd> |
| [go-goome](https://github.com/goome-ui/go-goome) | Go bindings over cgo <kbd>0.5</kbd> |
| [zig-goome](https://github.com/goome-ui/zig-goome) | a Zig package <kbd>0.5</kbd> |
| [lua-goome](https://github.com/goome-ui/lua-goome) | a Lua 5.4 / LuaJIT module, tested on LuaJIT which is what LÖVE runs <kbd>0.5</kbd> |
| [obs-goome](https://github.com/goome-ui/obs-goome) | the OBS Studio plugin <kbd>0.5</kbd> |
| [vscode-goome](https://github.com/goome-ui/vscode-goome) | the VS Code extension |
| [jetbrains-goome](https://github.com/goome-ui/jetbrains-goome) | the plugin for Rider, CLion, IntelliJ IDEA and PyCharm |
| [examples](https://github.com/goome-ui/examples) | bigger example apps, one folder each, and the [downloadable apps](downloads.md) |
| [goome-cli](https://github.com/goome-ui/goome-cli) | `goome new`, makes a project from a template, on PyPI (`pipx install goome-cli`) <kbd>0.5.3</kbd> |
| goome-app-template-* | a starting app for [each language](templates.md) |
| [docs](https://github.com/goome-ui/docs) | this site |

Found something wrong, open an issue or a PR on the [docs repo](https://github.com/goome-ui/docs).
