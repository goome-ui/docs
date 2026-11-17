---
title: Versions
---

# Versions

The getting started pages get you the newest goome. If you want one exact version instead, so it doesnt change under you, this is how.

| Version | Whats in it |
|:--|:--|
| 0.5.3 | `goome-cli` is on PyPI now, so `pipx install goome-cli` works, plus `goome update` and a once a day note when a newer cli is out. Only goome-cli has a 0.5.3, the rest stays at 0.5.2 |
| 0.5.2 | goome apps [run in the browser](browser.md) (`goome build --web`), the [builder](ui-builder.md) exports Rust, Node, Go, Zig and Lua, the `GOOME_WINDOW_NO_TITLEBAR` flag. Every binding was updated to c-goome 0.5.2, only the NuGet package is still at 0.5.1 for now |
| 0.5.1 | fixed install steps: Python, C# and Java come from PyPI, NuGet and Maven Central, Node and Lua from their release files, the editor plugins from their marketplaces, plus a Windows installer for the [OBS plugin](obs.md) |
| 0.5 | [Rust](start-rust.md), [Node](start-node.md), [Go](start-go.md), [Zig](start-zig.md) and [Lua](start-lua.md), [animations](animations.md), [emoji and RTL](emoji-rtl.md), [IME](ime.md), [screen readers](accessibility.md), the [OBS plugin](obs.md), real goome in the [builder](ui-builder.md), the GNOME late hit rect fix |
| 0.4 | [apps to download](downloads.md), [template repos and goome new](templates.md), the [Compare](compare.md) page, [Discussions and good first issues](community.md) |
| 0.3 | the mods and customization update: Java and Godot, goome inside games, custom widgets, icons and skins, simple themes, the UI builder |
| 0.2 | window mode and offscreen mode, Unity, menus, modals, tables, trees, a text editor, plots and drag and drop |
| 0.1 | the first one: overlay mode, drawing, the ui kit basics, screen capture and hotkeys, from C, C# and Python |

Pages and functions that came in 0.2, 0.3, 0.4 or 0.5 have a little <kbd>0.2</kbd>, <kbd>0.3</kbd>, <kbd>0.4</kbd> or <kbd>0.5</kbd> next to them, so if you stay on an older version skip those. The commands below use the newest one, swap in the one you want.

## C

Linux or Mac, put the version on the end:

```sh
curl -fsSL https://raw.githubusercontent.com/goome-ui/c-goome/main/get.sh | sh -s 0.5.2
curl -fsSL https://raw.githubusercontent.com/goome-ui/c-goome/main/get.sh | GOOME_VERSION=0.5.2 sh
```

Windows, in PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/goome-ui/c-goome/main/get.ps1))) -Version 0.5.2
```

If you already have the script, its just `./get.sh 0.5.2`, `GOOME_VERSION=0.5.2 ./get.sh` or `.\get.ps1 -Version 0.5.2`. Without a version it gets the newest release.

Or download goome.h for that version straight from the [releases](https://github.com/goome-ui/c-goome/releases):

```text
https://github.com/goome-ui/c-goome/releases/download/v0.5.2/goome.h
```

Theres also `goome-backends-0.5.2.zip` there (from 0.3.0 on), thats the `backends/` folder for [mods](mods.md).

## C#

NuGet has 0.4.0 and up. The 0.5.2 package is on the [release](https://github.com/goome-ui/csharp-goome/releases/tag/v0.5.2) but NuGet only lists up to 0.5.1 right now:

```sh
dotnet add package GoomeSharp --version 0.5.1
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
https://github.com/goome-ui/csharp-goome.git?path=/unity/com.goome-ui.goome#v0.5.2
```

Or grab `com.goome-ui.goome-0.5.2.tgz` from the [0.5.2 release](https://github.com/goome-ui/csharp-goome/releases/tag/v0.5.2) and use Add package from tarball.

## Python

PyPI has 0.4.0 and up:

```sh
pip install goome==0.5.2
```

Older ones come from the tag, that builds the lib with your C compiler:

```sh
pip install git+https://github.com/goome-ui/python-goome@v0.3.0
```

## Java

Java starts at 0.3.0. Maven Central has 0.4.0 and up:

```groovy
dependencies {
    implementation 'io.github.goome-ui:goome:0.5.2'
}
```

For 0.3.0 download `goome-0.3.0.jar` from the [release](https://github.com/goome-ui/java-goome/releases/tag/v0.3.0), it has the native lib for every OS inside, and use `implementation files('libs/goome-0.3.0.jar')`.

The rest of the Gradle and Maven setup is on [Getting started in Java](start-java.md#install). Every release has `goome-fabric-<version>.jar` and `goome-neoforge-<version>.jar` too, those are the [Minecraft](mods-minecraft.md) mods.

## Godot

Godot starts at 0.3.0. Download `godot-goome-0.5.2.zip` from the [release](https://github.com/goome-ui/godot-goome/releases/tag/v0.5.2) and unzip it into your project, you get `res://addons/goome/` with the libs for every OS in `bin/`.

