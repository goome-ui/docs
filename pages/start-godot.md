---
title: Getting started in Godot
---

# Getting started in Godot <kbd>0.3</kbd>

Godot 4.4+. [godot-goome](https://github.com/goome-ui/godot-goome) is an addon with one node, `GoomeView`, and you write the ui in GDScript every frame. No C# and no godot-cpp needed.

To start from a project that already builds, `goome new my-app --lang godot` makes one from the [Godot template](https://github.com/goome-ui/goome-app-template-godot), see [Templates and goome new](templates.md) <kbd>0.4</kbd>.

## Get the addon

Its not on the Godot Asset Library. Download `godot-goome-0.5.0.zip` from the [releases page](https://github.com/goome-ui/godot-goome/releases/latest) and unzip it into your project, so you end up with `res://addons/goome/` and the libs in `bin/`. Building it yourself is on [Godot](mods-godot.md#get-it).

For one exact version instead of the newest, see [Versions](versions.md).

## Hello

1. Make a scene with a `CanvasLayer` and a `GoomeView` under it (Add Node, search for Goome).
2. Set the view's anchors to Full Rect.
3. Attach a script to the view:

```gdscript
extends GoomeView

var clicks := 0


func _goome_frame(ui: GoomeUI) -> void:
	if ui.window("Hello", Rect2(40, 40, 240, 0)):
		if ui.button("Click me"):
			clicks += 1
		ui.label("clicked %d times" % clicks)
	ui.window_end()
```

4. F6 runs the scene.

`_goome_frame` gets called every frame goome draws. The `Rect2` is only where the window starts, h 0 fits the content. Always call `window_end`, even when `window` gave back false.

The `goome_frame` signal and how input gets eaten are on [Godot](mods-godot.md), and the full `GoomeUI` list is in the [godot-goome readme](https://github.com/goome-ui/godot-goome#readme). Editor stuff is on [Godot editor](editor-godot.md).
