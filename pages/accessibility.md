---
title: Screen readers
---

# Screen readers <kbd>0.5</kbd>

The ui kit tells screen readers whats on screen. Every frame it builds a tree out of the widgets you drew (role, name, value, where it is, and if its checked, expanded, selected or focused) and hands it to the OS accessibility api, the one Orca, Narrator, NVDA and VoiceOver read from.

When a screen reader presses a button, moves a slider, types into a box, opens a combo or focuses something, it comes back as normal input. So `if (goome_ui_button(u, "Save"))` fires like a click did, you dont write anything extra for the built in widgets.

## On and off

On by default in window mode, off for overlays and offscreen.

```c
goome_ui_a11y(u, 1);
```

```csharp
ui.A11y(true);
```

```python
ui.a11y(True)
```

```java
ui.a11y(true);
```

```rust
ui.a11y(true);
```

```go
ui.A11y(true)
```

```zig
ui.a11yOn(true);
```

```lua
ui:a11y(true)
```

```js
ui.a11y(true);
```

`goome_ui_a11y(u, 1)` turns it on anywhere, overlays too, `0` turns it off. The env var `GOOME_A11Y=0` keeps it away from the OS but still builds the tree, handy when you only want `goome_a11y_tree`. Only monitor 0 gets a tree.

## What each OS gets

| OS | Api | What goome hands over |
|:--|:--|:--|
| Linux | AT-SPI2, over the a11y dbus (libdbus loaded at runtime) | Accessible, Component, Action, Value, Text, EditableText. Focus, state, name, value, text and caret change events |
| Windows | UI Automation provider, from `WM_GETOBJECT` | Invoke, Toggle, Value, RangeValue, Selection, SelectionItem, ExpandCollapse, with focus and property change events |
| Mac | NSAccessibility on the goome view | one element per widget, frames in screen coords, the usual notifications |

Heads up, nobody has tried this with a real screen reader yet. The tests check the tree from the outside on all three (`tests/atspi.sh`, `tests/uia.ps1` and `tests/macax.sh` in c-goome), but Orca, NVDA, Narrator and VoiceOver havent been run against it by hand. If one of them acts weird please open an issue.

On Wayland a window doesnt know where it is on screen, so the rects are right inside the window but not on the screen. Most screen readers dont care, magnifiers that follow focus do.

## Built in widgets

| Widget | Role |
|:--|:--|
| windows, app root | `GOOME_ROLE_WINDOW` |
| buttons, image buttons, collapsing | `GOOME_ROLE_BUTTON` (collapsing gets expanded) |
| checkboxes, toggles | `GOOME_ROLE_CHECKBOX` |
| radios | `GOOME_ROLE_RADIO` |
| sliders, drag numbers, number inputs | `GOOME_ROLE_SLIDER` with the value, min and max |
| inputs, text editor | `GOOME_ROLE_INPUT` with the text and caret. Password inputs hand over the mask, never the real text |
| combos | `GOOME_ROLE_COMBO`, expanded while open, its list is a `GOOME_ROLE_LIST` |
| selectables, list rows | `GOOME_ROLE_ITEM` |
| tabs | `GOOME_ROLE_TAB` |
| menus, menu items | `GOOME_ROLE_MENU`, `GOOME_ROLE_MENUITEM` |
| tables, trees | `GOOME_ROLE_TABLE`, `GOOME_ROLE_TREE` |
| progress bars | `GOOME_ROLE_PROGRESS` |
| labels, headings, the status bar | `GOOME_ROLE_TEXT` |
| images | `GOOME_ROLE_IMAGE` |
| modals | `GOOME_ROLE_DIALOG` |

The name is the label you gave the widget, without the `##` part. So `"##close"` gets read as nothing and `"x##close"` gets read as "x". Tooltips dont get read, pick labels that make sense out loud.

## Your own widgets

`goome_ui_custom` items dont show up in the tree unless you say what they are. Call `goome_ui_a11y_role` (and `goome_ui_a11y_value` if it has one) right before it:

```c
char hue_text[16];
snprintf(hue_text, sizeof(hue_text), "%.0f degrees", hue);
goome_ui_a11y_role(u, GOOME_ROLE_SLIDER, "Hue");
goome_ui_a11y_value(u, hue_text);
goome_ui_item it;
goome_ui_custom(u, "hue", 200, 24, GOOME_ITEM_FOCUSABLE | GOOME_ITEM_DRAG_X, &it);
if (it.clicked) hue = 0;
```

```csharp
ui.A11yRole(Role.Slider, "Hue");
ui.A11yValue($"{hue:0} degrees");
ui.Custom("hue", 200, 24, ItemFlags.Focusable | ItemFlags.DragX, out var it);
if (it.Clicked) hue = 0;
```

```python
ui.a11y_role(goome.ROLE_SLIDER, "Hue")
ui.a11y_value("%.0f degrees" % hue)
it = ui.custom("hue", 200, 24, goome.ITEM_FOCUSABLE | goome.ITEM_DRAG_X)
if it.clicked:
    hue = 0
```

