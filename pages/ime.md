---
title: Typing other languages
---

# Typing other languages <kbd>0.5</kbd>

Chinese, Japanese and Korean get typed through an IME: you type, a little candidate window pops up, you pick, and the finished text lands in the app. Dead keys (´ then e = é) and compose work the same way. goome talks to the IME on every desktop, so inputs and the text editor just work with it.

## In the ui kit

Nothing to do. `goome_ui_input`, `goome_ui_input_ex` and `goome_ui_text_edit` turn the IME on while they have focus and off when they lose it, and put the candidate window right under the caret. While you compose, the text being composed shows up underlined at the caret with the IMEs own caret in it. When you pick something it gets inserted like a paste: it replaces the selection and gets its own undo step.

- one line inputs turn newlines into spaces, number inputs drop anything that isnt a number
- password and read only inputs never turn it on
- apps that never focus an input never touch the IME, typing works exactly like before

## Two new events

| Event | What it is |
|:--|:--|
| `GOOME_TEXT` | an IME, dead key or compose finished some text. Could be one letter or a whole sentence |
| `GOOME_PREEDIT` | the text being composed changed. `id` is the caret as a byte offset into it. Empty means composing ended |

`msg` only holds the first 63 bytes, `goome_event_text(g)` has the whole thing until the next poll. Plain keys stay `GOOME_KEY` with their text like always, `GOOME_TEXT` is only for stuff an IME made, so nothing gets typed twice.

## Your own text widget

Turn it on while your widget has focus and tell it where the caret is (logical coords, the candidate window goes under it):

```c
goome_rect caret = {x + caret_x, y, 2, 20};
goome_text_input(g, focused, &caret);

goome_event ev;
while (goome_poll(g, &ev, 16) > 0) {
    if (ev.type == GOOME_TEXT) insert(goome_event_text(g));
    if (ev.type == GOOME_PREEDIT) show_composing(goome_event_text(g), goome_preedit_cursor(g));
}
```

```csharp
g.TextInput(focused, new Rect(x + caretX, y, 2, 20));
while (g.Poll(out var ev, 16))
{
    if (ev.Type == EventType.Text) Insert(g.EventText);
    if (ev.Type == EventType.Preedit) ShowComposing(g.EventText, g.PreeditCursor);
}
```

```python
g.text_input(focused, (x + caret_x, y, 2, 20))
for ev in g.events(16):
    if ev.type == goome.TEXT:
        insert(g.event_text())
    if ev.type == goome.PREEDIT:
        show_composing(g.event_text(), g.preedit_cursor())
```

```java
g.textInput(focused, new Rect(x + caretX, y, 2, 20));
for (Event e : g.events(16)) {
    if (e.type() == Goome.TEXT) insert(g.eventText());
    if (e.type() == Goome.PREEDIT) showComposing(g.eventText(), g.preeditCursor());
}
```

```rust
g.text_input(focused, Some(goome::Rect::new(x + caret_x, y, 2.0, 20.0)))?;
for ev in g.events(16) {
    if ev.kind == goome::TEXT {
        insert(&g.event_text());
    }
    if ev.kind == goome::PREEDIT {
        show_composing(&g.event_text(), g.preedit_cursor());
    }
}
```

```go
g.TextInput(focused, &goome.Rect{X: x + caretX, Y: y, W: 2, H: 20})
for ev := range g.Events(16) {
	switch ev.Type {
	case goome.EventText:
		insert(g.EventText())
	case goome.EventPreedit:
		showComposing(g.EventText(), g.PreeditCursor())
	}
}
```

```zig
try g.textInput(focused, goome.rect(x + caret_x, y, 2, 20));
while (try g.poll(16)) |ev| switch (ev.kind) {
    .text => insert(g.eventText()),
    .preedit => showComposing(g.eventText(), g.preeditCursor()),
    else => {},
};
```

```lua
g:text_input(focused, {x = x + caret_x, y = y, w = 2, h = 20})
for ev in g:events(16) do
  if ev.type == goome.TEXT then insert(g:event_text()) end
  if ev.type == goome.PREEDIT then show_composing(g:event_text(), g:preedit_cursor()) end
end
```

```js
g.textInput(focused, { x: x + caretX, y, w: 2, h: 20 });
for (const ev of g.events(16)) {
  if (ev.type === goome.TEXT) insert(g.eventText());
  if (ev.type === goome.PREEDIT) showComposing(g.eventText(), g.preeditCursor());
}
```

Calling it every frame is fine but the ui kit only calls it when the caret moved or focus changed, you might want to do the same. NULL as the caret keeps the last spot. Turning it off cancels whatever was being composed.

## Per desktop

| Where | What goome uses | Notes |
|:--|:--|:--|
| X11 | XIM, from the libX11 it already loads | `XMODIFIERS` picks the IM (`@im=ibus`, `@im=fcitx`). With none it still does dead keys and compose. IBus and Fcitx both run an XIM server, so they work through this |
| GNOME | same as X11, the overlay is an XWayland window | |
| Wayland | `text-input-unstable-v3` | sway, KDE, Hyprland and GNOME have it. If the compositor doesnt, `goome_text_input` says `GOOME_ENOTSUP` |
| Windows | IMM32 (`imm32.dll`, loaded at runtime) | Microsoft Pinyin, the Japanese and Korean IMEs and anything else that does IMM. goome hides the IMEs own composition window and draws it itself |
| Mac | `NSTextInputClient` on the goome view | window mode only, overlays on Mac dont get it |
| Offscreen | nothing, you push the events | see below |

On X11 goome needs a real locale to open the IM. A C program sits in the "C" locale until it calls `setlocale`, so goome sets `LC_CTYPE` from the environment (or C.UTF-8) just while it opens the IM and puts yours back after. You dont have to call `setlocale`.

What got tested, so you know:

- X11 on Xvfb with `@im=none` (compose and dead keys) and with a private ibus-daemon
- Wayland on headless sway: text-input-v3 turns on and normal keys still type. Theres no IME in that setup, so a real composition didnt run there
- Windows under wine with wines own IME: preedit, the caret and the commit
- Mac only builds in CI, the runners cant type into a window. The NSTextInputClient part hasnt been tried with a real Japanese or Chinese IME yet

Fcitx5, the real Microsoft IMEs and the Mac IMEs havent been tried by hand. If one acts weird please open an issue.

## Engines and offscreen

Theres no OS window, so the engine reads its own IME and pushes what it gets:

```c
goome_event e = {0};
e.type = GOOME_PREEDIT;
snprintf(e.msg, sizeof(e.msg), "%s", composing);
e.id = caret_bytes;
goome_push(g, &e);
```

Push a `GOOME_TEXT` with the finished text the same way. Longer than 63 bytes goes through the same spot, `goome_push` keeps the whole string for `goome_event_text`. Turn your engines IME on while `goome_ui_wants(u)` has `GOOME_WANT_KEYBOARD`.

## Tests

The test backend takes `text <utf8>` and `preedit <utf8> <caret>` lines in the [script](testing.md), and `ime` queues a `GOOME_CONTROL` saying `ime 1 x,y wxh` so you can check the ui turned it on in the right spot:

```text
2 click 120,80
3 preedit にほ 6
4 text 日本
5 ime
end 8
```
