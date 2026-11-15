---
title: VS Code
---

# VS Code

There's a goome extension too, [vscode-goome](https://github.com/goome-ui/vscode-goome). It has snippets for all four languages, hover docs for `goome_*`, a "goome: New Project" command and a preview for `.goome.json` builder files. Grab the `.vsix` from its [releases](https://github.com/goome-ui/vscode-goome/releases/latest) and install it with Extensions > ... > Install from VSIX.

| Language | Extensions |
|:--|:--|
| C | C/C++ (`ms-vscode.cpptools`), and CMake Tools (`ms-vscode.cmake-tools`) if you use CMake |
| C# | C# Dev Kit (`ms-dotnettools.csdevkit`) |
| Python | Python (`ms-python.python`) |

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

1. Build the native lib once in your csharp-goome clone (`./build.sh`, see [Getting started in C#](start-csharp.md)).
2. `dotnet new console -o MyApp`, open the folder.
3. `dotnet add reference ../csharp-goome/src/GoomeSharp/GoomeSharp.csproj`, or add the local nupkg as a source and `dotnet add package GoomeSharp`.
4. F5, C# Dev Kit makes the launch config.

## Python

1. Python: Create Environment in the command palette, pick it as the interpreter.
2. `pip install git+https://github.com/goome-ui/python-goome` in the terminal
3. F5 on your script.

Add `"env": {"GOOME_BACKEND": "test", "GOOME_TEST_SHOTS": "shots/"}` to the launch config for the test backend.

## Gotchas

On Windows C# and Python need `goome.dll` next to your exe or in `runtimes/win-x64/native/`. GoomeSharp copies it on build but only if `./build.sh win` (or build.sh in Git Bash with mingw) made it first, otherwise its a `DllNotFoundException`. `GOOME_NATIVE=C:\path\to\folder` points somewhere else.

Mac permission prompts say VS Code, not your app. [Why](platforms.md#macos-permissions).
