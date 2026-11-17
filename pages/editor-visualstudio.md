---
title: Visual Studio
---

# Visual Studio

CI builds goome with `cl` from the Visual Studio on the GitHub runner (2026 at the moment) and runs the CMake build there. 2019 and 2022 should work the same, nobody has tried them lately.

## C, your own project

CMake is easiest. Take the `CMakeLists.txt` from [One file and building](building.md#with-cmake), File > Open > Folder, pick `myapp.exe` as the startup item and F5.

With a normal .sln: empty C++ console project, add `goome.h`, a `goome.c` with the two implementation lines and your `main.c`. .c files compile as C and theres nothing to add in the linker settings.

## C, inside the c-goome repo

File > Open > Folder on the repo. Pick Debug or Release at the top (from `CMakePresets.json`), `hello.exe` as startup item, F5. `ui.exe` is the ui demo, `unit.exe` the tests (or Test > Run CTests).

## C#

1. Build `goome.dll` once: `./build.sh` in csharp-goome from Git Bash with mingw gcc, or `./build.sh win` from Linux or WSL. It goes in `runtimes/win-x64/native/`.
2. Open `csharp-goome.sln` (GoomeSharp, the tests, and the Hello, Grab and UiDemo examples).
3. Right click Hello, Set as Startup Project, F5.

For your own app right click the project, Manage NuGet Packages, and install GoomeSharp from nuget.org. Or add `src/GoomeSharp/GoomeSharp.csproj` to the solution and reference it.

## When it goes wrong

- `DllNotFoundException: goome` means `goome.dll` isnt next to the exe. Rebuild after `build.sh`, or set `GOOME_NATIVE` to its folder.
- Turn on Enable native code debugging in the project's debug settings and breakpoints in `goome_lib.c` work from C#.
- Made for Windows 10 and 11, and it runs in a VM with no GPU (layered windows are plain GDI), thats what the CI runner is. The runner is Windows Server 2025, a 10 or 11 desktop edition isnt in CI.
