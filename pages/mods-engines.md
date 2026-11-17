---
title: Other engines
---

# Other engines <kbd>0.3</kbd>

Your own game or an engine with no goome package of its own: nothing gets injected. goome runs [offscreen](offscreen-mode.md) and the engine draws its frame as a texture. The examples repo has small ones in [engines](https://github.com/goome-ui/examples/tree/main/engines), each with a short README and the exact build command.

| Folder | Engine | How |
|:--|:--|:--|
| `raylib` | raylib 5.5 | offscreen goome + the `goome_gl3` [renderer backend](mods-renderers.md) in raylib's GL context |
| `sdl_gl3` | SDL2 + OpenGL 3 | the `goome_sdl2` [platform backend](mods-platforms.md) + `goome_gl3`, the Dear ImGui style setup |
| `love2d` | LÖVE (Lua) | LuaJIT ffi to a goome shared lib, the frame copied into a love Image |

All of them keep input from the game while goome wants it. CI builds each one and runs it for 8 seconds on Linux under Xvfb with a software GL, with no check on the picture or the input. The SDL2 backend itself has a test in c-goome that checks pixels and eaten input. SDL3: swap `goome_sdl2.h` for `goome_sdl3.h` and `sdl2` for `sdl3` in the names. CI never builds `goome_sdl3.h` (it skips the test when `libsdl3-dev` isnt in apt, which it isnt on Ubuntu 24.04). I ran c-goome's `sdl3_gl` test by hand on 2026-11-17 with SDL 3.4.2 from Ubuntu 26.04, gcc 15 and Mesa llvmpipe under Xvfb: it builds with `-Werror` and passes for gl3 and for GLES 3 (frame matches goome's, input eaten, text typed, GL state kept). That is one Linux run, not CI, and not Windows or macOS.

## raylib

raylib doesnt need a platform backend, push its input yourself and check `goome_ui_wants` before the game reads anything:

```c
int wants = goome_ui_wants(u);
if (!(wants & GOOME_WANT_MOUSE)) distance -= GetMouseWheelMove() * 0.5f;
if (!(wants & GOOME_WANT_KEYBOARD) && IsKeyPressed(KEY_SPACE)) paused = !paused;

BeginDrawing();
draw_game();
rlDrawRenderBatchActive();
goome_gl3_render(g);
EndDrawing();
```

`rlDrawRenderBatchActive` flushes raylib's own batch first, otherwise goome draws under it. On a resize call `goome_gl3_resize(g, GetScreenWidth(), GetScreenHeight(), 1)`.

```sh
curl -L https://github.com/raysan5/raylib/releases/download/5.5/raylib-5.5_linux_amd64.tar.gz | tar xz
cc -std=c99 -O2 -I../../vendor -I../../vendor/backends -Iraylib-5.5_linux_amd64/include main.c ../../vendor/goome.c raylib-5.5_linux_amd64/lib/libraylib.a -lm -lpthread -ldl -o raylib_demo
```

## SDL2 + OpenGL 3

Every event goes to `goome_sdl2_event` first and the game skips it when that returns 1, then `goome_gl3_render` right before `SDL_GL_SwapWindow`. All GL calls go through `SDL_GL_GetProcAddress`, no `-lGL` and no loader library.

```sh
sudo apt install libsdl2-dev
cc -std=c99 -O2 -I../../vendor -I../../vendor/backends main.c ../../vendor/goome.c $(sdl2-config --cflags --libs) -lm -o sdl_gl3
```

## LÖVE

No C glue at all. `main.lua` loads goome as a shared library with LuaJIT's ffi, copies only the changed part of each frame into an `ImageData` and draws it with premultiplied alpha:

```lua
if goome.goome_frame_dirty(g, dirty) ~= 0 then
    local w = frame_data:getWidth()
    local base = ffi.cast("uint8_t *", frame_data:getFFIPointer()) + (dirty.y * w + dirty.x) * 4
    goome.goome_frame_copy(g, base, w * 4, FMT_RGBA_PREMUL, dirty)
    frame_image:replacePixels(frame_data)
end

love.graphics.setBlendMode("alpha", "premultiplied")
love.graphics.draw(frame_image, 0, 0)
love.graphics.setBlendMode("alpha")
```

```sh
cc -O2 -shared -fPIC -I../../vendor ../../vendor/goome.c -lm -lpthread -ldl -o libgoome.so
love .
```

The lib has to sit next to `main.lua` (`goome.dll` on Windows, `libgoome.dylib` on macOS) and it has to run from the folder, a zipped `.love` cant load a library from inside itself. The ffi declarations copy goome's structs by hand, so when a struct changes in a new goome, change it there too.

## Anything else

If the engine can put pixels in a texture it can run goome. Push its input, check `goome_ui_wants`, copy the frame with `goome_frame_dirty` and `goome_frame_copy` ([How mods work](mods.md) has that bit) and draw one premultiplied quad. Godot already has its own addon, see [Godot](mods-godot.md).
