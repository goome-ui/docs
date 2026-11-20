---
title: Versions
---

# Versions

The getting started pages get you the newest goome. If you want one exact version instead, so it doesnt change under you, this is how.

| Version | Whats in it |
|:--|:--|
| 0.5.5 | the `GOOME_WINDOW_NO_CONSOLE` flag, [hide the console on Windows](windows-console.md), numpad keys on Wayland with numlock off, every link points at goome.wtf, fixes |
| 0.5.4 | `goome-cli` only, a newer cli on PyPI, everything else stays at 0.5.3 |
| 0.5.3 | every binding was released at 0.5.3. Drawing is the same on newer gcc now (FMA contraction used to change pixels, CMake builds hash identical to the reference), the modal width clamp, the [browser demos](try.md), and the benchmark and verify tooling on the [Compare](compare.md) page is in the release. The [VS Code extension](editor-vscode.md) stays at 0.5.2 |
| 0.5.2 | goome apps [run in the browser](browser.md) (`goome build --web`), the [builder](ui-builder.md) exports Rust, Node, Go, Zig and Lua, the `GOOME_WINDOW_NO_TITLEBAR` flag. Every binding was updated to c-goome 0.5.2 |
| 0.5.1 | fixed install steps: Python, C# and Java come from PyPI, NuGet and Maven Central, Node and Lua from their release files, the editor plugins from their marketplaces, plus a Windows installer for the [OBS plugin](obs.md) |
| 0.5 | [Rust](start-rust.md), [Node](start-node.md), [Go](start-go.md), [Zig](start-zig.md) and [Lua](start-lua.md), [animations](animations.md), [emoji and RTL](emoji-rtl.md), [IME](ime.md), [screen readers](accessibility.md), the [OBS plugin](obs.md), real goome in the [builder](ui-builder.md), the GNOME late hit rect fix |
| 0.4 | [apps to download](downloads.md), [template repos and goome new](templates.md), the [Compare](compare.md) page, [Discussions and good first issues](community.md) |
| 0.3 | the mods and customization update: Java and Godot, goome inside games, custom widgets, icons and skins, simple themes, the UI builder |
| 0.2 | window mode and offscreen mode, Unity, menus, modals, tables, trees, a text editor, plots and drag and drop |
| 0.1 | the first one: overlay mode, drawing, the ui kit basics, screen capture and hotkeys, from C, C# and Python |

Pages and functions that came in 0.2, 0.3, 0.4 or 0.5 have a little <kbd>0.2</kbd>, <kbd>0.3</kbd>, <kbd>0.4</kbd> or <kbd>0.5</kbd> next to them, so if you stay on an older version skip those. The commands below use the newest one, swap in the one you want.

## What each version brought

### 0.5.5

- new window flag `GOOME_WINDOW_NO_CONSOLE` <kbd>0.5.5</kbd>. On Windows it closes the console of a console exe, so double clicking it shows only your window. Off by default, does nothing on Linux and macOS, and leaves the terminal alone when you start it from cmd or PowerShell. All of it is on [Hide the console on Windows](windows-console.md)
- the numpad works on Wayland with numlock off, it sends the navigation keys (arrows, Home, End, Page Up, Page Down, Insert, Delete) like it should
- every link in the library, the READMEs and the apps points at goome.wtf now, no more github.io

