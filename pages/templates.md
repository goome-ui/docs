---
title: Templates and goome new
---

# Templates and goome new <kbd>0.4</kbd>

Theres a template repo for every language. Each one is a tiny app that already builds: a normal window, and one toggle turns it into an overlay over everything. CI is set up too, it runs the app on the [test backend](testing.md) on every desktop OS.

| Language | Template |
|:--|:--|
| C | [goome-app-template-c](https://github.com/goome-ui/goome-app-template-c) |
| C# | [goome-app-template-csharp](https://github.com/goome-ui/goome-app-template-csharp) |
| Python | [goome-app-template-python](https://github.com/goome-ui/goome-app-template-python) |
| Java | [goome-app-template-java](https://github.com/goome-ui/goome-app-template-java) |
| Godot | [goome-app-template-godot](https://github.com/goome-ui/goome-app-template-godot) |
| Rust | [goome-app-template-rust](https://github.com/goome-ui/goome-app-template-rust) <kbd>0.5.1</kbd> |
| Node | [goome-app-template-node](https://github.com/goome-ui/goome-app-template-node) <kbd>0.5.1</kbd> |
| Go | [goome-app-template-go](https://github.com/goome-ui/goome-app-template-go) <kbd>0.5.1</kbd> |
| Zig | [goome-app-template-zig](https://github.com/goome-ui/goome-app-template-zig) <kbd>0.5.1</kbd> |
| Lua | [goome-app-template-lua](https://github.com/goome-ui/goome-app-template-lua) <kbd>0.5.1</kbd> |

Hit **Use this template** on any of them and you get your own copy. Or use `goome new`, it does the same but puts your name in everywhere.

## goome new

[goome-cli](https://github.com/goome-ui/goome-cli) is one Python file, it only needs Python 3.8 or newer. Its on PyPI as `goome-cli` (not `goome`, thats the Python binding), the command is `goome`.

[![PyPI goome-cli](https://goome.wtf/badges/pypi-goome-cli.svg)](https://pypi.org/project/goome-cli/)

```sh
pipx install goome-cli
goome new my-overlay --lang python
```

No pipx? `pip install goome-cli` does the same.

Or skip installing, download the one file and run it the same way:

```sh
curl -fsSL -o goome.py https://raw.githubusercontent.com/goome-ui/goome-cli/main/goome.py
python goome.py new my-overlay --lang c
```

On windows the download is `irm https://raw.githubusercontent.com/goome-ui/goome-cli/main/goome.py -OutFile goome.py` in PowerShell.

The whole thing:

```sh
goome new <name> --lang c|csharp|python|java|godot|rust|node|go|zig|lua [--template app|overlay|mod-menu|hud]
goome build --web [main.c]
goome serve [folder]
goome update [--check]
goome list
goome --version
```

`--dir` picks the folder (the name if you leave it out), `--ref` a branch or tag of the template repo, and `--from` a template folder or .tar.gz you already have so nothing gets downloaded. It wont write into a folder that already has stuff in it.

`goome build --web` and `goome serve` are for [running an app in the browser](browser.md) <kbd>0.5.2</kbd>, they need goome-cli 0.5.2 or newer.

`goome update` <kbd>0.5.3</kbd> upgrades the cli. If you installed it with pip or pipx it runs the pip upgrade, if its a loose `goome.py` it replaces that file and keeps the old one next to it as `goome.py.bak`. `goome update --check` only prints the newest version and changes nothing. About once a day, when you run goome in a terminal, it also prints a quiet "a newer goome is out" line on stderr. Set `GOOME_NO_UPDATE_CHECK=1` and it never looks.

The name gets used in every form it needs. `cool hud` turns into "Cool Hud" in titles, `cool-hud` for the binary, `CoolHud` for the C# project and `coolhud` for the Java package. When its done it prints how to build and run it.

## The four starting points

| `--template` | What you get |
|:--|:--|
| `app` | the default, a normal window plus the overlay toggle |
| `overlay` | a see-through overlay over the whole desktop, only the window takes clicks. alt+h hides it |
| `mod-menu` | a menu with toggles and sliders over whatever game is running, alt+m opens and closes it |
| `hud` | a little panel in the corner with the time and fps, clicks go straight through it |

In Godot they all live inside the game instead of over the desktop, the overlay one is a goome window floating over your game and clicks next to it go to the game.

In the template repos the other three are in `variants/`. By hand, copy whats in the one you want over the files in the root (like `main.c`, `Program.cs`, `main.py`, `Main.java`, `ui.gd`, `src/main.rs`, `main.js`, `main.go`, `src/main.zig` or `main.lua`) and delete `variants/`.

## Running what you made

| Language | Run it |
|:--|:--|
| C | `cc -O2 -o my-overlay main.c goome.c` then `./my-overlay`, or the `CMakeLists.txt` |
| C# | `dotnet run`, needs the .NET 8 SDK, GoomeSharp comes from NuGet |
| Python | `pip install -r requirements.txt` then `python main.py`, goome comes from PyPI |
| Java | `./gradlew run`, needs JDK 22+, goome comes from Maven Central |
| Godot | `./get-goome.sh` grabs the addon, then open it in Godot 4.4+ and hit play |
| Rust | `cargo run`, needs Rust 1.77+ and a C compiler, goome comes from git |
| Node | `npm install` then `node main.js`, needs Node 18+, goome comes from the node-goome release |
| Go | `go run .`, needs Go 1.23+ with cgo and a C compiler |
| Zig | `zig build run`, needs Zig 0.15.2 and nothing else |
| Lua | `luarocks install --local goome-0.5.0-1.rockspec`, then `eval "$(luarocks path)"` and `lua main.lua`, needs a C compiler |

Every template pins one goome version. Thats `goome.h` in C, the GoomeSharp version in the csproj, `goome==` in `requirements.txt`, `goome_version` in `gradle.properties`, the version after `get-goome.sh` in Godot, the tag in `Cargo.toml`, the url in `package.json`, `go.mod`, `build.zig.zon` and the rockspec in Lua. Each template README says how to update it.

From there the getting started pages have the rest: [C](start-c.md), [C#](start-csharp.md), [Python](start-python.md), [Java](start-java.md), [Godot](start-godot.md), [Rust](start-rust.md), [Node](start-node.md), [Go](start-go.md), [Zig](start-zig.md) and [Lua](start-lua.md).
