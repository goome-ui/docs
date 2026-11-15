---
title: How mods work
---

# How mods work <kbd>0.3</kbd>

goome gets into games and engines the same way Dear ImGui does. ImGui splits it in two: a platform backend feeds it input from whatever owns the window, and a renderer backend draws its output with whatever the game already renders with. goome has the same split, except goome hands back pixels where ImGui hands back draw lists, so every renderer backend does one small job: upload the part of the frame that changed into a texture and draw it as one premultiplied alpha quad over the game.

Underneath its all [offscreen mode](offscreen-mode.md). Input goes in with `goome_push`, the ui draws, and two calls get the pixels out:

```c
goome_rect r;
if (goome_frame_dirty(g, &r)) {
    goome_frame_copy(g, pixels, r.w * 4, GOOME_FMT_RGBA_PREMUL, &r);
    upload_to_texture(pixels, r.x, r.y, r.w, r.h);
}
```

`goome_frame_dirty` fills in the real px rect that changed since you last asked and returns 1, or returns 0 when nothing changed. Right after open or a resize its the whole frame. `goome_frame_copy` copies that rect of the last frame (NULL = all of it) into your buffer at your stride, `dst` is the rect's top left.

| Format | In memory |
|:--|:--|
| `GOOME_FMT_BGRA_PREMUL` | B G R A, premultiplied. What goome has inside |
| `GOOME_FMT_RGBA_PREMUL` | R G B A, premultiplied |
| `GOOME_FMT_BGRA` | B G R A, straight alpha |
| `GOOME_FMT_RGBA` | R G B A, straight alpha |

Draw the premultiplied ones with blend `one, one minus src alpha`. The straight ones get unpremultiplied for engines that want that.

Keeping the game from seeing input that went to goome is on [Platform backends](mods-platforms.md#eaten-input).

## Which one

| You have | Go to |
|:--|:--|
| your own C or C++ game with GLFW, SDL or a Win32 window | [platform](mods-platforms.md) + [renderer](mods-renderers.md) backends |
| a Windows game you dont have the source for | [Native DLL mods](mods-native.md) |
| someone elses Unity game | [Unity mods](mods-unity.md) |
| your own Unity project | [Getting started in Unity](start-unity.md) |
| Minecraft | [Minecraft](mods-minecraft.md) |
| a Godot project | [Godot](mods-godot.md) |
| raylib, LÖVE or your own engine | [Other engines](mods-engines.md) |

## Anti-cheat

Single player and modding only. Online games with anti-cheat will ban you for this. Theres no injector and nothing that hides from anti-cheat, and there won't be.
