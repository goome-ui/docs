---
title: Getting started in Lua
---

# Getting started in Lua <kbd>0.5</kbd>

Lua 5.4 or LuaJIT, which is what LÖVE runs. CI tests both standalone, not inside LÖVE (the [LÖVE example](mods-engines.md) uses the shared lib with ffi instead). [lua-goome](https://github.com/goome-ui/lua-goome) is one C module, `goome.so` (or `goome.dll`) with goome built in.

To start from a project that already builds, `goome new my-app --lang lua` makes one from the [Lua template](https://github.com/goome-ui/goome-app-template-lua), see [Templates and goome new](templates.md) <kbd>0.5.1</kbd>.

## Pick what you are making

`goome.open` is the overlay, `goome.app` a window, `goome.open_offscreen` a buffer with no window. `end` is a Lua keyword, so `goome_end` and `goome_ui_end` are `g:finish(c)` and `ui:finish()` here.

### Overlay on top of everything

```lua
local goome = require("goome")

local g = assert(goome.open("my overlay"))
local running = true
while running do
  for ev in g:events(16) do
    if ev.type == goome.QUIT then running = false end
  end
  local c = g:begin(0)
  if c then
    c:round_rect(40, 40, 240, 50, 12, 0xE0202838)
    c:text(56, 56, "on top of everything", 0xFFFFFFFF)
    g:finish(c)
  end
end
g:close()
```

More on [Overlay mode](overlay-mode.md).

### Make a normal app

```lua
local goome = require("goome")

local app = goome.app("My app", 960, 640)
local clicks = 0
app:frame(function(ui)
  if ui:button("Click me") then clicks = clicks + 1 end
  ui:label("clicked " .. clicks .. " times")
end)
app:run()
```

More on [Window mode](window-mode.md).

### Inside a game engine

```lua
local g = goome.open_offscreen(320, 200)
local c = g:begin(0)
c:round_rect(20, 20, 280, 160, 16, 0xFF6FDC5F)
g:finish(c)
local frame = g:last_frame()
upload_texture(frame:ptr(), frame.w, frame.h)
```

In LÖVE `g:frame_copy` writes straight into an `ImageData:getPointer()`. `examples/love` in the repo is a small LÖVE scene with a goome settings window on top. More on [Offscreen mode](offscreen-mode.md).

## Install

Its not on the luarocks.org server, so [LuaRocks](https://luarocks.org/) takes the rock from the [releases page](https://github.com/goome-ui/lua-goome/releases):

```sh
luarocks install https://github.com/goome-ui/lua-goome/releases/download/v0.5.2/goome-0.5.2-1.src.rock
```

Add `--lua-version 5.1` for a LuaJIT tree. Or without LuaRocks:

```sh
LUA_INC=/usr/include/lua5.4 ./build.sh test
LUA_INC=/usr/include/luajit-2.1 LUA=luajit ./build.sh test
```

You need a C compiler and the Lua headers:

- Debian / Ubuntu: `sudo apt install build-essential liblua5.4-dev`
- Mac: `xcode-select --install`
- Windows: [mingw-w64](https://www.mingw-w64.org/) from git bash, with `LUA_LIB` pointing at your `lua54.dll` or `lua51.dll`

On Linux and Mac the module never links Lua, one build works for any interpreter that matches the headers it was built with. For another version see [Versions](versions.md).

## Your first overlay

```lua
local goome = require("goome")

local g, err = goome.open("my overlay")
if not g then error("no overlay here: " .. err) end
local pace = goome.pacer(60)
local running = true
while running do
  for ev in g:events(pace:wait()) do
    if ev.type == goome.QUIT then running = false end
    if ev.type == goome.DOWN then print(string.format("clicked at %.0f,%.0f", ev.x, ev.y)) end
  end
  local c = g:begin(0)
  if c then
    c:round_rect(100, 100, 200, 80, 12, 0xE0202838)
    c:text(116, 128, "click me", 0xFFFFFFFF, true)
    c:hit(100, 100, 200, 80)
    g:finish(c)
  end
end
g:close()
```

Colors are `0xAARRGGBB` numbers, positions are logical desktop coords, same as C. Things that can fail for a normal reason give back `nil, message, code` like `io.open`, so `assert(...)` works.

## How it maps to C

Names are the C ones without `goome_`, constants without `GOOME_` (`goome.WIN_MOVE`). Widgets dont take pointers, they hand back the new value and if it changed:

```lua
volume, changed = ui:slider("Volume", volume, 0, 1, "%.2f")
```

Begins and ends work like C, `ui:window` / `ui:window_end` and so on. Lists are 1 based like the rest of Lua, so `ui:combo` and `ui:tabs` use 1 for the first one. Flags add up with `+`.

## Editors

**VS Code**: the Lua extension by sumneko (`sumneko.lua`). goome is a C module so you dont get completion on it, the [API reference](api-core.md) has the C names and they map one to one. For LÖVE theres Love2D extensions that start the game from the editor. The [goome extension](editor-vscode.md) side panel and `.goome.json` preview work in a Lua project too, its snippets are only C, C#, Python and Java for now.

**IntelliJ IDEA**: the EmmyLua plugin does Lua there, and the [goome plugin](editor-intellij.md) can sit next to it for the tool window and preview.

`lua examples/ui_demo.lua` from a clone (after `build.sh`) shows every widget. Set `GOOME_BACKEND=test` to run without touching your screen ([Testing without a screen](testing.md)).
