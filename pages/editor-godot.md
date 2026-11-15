---
title: Godot editor
---

# Godot editor <kbd>0.3</kbd>

## Putting the addon in

Copy `addons/goome` into your project so its at `res://addons/goome/`, then open the project. `GoomeView` shows up in Add Node right away, the GDExtension loads by itself.

Project Settings > Plugins > goome is optional. All it does is print `goome: the native lib didnt load` when `bin/` has no lib for your OS.

The extension isnt hot reloadable. After you swap the lib in `bin/` (a new zip or a `./build.sh`), restart the editor.

## Running and debugging

F5 runs the main scene, F6 the open one. Your `_goome_frame` is plain GDScript, so breakpoints and `print` work in it. Errors from a wrong call (like using `ui` outside `_goome_frame`) show up once in the Errors tab.

Your ui only shows up when the game runs, the editor doesnt call `_goome_frame`. To check if a spot hits the ui from your own code, `$UI/GoomeView.hit(position)`.

Headless runs work too, `godot --headless --path yourproject` draws the frames without a window. godot-goome's own test does that, see `tests/run.sh`.

## Gotchas

- `Could not find base class "GoomeView"` means the lib didnt load. Check `bin/` has the one for your OS, and on a Mac clear the quarantine: `xattr -dr com.apple.quarantine addons/goome`.
- Only normal single precision Godot builds, not double precision ones.
- Dont override `_gui_input`, `_has_point` or `_input` in a script that extends `GoomeView`, the view uses them. Put your own input on another node.
- A game camera under the view needs a `CanvasLayer` above it, otherwise the ui moves with the camera.
- Exporting: the `.gdextension` file lists the libs, Godot packs the one for the target OS by itself.
