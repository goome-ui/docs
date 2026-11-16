---
title: Versions
---

# Versions

The getting started pages get you the newest goome. If you want one exact version instead, so it doesnt change under you, this is how.

| Version | Whats in it |
|:--|:--|
| 0.5 | [Rust](start-rust.md), [Node](start-node.md), [Go](start-go.md), [Zig](start-zig.md) and [Lua](start-lua.md), [animations](animations.md), [emoji and RTL](emoji-rtl.md), [IME](ime.md), [screen readers](accessibility.md), the [OBS plugin](obs.md), real goome in the [builder](ui-builder.md), the GNOME late hit rect fix |
| 0.4 | [apps to download](downloads.md), [template repos and goome new](templates.md), the [Compare](compare.md) page, [Discussions and good first issues](community.md) |
| 0.3 | the mods and customization update: Java and Godot, goome inside games, custom widgets, icons and skins, simple themes, the UI builder |
| 0.2 | window mode and offscreen mode, Unity, menus, modals, tables, trees, a text editor, plots and drag and drop |
| 0.1 | the first one: overlay mode, drawing, the ui kit basics, screen capture and hotkeys, from C, C# and Python |

Pages and functions that came in 0.2, 0.3, 0.4 or 0.5 have a little <kbd>0.2</kbd>, <kbd>0.3</kbd>, <kbd>0.4</kbd> or <kbd>0.5</kbd> next to them, so if you stay on an older version skip those. The commands below use 0.5.0, swap in the one you want.

## C

Linux or Mac, put the version on the end:

```sh
curl -fsSL https://raw.githubusercontent.com/goome-ui/c-goome/main/get.sh | sh -s 0.5.0
curl -fsSL https://raw.githubusercontent.com/goome-ui/c-goome/main/get.sh | GOOME_VERSION=0.5.0 sh
```

Windows, in PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/goome-ui/c-goome/main/get.ps1))) -Version 0.5.0
```

If you already have the script, its just `./get.sh 0.5.0`, `GOOME_VERSION=0.5.0 ./get.sh` or `.\get.ps1 -Version 0.5.0`. Without a version it gets the newest release.

Or download goome.h for that version straight from the [releases](https://github.com/goome-ui/c-goome/releases):

```text
https://github.com/goome-ui/c-goome/releases/download/v0.5.0/goome.h
```

Theres also `goome-backends-0.5.0.zip` there (from 0.3.0 on), thats the `backends/` folder for [mods](mods.md).

## C#

Every release from 0.2.0 on has a .nupkg with the native lib for every OS inside. Download it into a folder and add it from there:

```sh
mkdir goome-pkgs
curl -fsSL -o goome-pkgs/GoomeSharp.0.5.0.nupkg https://github.com/goome-ui/csharp-goome/releases/download/v0.5.0/GoomeSharp.0.5.0.nupkg
dotnet add package GoomeSharp --version 0.5.0 --source ./goome-pkgs
```

## Unity

The package is there from 0.2.0 on. Add package from git URL, with the tag on the end:

```text
https://github.com/goome-ui/csharp-goome.git?path=/unity/com.goome-ui.goome#v0.5.0
```

Or grab `com.goome-ui.goome-0.5.0.tgz` from the [0.5.0 release](https://github.com/goome-ui/csharp-goome/releases/tag/v0.5.0) and use Add package from tarball.

## Python

From the tag, this still builds the lib with your C compiler:

```sh
pip install git+https://github.com/goome-ui/python-goome@v0.5.0
```

Or skip the build with a wheel from the [releases](https://github.com/goome-ui/python-goome/releases), theres one for linux x86_64, windows, and both kinds of Mac:

```sh
pip install https://github.com/goome-ui/python-goome/releases/download/v0.5.0/goome-0.5.0-py3-none-linux_x86_64.whl
```

## Java

Java starts at 0.3.0. Download `goome-0.5.0.jar` from the [release](https://github.com/goome-ui/java-goome/releases/tag/v0.5.0), it has the native lib for every OS inside. Put it in `libs/` and:

```groovy
dependencies {
    implementation files('libs/goome-0.5.0.jar')
}
```

The rest of the Gradle and Maven setup is on [Getting started in Java](start-java.md#install). The same release has `goome-fabric-0.5.0.jar` and `goome-neoforge-0.5.0.jar`, those are the [Minecraft](mods-minecraft.md) mods.

## Godot

Godot starts at 0.3.0. Download `godot-goome-0.5.0.zip` from the [release](https://github.com/goome-ui/godot-goome/releases/tag/v0.5.0) and unzip it into your project, you get `res://addons/goome/` with the libs for every OS in `bin/`.

## Rust

Rust starts at 0.5.0. Put the tag on the git dependency:

```toml
[dependencies]
goome = { git = "https://github.com/goome-ui/rust-goome", tag = "v0.5.0" }
```

## Node

Node starts at 0.5.0. npm takes the tag after a `#`:

```sh
npm install github:goome-ui/node-goome#v0.5.0
```

## Go

Go starts at 0.5.0:

```sh
go get github.com/goome-ui/go-goome@v0.5.0
```

## Zig

Zig starts at 0.5.0. The tag goes after the `#`:

```sh
zig fetch --save git+https://github.com/goome-ui/zig-goome#v0.5.0
```

## Lua

Lua starts at 0.5.0. Clone the tag and build it like normal:

```sh
git clone --branch v0.5.0 https://github.com/goome-ui/lua-goome
cd lua-goome
luarocks make goome-dev-1.rockspec
```

## OBS

The plugin starts at 0.5.0. Every file is on the [0.5.0 release](https://github.com/goome-ui/obs-goome/releases/tag/v0.5.0), with the version in the name like `obs-goome-0.5.0-windows-x64.zip`. Install steps are on the [OBS plugin](obs.md#install) page.

## goome new

The cli is there from 0.4.0 on:

```sh
pip install git+https://github.com/goome-ui/goome-cli@v0.5.0
```

Or the one file from the [release](https://github.com/goome-ui/goome-cli/releases/tag/v0.5.0), then `python goome.py new my-app --lang c`.

## Templates

The [templates](templates.md) pin one goome version each, the template README says where. `goome new --ref v0.5.0` gets the template from that tag.

## Which version do I have

| Where | How |
|:--|:--|
| C | `GOOME_VERSION` in goome.h, a string like `"0.5.0"` |
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
| OBS | Help > Log Files, the plugin says its version when OBS loads it |