## Rust

Rust starts at 0.5.0 and is on [crates.io](https://crates.io/crates/goome), so `goome = "0.5"` is all you need. For one exact version put the tag on the git dependency:

```toml
[dependencies]
goome = { git = "https://github.com/goome-ui/rust-goome", tag = "v0.5.2" }
```

## Node

Node starts at 0.5.0. Its not on npm, install the package from the release, it has the addon built already:

```sh
npm install https://github.com/goome-ui/node-goome/releases/download/v0.5.2/goome-0.5.2.tgz
```

Or from git with the tag after a `#`, that builds the addon with node-gyp:

```sh
npm install github:goome-ui/node-goome#v0.5.2
```

## Go

Go starts at 0.5.0:

```sh
go get github.com/goome-ui/go-goome@v0.5.2
```

## Zig

Zig starts at 0.5.0. The tag goes after the `#`:

```sh
zig fetch --save git+https://github.com/goome-ui/zig-goome#v0.5.2
```

Or the tarball from the release, it ends up with the same hash:

```sh
zig fetch --save https://github.com/goome-ui/zig-goome/releases/download/v0.5.2/zig-goome-0.5.2.tar.gz
```

For 0.5.2 `build.zig.zon` gets `.hash = "goome-0.5.2-JM4gI6GiFwBSQLnIdW8Bev3Lyu0rwU0OZYv8Wo65mXy1"`, if yours says something else you got a different version.

## Lua

Lua starts at 0.5.0. Its not on luarocks.org, LuaRocks takes the rock from the release:

```sh
luarocks install https://github.com/goome-ui/lua-goome/releases/download/v0.5.2/goome-0.5.2-1.src.rock
```

## OBS

The plugin starts at 0.5.0. Every file is on the [0.5.2 release](https://github.com/goome-ui/obs-goome/releases/tag/v0.5.2), with the version in the name like `obs-goome-0.5.2-windows-x64.zip`. From 0.5.1 Windows also gets `obs-goome-0.5.2-windows-x64-installer.exe`. Install steps are on the [OBS plugin](obs.md#install) page.

## goome new

The cli is there from 0.4.0 on, and on PyPI from 0.5.3:

```sh
pipx install goome-cli==0.5.3
```

Older ones come from git:

```sh
pip install git+https://github.com/goome-ui/goome-cli@v0.5.2
```

Or the one file from the [release](https://github.com/goome-ui/goome-cli/releases/tag/v0.5.3), then `python goome.py new my-app --lang c`.

## Templates

The [templates](templates.md) pin one goome version each, the template README says where. `goome new --ref v0.5.0` gets the template from that tag.

## How the bindings stay up to date

Every binding repo has a little workflow, `update-native.yml`, that checks once a day if c-goome has a newer release. If it does it opens a PR that re-vendors the new `goome.h` (and the libs where a repo has them). I look at it, merge it and tag the binding, so a new c-goome shows up in the bindings in a day or two instead of whenever i remember. If you want to help, those PRs are fine to review too.

## Which version do I have

| Where | How |
|:--|:--|
| C | `GOOME_VERSION` in goome.h, a string like `"0.5.2"` |
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
