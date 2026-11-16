---
title: One file and building
---

# One file and building

## The single header

`goome.h` in the root of c-goome is the whole library, API on top and the implementation behind `#ifdef GOOME_IMPLEMENTATION`. In exactly one .c file:

```c
#define GOOME_IMPLEMENTATION
#include "goome.h"
```

and a plain `#include "goome.h"` everywhere else. Two files with `GOOME_IMPLEMENTATION` = duplicate symbols.

Set these before the implementation include:

| Define | What |
|:--|:--|
| `GOOME_NO_DRAW` | no drawing layer, images, fonts or UI kit. You still get the overlay, events, hotkeys and capture |
| `GOOME_NO_UI` | everything but the UI kit |

Compile it as C99 or newer. From C++ include the header normally, the implementation file just has to be a `.c`.

## What it needs

Nothing to link, not even libm. Linux dlopens libwayland-client, libX11, xkbcommon, gio and gstreamer when needed. Windows loads gdi32, shcore and the rest with LoadLibrary. Mac dlopens the frameworks and goes through the objc runtime, no .m file and no `-framework` flags.

CI tests gcc, clang, mingw and MSVC.

## With CMake

c-goome next to your code (a git submodule is fine):

```cmake
cmake_minimum_required(VERSION 3.16)
project(myapp C)
set(CMAKE_C_STANDARD 99)
set(GOOME_EXAMPLES OFF)
set(GOOME_TESTS OFF)
add_subdirectory(c-goome)
add_executable(myapp main.c)
target_link_libraries(myapp PRIVATE goome)
```

`GOOME_EXAMPLES` and `GOOME_TESTS` default to on. `GOOME_NO_DRAW` is the third option.

## Building goome itself

```sh
./build.sh          # lib, examples and tests into build/
./build.sh test     # same, then runs the unit tests
./build.sh win      # windows exes with mingw into build-win/
./build.sh single   # just remakes goome.h
```

`WERROR=1` makes warnings errors, CI always sets it. Theres also a CMake project with presets (for Visual Studio, Rider, CLion and VS Code) and `ctest` runs the unit tests.

Dont edit the root `goome.h`. `tools/single.py` makes it from `include/` and `src/`, and `build.sh` runs that every time.

## The bindings

- csharp-goome: `./build.sh` puts `libgoome.so` / `libgoome.dylib` in `runtimes/<rid>/native/`, `./build.sh win` makes `goome.dll` with mingw, `dotnet pack src/GoomeSharp` makes the nupkg.
- java-goome: `./build.sh` puts `libgoome.so` in `build/natives/<os>/`, `./gradlew :goome:jar` packs it into `goome/build/libs/goome-<version>.jar` with whatever natives are there. Gradle needs a JDK 25, the jar runs on 17+.
- godot-goome: `./build.sh` builds the addon lib into `addons/goome/bin/`, `./build.sh win` the dll with mingw.
- Python: `pip install` builds the lib with your C compiler. In a clone `./build.sh test` builds `goome/_native/libgoome.so` and runs the tests.
- rust-goome: `cargo build`, `goome-sys` compiles goome.h with the `cc` crate. `cargo test` runs the tests.
- node-goome: `npm install` and `npm run build`, node-gyp compiles goome.h into `goome.node`. `npm test` runs the tests.
- go-goome: nothing to build first, cgo compiles goome.h. `go test ./...` runs the tests.
- zig-goome: `zig build test`, and `zig build examples` builds the examples.
- lua-goome: `LUA_INC=/usr/include/lua5.4 ./build.sh test` builds `goome.so` and runs the tests, `LUA=luajit` with the luajit headers for LuaJIT.
