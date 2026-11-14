---
title: Taking input from the game
---

# Taking input from the game <kbd>0.3</kbd>

Drag a slider in an overlay over a game and the camera used to spin with it. The game stayed the focused window and kept reading the mouse. Now the UI kit grabs the mouse for the whole drag and gives it back when you let go.

Clicks on hit rects already never reached the game, and a focused text box already turned on `goome_keyboard`, so keys stay with goome while you type. Both still work like that.

## goome_grab

```c
if (goome_grab(g, 1) == GOOME_OK && goome_grabbed(g)) printf("its ours\n");
goome_grab(g, 0);
```

Overlay mode: goome takes the focus and the pointer until `goome_grab(g, 0)`, and motion keeps coming even off your hit rects. Window mode: the pointer gets captured, a drag keeps going outside the window. Offscreen and test just remember it.

`GOOME_CAP_GRAB` in `goome_caps` means the OS gives a real pointer grab. On Wayland its `GOOME_OK` without the cap, see the table below. A backend that cant grab at all says `GOOME_ENOTSUP`.

You barely ever call it yourself, the UI kit does it.

## What the UI kit grabs

Anything you drag grabs while the button is down, even a window title bar or a table column. [Custom widgets](ui-custom.md) grab too when they have a drag flag. A plain button click never grabs.

It lets go on a `GOOME_UP` from anywhere, on focus loss, when the widget stops getting drawn and in `goome_ui_free`. It cant get stuck.

```c
goome_ui_auto_grab(u, GOOME_WANT_KEYBOARD);
```

That keeps the keyboard part and stops the mouse grab. `0` turns both off and its all up to you, the default is `GOOME_WANT_MOUSE | GOOME_WANT_KEYBOARD`. The keyboard part is the old `goome_keyboard` on text boxes.

## goome_ui_wants

Same as `WantCaptureMouse` and `WantCaptureKeyboard` in Dear ImGui. Check it before your own code reads the mouse or keys.

```c
int w = goome_ui_wants(u);
if (!(w & GOOME_WANT_MOUSE)) mouse_look(dx, dy);
if (!(w & GOOME_WANT_KEYBOARD)) move_player();
```

| Bit | On while |
|:--|:--|
| `GOOME_WANT_MOUSE` | the pointer is over a hit rect, a press or drag is going (even off the widget), or a popup or modal is open |
| `GOOME_WANT_KEYBOARD` | a widget has keyboard focus (text box, editor, tab focus) or a modal is open |

It's up to date after `goome_ui_feed` and after `goome_ui_end`. It still works with `goome_ui_auto_grab(u, 0)`.

Offscreen has no OS to grab from, so this is all an engine gets. The [platform backends](mods-platforms.md) use it to eat input.

## What each OS does

| Where | Overlay | Window mode |
|:--|:--|:--|
| Windows | `WS_EX_NOACTIVATE` comes off and the overlay gets `SetForegroundWindow` + `SetCapture`. The game isnt foreground anymore so its raw input stops. The old window gets focus back after, unless the keyboard is still on. No low level hooks, anti-cheat flags those | `SetCapture` |
| X11 | `XGrabPointer` on the overlay, and focus moves the same way the keyboard does. It remembers `_NET_ACTIVE_WINDOW` and activates it again after `XUngrabPointer` | `XGrabPointer` |
| GNOME | the X11 overlay on XWayland, so same as X11 | same as X11 |
| Wayland | keyboard interactivity goes exclusive so the game loses focus. Theres no pointer grab in Wayland, but the press that started the drag keeps the pointer with us until the button goes up. Returns `GOOME_OK` without `GOOME_CAP_GRAB` | does nothing |
| macOS | activates us like the keyboard does, gives the old app back after. The panel keeps getting the mouse off the hits until the grab ends | nothing extra, cocoa keeps a drag with its window anyway |
| offscreen | stored, read `goome_grabbed` or `goome_ui_wants` | stored |
| test | stored, and queues a `GOOME_CONTROL` saying `grabbed 1` or `grabbed 0`. While grabbed, clicks land everywhere | same |

## In C#, Python and Java

```csharp
ui.End();
if (!ui.WantsMouse) MouseLook();
if (!ui.WantsKeyboard) MovePlayer();
ui.AutoGrab = Want.Keyboard;
g.Grab(true);
Console.WriteLine(g.Grabbed);
```

```python
ui.end()
if not ui.wants_mouse:
    mouse_look()
if not ui.wants_keyboard:
    move_player()
ui.auto_grab = goome.WANT_KEYBOARD
g.grab(True)
print(g.grabbed)
```

```java
ui.end();
if (!ui.wantsMouse()) mouseLook();
if (!ui.wantsKeyboard()) movePlayer();
ui.autoGrab(Goome.WANT_KEYBOARD);
g.grab(true);
System.out.println(g.grabbed());
```

`ui.Wants` / `ui.wants` give both bits at once, `Want.Mouse | Want.Keyboard` in C#, `goome.WANT_MOUSE` / `goome.WANT_KEYBOARD` in Python and `Goome.WANT_MOUSE` / `Goome.WANT_KEYBOARD` in Java.

## In Unity

`GoomeView` has `WantsMouse` and `WantsKeyboard`. `WantsMouse` also stays on when a drag goes off the ui, `PointerOverUi` doesnt. With more than one view, `GoomeView.AnyWantsMouse` and `GoomeView.AnyWantsKeyboard` check all of them.

On the new Input System, `blockGameInput` (on by default) turns off every enabled InputAction on the mouse while goome wants the mouse, same for keyboard actions, and turns exactly those back on after. The old `Input` class cant be blocked, check it yourself:

```csharp
if (!view.WantsMouse) transform.Rotate(0, Input.GetAxis("Mouse X") * 2, 0);
```

`GoomeOverlay` (the desktop overlay from a standalone build) uses the C grab, nothing extra to do there. Modding someone elses Unity game is on [Unity mods](mods-unity.md).
