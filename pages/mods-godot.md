---
title: Godot
---

# Godot <kbd>0.3</kbd>

[godot-goome](https://github.com/goome-ui/godot-goome) is goome as a Godot 4.4+ addon. Drop a `GoomeView` in your scene, write `_goome_frame(ui)`, and you get the whole UI kit on top of your game. goome draws offscreen into an ImageTexture, so it works with every Godot renderer. Its a GDExtension in plain C against Godot's own `gdextension_interface.h`, no godot-cpp and no C#.

## Get it

Easy way: download `godot-goome-<version>.zip` from the [releases page](https://github.com/goome-ui/godot-goome/releases/latest) and unzip it into your project. Its not on the Godot Asset Library. You get `res://addons/goome/` with the libs already in `bin/`, and `GoomeView` shows up in Add Node.

Or build it, you only need a C compiler:

```sh
git clone https://github.com/goome-ui/godot-goome
cd godot-goome
./build.sh
cp -r addons/goome /path/to/your/project/addons/
```

`./build.sh win` makes the windows dll with mingw (from linux too), `./build.sh universal` on a mac makes one dylib for arm64 and x86_64. Turning the plugin on in Project Settings is optional, it only tells you when the lib for your OS is missing.

## A menu

```gdscript
extends GoomeView

var volume := 0.5
var god_mode := false


func _goome_frame(ui: GoomeUI) -> void:
	if ui.window("Settings", Rect2(40, 40, 300, 0)):
		volume = ui.slider("Volume", volume, 0.0, 1.0, "%.2f")
		god_mode = ui.toggle("God mode", god_mode)
		if ui.button("Respawn"):
			get_tree().reload_current_scene()
	ui.window_end()
```

Put it on a `GoomeView` that fills the screen (anchors Full Rect, under a CanvasLayer if your game has a camera). The rect is only the start spot and size, h 0 fits the content. Always call `window_end`, even when `window` returned false.

Keep your ui code somewhere else with the `goome_frame` signal:

```gdscript
func _ready() -> void:
	$UI/GoomeView.goome_frame.connect(draw_ui)

func draw_ui(ui: GoomeUI) -> void:
	if ui.window("Player", Rect2(20, 20, 220, 0), GoomeUI.WIN_MOVE | GoomeUI.WIN_COLLAPSE):
		hp = ui.slider_int("HP", hp, 0, 100)
	ui.window_end()
```

Every widget takes the current value and hands back the new one, same as C. The ui only works inside `_goome_frame` or the signal. The full list of `GoomeUI` calls is in the [godot-goome readme](https://github.com/goome-ui/godot-goome#readme).

## Mouse and keys

The view only counts as there where goome drew something that takes clicks (`_has_point`), so a click next to a goome window goes on to your other Controls or `_unhandled_input`.

Start dragging a slider or a window and the view keeps the mouse until you let go, even off the ui. Those moves get `accept_event()`, so a camera in `_unhandled_input` doesnt turn. Keys only go to goome while a text box has focus or a modal is open, and then they're eaten too.

`Input.is_action_pressed` doesnt go through the GUI, so nothing gets eaten there. Ask the view:

```gdscript
if not $UI/GoomeView.wants_keyboard():
	position += direction * speed * delta
if not $UI/GoomeView.wants_mouse():
	look_around(mouse_delta)
```

Dont override `_gui_input`, `_has_point` or `_input` in a script that extends `GoomeView`, the view needs those. Use another node for your own input.

## The node

| | |
|:--|:--|
| `redraw_every_frame` | on by default. Off only draws when something changed or you call `redraw()` |
| `take_keyboard` | on by default. Off and goome never gets keys |
| `sync_clipboard` | on by default, ctrl+c/x/v go through DisplayServer |
| `light_theme` | the light theme |
| `pixel_scale` | texture px per ui px, 0 follows the screen scale |
| `hit(position)` | does that local spot hit the ui |
| `get_texture()` / `get_image()` | the ImageTexture and its Image, for the ui on a mesh or a screenshot |
| `push_text(text)` | types into the focused box from code |

Only the changed rect gets copied into the Image, but Godot cant upload part of a texture, so on frames where something changed the whole texture goes up.

Godot 4.4 and newer, single precision builds only. The zip has 64 bit linux and windows libs plus a universal mac one.
