---
title: Home
permalink: /
---

# goome docs

goome draws see-through, always on top overlays where only what you draw takes clicks. Hotkeys, screen grabs, fonts, images and a UI kit are in there too.

One header (`goome.h`), nothing to link. Linux (X11 and Wayland), Windows 10 / 11 and macOS 14+, from C, C#, Python or Java. Theres a Godot addon too.

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

Same call in the bindings: `Goome.OpenApp` in C#, `goome.open_app` in Python, `Goome.openApp` or `new App` in Java. [Window mode](window-mode.md) has the rest.

**Inside Unity, Godot or another engine** <kbd>0.2</kbd>. No OS window, goome draws into a buffer and your engine shows it as a texture:

```c
goome *g = goome_open(&(goome_opts){.mode = GOOME_MODE_OFFSCREEN, .width = 640, .height = 400}, NULL);
```

See [Offscreen mode](offscreen-mode.md). For Unity there's [a page](start-unity.md). Godot doesnt need any of this by hand, its [one node](start-godot.md).

Full programs are on [Getting started in C](start-c.md), [C#](start-csharp.md), [Python](start-python.md) and [Java](start-java.md). Or skip the setup with `goome new`, see [Templates and goome new](templates.md) <kbd>0.4</kbd>.

The [UI builder](ui-builder.md) <kbd>0.3</kbd> lets you drag widgets around and copy out C, C#, Python, Java or GDScript.

## 0.4

The getting started update, anything with <kbd>0.4</kbd> on it came here. Theres four apps you can just [download](downloads.md) and use, a [template repo](templates.md) for every language, and `goome new` to make a project from one with your name already in it. The [Compare](compare.md) page puts goome next to the other UI libraries, from Dear ImGui to Electron. [Discussions and good first issues](community.md) are on now too, if you want to ask something or help out.

## 0.3

The mods and customization update, anything with <kbd>0.3</kbd> on it came here. goome works from **Java** now, see [Getting started in Java](start-java.md), and theres a **Godot** addon, see [Getting started in Godot](start-godot.md). It also goes inside games now, on [renderer backends](mods-renderers.md), [platform backends](mods-platforms.md), [native DLL mods](mods-native.md), [Unity mods](mods-unity.md), [Minecraft](mods-minecraft.md), [Godot](mods-godot.md) and [other engines](mods-engines.md), with [taking input from the game](input-capture.md) to keep clicks away from it. On the UI side theres [custom widgets and the style stack](ui-custom.md), [icons and skins](ui-icons.md), [change anything](ui-anything.md) for config and keys, [simple themes](ui-theme-easy.md), [password inputs](ui-text.md#passwords-and-hints-03), [reading back a frame](frames.md#reading-back-a-frame-03) and the [UI builder](ui-builder.md).

## 0.2

Anything with <kbd>0.2</kbd> on it came here. Mainly [window mode](window-mode.md), [offscreen mode](offscreen-mode.md), and a lot more UI kit: menus, modals, toasts, tables, trees, a text editor, plots, split panes and drag and drop. That starts at [App mode and menus](ui-app.md).

## The repos

| Repo | What it is |
|:--|:--|
| [c-goome](https://github.com/goome-ui/c-goome) | the C library, everything else is built on it |
| [csharp-goome](https://github.com/goome-ui/csharp-goome) | C# bindings for .NET 8 |
| [python-goome](https://github.com/goome-ui/python-goome) | Python bindings over ctypes |
| [java-goome](https://github.com/goome-ui/java-goome) | Java bindings and the Minecraft mods |
| [godot-goome](https://github.com/goome-ui/godot-goome) | goome as a Godot 4.4+ addon |
| [examples](https://github.com/goome-ui/examples) | bigger example apps, one folder each, and the [downloadable apps](downloads.md) |
| [goome-cli](https://github.com/goome-ui/goome-cli) | `goome new`, makes a project from a template |
| goome-app-template-* | a starting app for [each language](templates.md) |
| [docs](https://github.com/goome-ui/docs) | this site |

Found something wrong, open an issue or a PR on the [docs repo](https://github.com/goome-ui/docs).
