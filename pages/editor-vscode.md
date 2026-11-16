---
title: VS Code
---

# VS Code

## The goome extension

[vscode-goome](https://github.com/goome-ui/vscode-goome) is on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=goome-ui.vscode-goome). Search **goome** in Extensions, or:

```sh
code --install-extension goome-ui.vscode-goome
```

Offline or on VSCodium, grab the `.vsix` from its [releases](https://github.com/goome-ui/vscode-goome/releases/latest) and use Extensions > ... > Install from VSIX.

**The side panel** <kbd>0.5</kbd>. Click the goome icon in the activity bar. It has:

- quick actions: New Project, Open UI builder, Search docs, Open docs
- every `.goome.json` and `.goome-theme.json` in your workspace, click one to preview it. The same list sits in the Explorer under your files
- the templates for each language, click one and New Project starts with it picked
- a snippet cheat sheet, click one and it goes into the file you have open

The rest:

- Snippets - type `goome` in C, C#, Python or Java. `goome-overlay` and `goome-app` are a whole program, `goome-loop` is the poll loop, and theres one for every common widget. The 0.5 ones are `goome-anim`, `goome-anim-color`, `goome-ease`, `goome-text-input`, `goome-a11y`, `goome-font-fallback` and `goome-text-dir` <kbd>0.5</kbd>
- goome: New Project - runs [goome new](templates.md). If its not on your PATH it downloads goome.py and runs it with Python
- Preview - open a `.goome.json` and hit the preview button top right. It draws with the builders own code and updates while you type. The C, C#, Python and Java buttons copy the code out
- Hover - any `goome_*` function in C for its signature, the note from goome.h and a docs link
- Schemas - `.goome.json` and `.goome-theme.json` get checked while you type

Settings: `goome.cli` points at your own `goome` or `goome.py`, `goome.python` picks the Python.

## Per language

| Language | Extensions |
|:--|:--|
| C | C/C++ (`ms-vscode.cpptools`), and CMake Tools (`ms-vscode.cmake-tools`) if you use CMake |
| C# | C# Dev Kit (`ms-dotnettools.csdevkit`) |
| Python | Python (`ms-python.python`) |
| Rust <kbd>0.5</kbd> | rust-analyzer (`rust-lang.rust-analyzer`), CodeLLDB (`vadimcn.vscode-lldb`) to debug. [More](start-rust.md#editors) |
| Node <kbd>0.5</kbd> | nothing extra, the types come with the package. [More](start-node.md#editors) |
| Go <kbd>0.5</kbd> | Go (`golang.go`). [More](start-go.md#editors) |
| Zig <kbd>0.5</kbd> | Zig Language (`ziglang.vscode-zig`), CodeLLDB to debug. [More](start-zig.md#editors) |
| Lua <kbd>0.5</kbd> | Lua (`sumneko.lua`). [More](start-lua.md#editors) |

## C, your own project

1. Folder with `goome.h`, a `goome.c` with the two implementation lines and your `main.c` (the [get script](start-c.md) makes these).
2. File > Open Folder.
3. `.vscode/tasks.json` for Ctrl+Shift+B:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "gcc -g -O0 -o myapp main.c goome.c",
      "windows": { "command": "cl /Zi /Od main.c goome.c /Fe:myapp.exe" },
      "group": { "kind": "build", "isDefault": true },
      "problemMatcher": ["$gcc"]
    }
  ]
}
```

4. `.vscode/launch.json` with a `cppdbg` config, `program` set to `${workspaceFolder}/myapp` and `"preLaunchTask": "build"`. Windows is `cppvsdbg` and `myapp.exe`, Mac needs `"MIMode": "lldb"`. Then F5.

`cl` only works if VS Code got started from the Visual Studio developer prompt. With mingw use the gcc line on Windows too.

## C, inside the c-goome repo

Theres already a `.vscode` folder, open the repo and install the extensions it asks for. It configures itself from the CMake presets.

- Ctrl+Shift+B is the CMake build
- the test task runs ctest
- the remake goome.h task runs `tools/single.py`
- in the debug menu hello is the real thing, hello (test backend) runs a test script so nothing touches your screen. Both run the launch target CMake Tools has picked

## C#

1. `dotnet new console -o MyApp`, open the folder.
2. `dotnet add package GoomeSharp` in the terminal. Working on a csharp-goome clone instead? `./build.sh` there and `dotnet add reference ../csharp-goome/src/GoomeSharp/GoomeSharp.csproj`.
3. F5, C# Dev Kit makes the launch config.

## Python

1. Python: Create Environment in the command palette, pick it as the interpreter.
2. `pip install goome` in the terminal
3. F5 on your script.

Add `"env": {"GOOME_BACKEND": "test", "GOOME_TEST_SHOTS": "shots/"}` to the launch config for the test backend.

## Gotchas

On Windows C# and Python need `goome.dll` next to your exe or in `runtimes/win-x64/native/`. GoomeSharp copies it on build but only if `./build.sh win` (or build.sh in Git Bash with mingw) made it first, otherwise its a `DllNotFoundException`. `GOOME_NATIVE=C:\path\to\folder` points somewhere else.

Mac permission prompts say VS Code, not your app. [Why](platforms.md#macos-permissions).