```java
ui.a11yRole(A11yNode.ROLE_SLIDER, "Hue");
ui.a11yValue(String.format("%.0f degrees", hue));
Item it = ui.custom("hue", 200, 24, ItemFlag.FOCUSABLE, ItemFlag.DRAG_X);
if (it.clicked()) hue = 0;
```

```rust
ui.a11y_role(goome::ROLE_SLIDER, "Hue");
ui.a11y_value(&format!("{:.0} degrees", hue));
let it = ui.custom("hue", 200.0, 24.0, goome::ITEM_FOCUSABLE | goome::ITEM_DRAG_X);
if it.clicked {
    hue = 0.0;
}
```

```go
ui.A11yRole(goome.RoleSlider, "Hue")
ui.A11yValue(fmt.Sprintf("%.0f degrees", hue))
it, _ := ui.Custom("hue", 200, 24, goome.ItemFocusable|goome.ItemDragX)
if it.Clicked {
	hue = 0
}
```

```zig
var buf: [32]u8 = undefined;
ui.a11yRole(.slider, "Hue");
ui.a11yValue(try std.fmt.bufPrintZ(&buf, "{d:.0} degrees", .{hue}));
var it: goome.Item = undefined;
_ = ui.custom("hue", 200, 24, goome.c.GOOME_ITEM_FOCUSABLE | goome.c.GOOME_ITEM_DRAG_X, &it);
if (it.clicked != 0) hue = 0;
```

```lua
ui:a11y_role(goome.ROLE_SLIDER, "Hue")
ui:a11y_value(string.format("%.0f degrees", hue))
local hit, it = ui:custom("hue", 200, 24, goome.ITEM_FOCUSABLE + goome.ITEM_DRAG_X)
if it.clicked then hue = 0 end
```

```js
ui.a11yRole(goome.ROLE_SLIDER, "Hue");
ui.a11yValue(`${hue.toFixed(0)} degrees`);
const it = ui.custom("hue", 200, 24, goome.ITEM_FOCUSABLE | goome.ITEM_DRAG_X);
if (it.clicked) hue = 0;
```

A press from the screen reader shows up as `it.clicked`. Some tips:

- make it `GOOME_ITEM_FOCUSABLE` so keyboard and screen reader users can get to it at all, and handle arrows in `it.key`
- the value is text, say it how a person would ("40 percent", "3 of 5"), not the raw number
- backgrounds and decoration with `GOOME_ITEM_NO_HIT` dont need a role, leave them out of the tree
- the role and value only apply to the very next `goome_ui_custom`, call them again every frame

## Engines: goome_a11y_tree

In an engine goome cant talk to the OS for you, the engine owns the window. Read the tree after `goome_ui_end` and hand it to your engines own accessibility stuff:

```c
goome_a11y_node nodes[256];
int n = goome_a11y_tree(u, nodes, 256);
for (int i = 0; i < n && i < 256; i++) {
    goome_a11y_node *a = &nodes[i];
    printf("%u role %d parent %d '%s' = '%s' at %.0f,%.0f\n", (unsigned)a->id, a->role, a->parent, a->label, a->value, a->x, a->y);
}
```

It returns how many nodes there are, even if thats more than `max`, so you can grow your array. Turn it on first with `goome_ui_a11y(u, 1)` since offscreen starts with it off.

| Field | |
|:--|:--|
| `role` | `GOOME_ROLE_*` |
| `parent` | index of the parent node in the same array, -1 for the root |
| `states` | `GOOME_A11Y_FOCUSED`, `CHECKED`, `DISABLED`, `EXPANDED`, `SELECTED` ored together |
| `x, y, w, h` | logical, from the top left of the canvas |
| `label`, `value` | utf-8, cut to fit |
| `id` | stays the same every frame, use it to match nodes up between frames |
| `num, min, max` | for sliders and progress bars |
| `caret` | for inputs, byte offset of the caret |

To send a screen reader action back, push a `GOOME_CONTROL` event and feed it to the ui like any other event:

```c
goome_event e = {0};
e.type = GOOME_CONTROL;
snprintf(e.msg, sizeof(e.msg), "a11y press %u", (unsigned)id);
goome_push(g, &e);
```

The commands are `a11y press <id>`, `a11y focus <id>`, `a11y expand <id>`, `a11y collapse <id>` and `a11y set <id> <text>` (for inputs and sliders).

## What actually got tested

Being honest here, so nobody thinks its more than it is:

- Linux - `tests/atspi.sh` runs a real AT-SPI stack (its own dbus, Xvfb, the bus launcher and registryd) and drives the window with libatspi, the same library Orca uses. It reads names, roles, values and states and presses buttons through Action. That runs in CI. Orca itself wasnt run against it yet
- Windows - `tests/uia.ps1` walks the tree with System.Windows.Automation and invokes, toggles and sets values, on the CI runner. Narrator and NVDA havent been tried yet
- Mac - `tests/macax.sh` reads it with AXUIElement from another process, or calls the same NSAccessibility methods from inside the app when the runner wont trust it. VoiceOver hasnt been tried yet

So the apis are tested with the same calls screen readers make, but no person has used a goome app with a real screen reader yet. If you do and something reads wrong, please open an issue, thats the most useful bug report goome can get right now.