C comes first, `goome.h` and `goome-backends-0.5.5.zip` are on the [c-goome release](https://github.com/goome-ui/c-goome/releases/tag/v0.5.5). The bindings, the OBS plugin and the Godot addon pick it up one by one as their own 0.5.5 releases come out, until then they stay on 0.5.3 and the flag is only in the C header. The install lines below say 0.5.3 for those, swap in 0.5.5 once its on the releases page.

### 0.5.4

`goome-cli` 0.5.4 is out, the rest stays at 0.5.3.

### 0.5.3

Every binding is at 0.5.3. Drawing is the same on newer gcc now, FMA contraction used to change pixels and CMake builds hash identical to the reference, and modals dont get wider than the window. The [browser demos](try.md) and the benchmark and verify tooling from [Compare](compare.md) are in the release.

`goome-cli` is on [PyPI](https://pypi.org/project/goome-cli/) now, `pipx install goome-cli` and you have `goome`. `goome update` keeps it current and it says when a newer one is out, `GOOME_NO_UPDATE_CHECK=1` turns that off. More on [Templates and goome new](templates.md#goome-new).

### 0.5.2

Goome apps [run in the browser](browser.md) now, and you can [try two of them](try.md). `goome build --web main.c` compiles one to webassembly and `goome serve` tries it on localhost, no emscripten. The [builder](ui-builder.md) exports Rust, Node, Go, Zig and Lua too, and `goome_ui_app` has a `GOOME_WINDOW_NO_TITLEBAR` flag.

### 0.5

The languages and accessibility update, anything with <kbd>0.5</kbd> on it came here.

- five new languages: [Rust](start-rust.md), [Node](start-node.md), [Go](start-go.md), [Zig](start-zig.md) and [Lua](start-lua.md), same pixels as C
- [animations](animations.md) for your own stuff, `goome_ui_anim` slides a number and `goome_ui_anim_color` fades a color, plus in, spring and bounce eases
- [color emoji, fallback fonts and right to left text](emoji-rtl.md) for Arabic and Hebrew
- [IME support](ime.md) on X11, Wayland, Windows and Mac, so Chinese, Japanese, Korean and dead keys can be typed in inputs (checked end to end with one IME so far, ibus and mozc on X11)
- [screen readers](accessibility.md) through AT-SPI2, UI Automation and NSAccessibility, and `goome_a11y_tree` for engines
- an [OBS plugin](obs.md) with a timer, now playing, a goal bar, a clock and chat, or your own builder file, clickable through Interact. Windows got an installer in 0.5.1
- the [builder](ui-builder.md#real-goome-preview-05) preview is real goome now, built to WebAssembly
- the [VS Code extension](editor-vscode.md) got a side panel and is on the Marketplace and Open VSX, the [JetBrains plugin](editor-rider.md) got a tool window and is on the JetBrains Marketplace

And a GNOME fix: an overlay that showed up before it had any hit rects never took clicks, which is also why clicks died after a hotkey brought a hidden overlay back. Both work now.

### 0.4

The getting started update, anything with <kbd>0.4</kbd> on it came here. Theres four apps you can just [download](downloads.md) and use, a [template repo](templates.md) for every language, and `goome new` to make a project from one with your name already in it. The [Compare](compare.md) page puts goome next to the other UI libraries, from Dear ImGui to Electron. [Discussions and good first issues](community.md) are on now too, if you want to ask something or help out.

### 0.3

The mods and customization update, anything with <kbd>0.3</kbd> on it came here. goome works from **Java** now, see [Getting started in Java](start-java.md), and theres a **Godot** addon, see [Getting started in Godot](start-godot.md). It also goes inside games now, on [renderer backends](mods-renderers.md), [platform backends](mods-platforms.md), [native DLL mods](mods-native.md), [Unity mods](mods-unity.md), [Minecraft](mods-minecraft.md), [Godot](mods-godot.md) and [other engines](mods-engines.md), with [taking input from the game](input-capture.md) to keep clicks away from it. On the UI side theres [custom widgets and the style stack](ui-custom.md), [icons and skins](ui-icons.md), [change anything](ui-anything.md) for config and keys, [simple themes](ui-theme-easy.md), [password inputs](ui-text.md#passwords-and-hints-03), [reading back a frame](frames.md#reading-back-a-frame-03) and the [UI builder](ui-builder.md).

### 0.2

Anything with <kbd>0.2</kbd> on it came here. Mainly [window mode](window-mode.md), [offscreen mode](offscreen-mode.md), and a lot more UI kit: menus, modals, toasts, tables, trees, a text editor, plots, split panes and drag and drop. That starts at [App mode and menus](ui-app.md).

## C

Linux or Mac, put the version on the end:

```sh
curl -fsSL https://raw.githubusercontent.com/goome-ui/c-goome/main/get.sh | sh -s 0.5.5
curl -fsSL https://raw.githubusercontent.com/goome-ui/c-goome/main/get.sh | GOOME_VERSION=0.5.5 sh
```

Windows, in PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/goome-ui/c-goome/main/get.ps1))) -Version 0.5.5
```

If you already have the script, its just `./get.sh 0.5.5`, `GOOME_VERSION=0.5.5 ./get.sh` or `.\get.ps1 -Version 0.5.5`. Without a version it gets the newest release.

Or download goome.h for that version straight from the [releases](https://github.com/goome-ui/c-goome/releases):

```text
https://github.com/goome-ui/c-goome/releases/download/v0.5.5/goome.h
```

Theres also `goome-backends-0.5.5.zip` there (from 0.3.0 on), thats the `backends/` folder for [mods](mods.md).

## C#

NuGet has 0.4.0 and up, and the same package is on the [release](https://github.com/goome-ui/csharp-goome/releases/tag/v0.5.3) too:

```sh
dotnet add package GoomeSharp --version 0.5.3
```

For 0.2.0 and 0.3.0 grab the .nupkg from the [releases](https://github.com/goome-ui/csharp-goome/releases), it has the native lib for every OS inside, and add it from a folder:

```sh
mkdir goome-pkgs
curl -fsSL -o goome-pkgs/GoomeSharp.0.3.0.nupkg https://github.com/goome-ui/csharp-goome/releases/download/v0.3.0/GoomeSharp.0.3.0.nupkg
dotnet add package GoomeSharp --version 0.3.0 --source ./goome-pkgs
```

## Unity

The package is there from 0.2.0 on. Add package from git URL, with the tag on the end:

```text
https://github.com/goome-ui/csharp-goome.git?path=/unity/com.goome-ui.goome#v0.5.3
```

Or grab `com.goome-ui.goome-0.5.3.tgz` from the [0.5.3 release](https://github.com/goome-ui/csharp-goome/releases/tag/v0.5.3) and use Add package from tarball.

## Python

PyPI has 0.4.0 and up:

```sh
pip install goome==0.5.3
```

Older ones come from the tag, that builds the lib with your C compiler:

```sh
pip install git+https://github.com/goome-ui/python-goome@v0.3.0
```

## Java

Java starts at 0.3.0. Maven Central has 0.4.0 and up:

```groovy
dependencies {
    implementation 'io.github.goome-ui:goome:0.5.3'
}
```

For 0.3.0 download `goome-0.3.0.jar` from the [release](https://github.com/goome-ui/java-goome/releases/tag/v0.3.0), it has the native lib for every OS inside, and use `implementation files('libs/goome-0.3.0.jar')`.

The rest of the Gradle and Maven setup is on [Getting started in Java](start-java.md#install). Every release has `goome-fabric-<version>.jar` and `goome-neoforge-<version>.jar` too, those are the [Minecraft](mods-minecraft.md) mods.

## Godot

Godot starts at 0.3.0. Download `godot-goome-0.5.3.zip` from the [release](https://github.com/goome-ui/godot-goome/releases/tag/v0.5.3) and unzip it into your project, you get `res://addons/goome/` with the libs for every OS in `bin/`.

## Rust

Rust starts at 0.5.0 and is on [crates.io](https://crates.io/crates/goome), so `goome = "0.5"` is all you need. For one exact version put the tag on the git dependency:

```toml
[dependencies]
goome = { git = "https://github.com/goome-ui/rust-goome", tag = "v0.5.3" }
```

## Node

Node starts at 0.5.0. Its not on npm, install the package from the release, it has the addon built already:

```sh
npm install https://github.com/goome-ui/node-goome/releases/download/v0.5.3/goome-0.5.3.tgz
```

Or from git with the tag after a `#`, that builds the addon with node-gyp:

```sh
npm install github:goome-ui/node-goome#v0.5.3
```

## Go

Go starts at 0.5.0:

```sh
go get github.com/goome-ui/go-goome@v0.5.3
```

## Zig

Zig starts at 0.5.0. The tag goes after the `#`:

```sh
zig fetch --save git+https://github.com/goome-ui/zig-goome#v0.5.3
```

Or the tarball from the release, it ends up with the same hash:

```sh
zig fetch --save https://github.com/goome-ui/zig-goome/releases/download/v0.5.3/zig-goome-0.5.3.tar.gz
```

For 0.5.3 `build.zig.zon` gets `.hash = "goome-0.5.3-JM4gI7miFwD5fDN7M_WUseh3Y6LFk1kTDdz7xjhUU9b5"`, if yours says something else you got a different version.

## Lua

Lua starts at 0.5.0. Its not on luarocks.org, LuaRocks takes the rock from the release:

```sh
luarocks install https://github.com/goome-ui/lua-goome/releases/download/v0.5.3/goome-0.5.3-1.src.rock
```

## OBS

The plugin starts at 0.5.0. Every file is on the [0.5.3 release](https://github.com/goome-ui/obs-goome/releases/tag/v0.5.3), with the version in the name like `obs-goome-0.5.3-windows-x64.zip`. From 0.5.1 Windows also gets `obs-goome-0.5.3-windows-x64-installer.exe`. Install steps are on the [OBS plugin](obs.md#install) page.

## goome new

The cli is there from 0.4.0 on, and on PyPI from 0.5.3:

```sh
pipx install goome-cli==0.5.4
```

Older ones come from git:

```sh
pip install git+https://github.com/goome-ui/goome-cli@v0.5.4
```

Or the one file from the [release](https://github.com/goome-ui/goome-cli/releases/tag/v0.5.4), then `python goome.py new my-app --lang c`.

## Templates

The [templates](templates.md) pin one goome version each, the template README says where. `goome new --ref v0.5.0` gets the template from that tag. The templates are not on the 0.5.3 bindings yet, they still pin 0.5.2 or older, so a project from `goome new` can be a version behind what this page lists.

## How the bindings stay up to date

Every binding repo has a little workflow, `update-native.yml`, that checks once a day if c-goome has a newer release. If it does it opens a PR that re-vendors the new `goome.h` (and the libs where a repo has them). I look at it, merge it and tag the binding, so a new c-goome shows up in the bindings in a day or two instead of whenever i remember. If you want to help, those PRs are fine to review too.

## Which version do I have

| Where | How |
|:--|:--|
| C | `GOOME_VERSION` in goome.h, a string like `"0.5.3"` |
| C# | `Goome.Version` |
| Python | `goome.VERSION`, or `goome.__version__` |
| Java | `Goome.VERSION` |
| Unity | the version next to goome in the Package Manager |
| Godot | `version` in `addons/goome/plugin.cfg` |
| Rust | `goome::VERSION` |
| Node | `goome.VERSION` |
| Go | `goome.Version` |
| Zig | `goome.version` |
| Lua | `goome.VERSION` |
| goome-cli | `goome --version` |
| OBS | Help > Log Files, the plugin says its version when OBS loads it |
