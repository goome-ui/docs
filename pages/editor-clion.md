---
title: CLion
---

# CLion

c-goome is a plain CMake project with presets, CLion opens it as is.

## c-goome itself

File > Open, pick the repo folder. You get Debug and Release from `CMakePresets.json` (they build into `out/debug` and `out/release`) and run configs for `hello`, `grab`, `ui` and `unit`.

## Your own project

File > New Project, C Executable. Swap its `CMakeLists.txt` for the one on [One file and building](building.md#with-cmake), reload CMake, paste the overlay from [Getting started in C](start-c.md) into `main.c` and run.

Or skip CMake for goome: `add_executable(myapp main.c goome.c)` with `goome.h` and the two line `goome.c` next to it.

## Debugging

Works normally. To run without touching your screen add `GOOME_TEST_SCRIPT=2 click 200,120; 4 key hi; end 8` to the run config's environment variables (same as the hello (test backend) config c-goome has for VS Code).

No X11 or Wayland dev packages needed, goome loads those at runtime.

On a Mac the permission prompts are for CLion, not your program ([why](platforms.md#macos-permissions)).
