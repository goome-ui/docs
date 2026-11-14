---
title: Events
---

# Events

`goome_poll(g, &ev, timeout_ms)` returns 1 with an event, 0 if nothing came before the timeout, or a negative error. Timeout 0 never waits. Loop until it returns 0, then draw.

```c
goome_event ev;
while (goome_poll(g, &ev, wait) > 0) {
    switch (ev.type) {
    case GOOME_QUIT: running = 0; break;
    case GOOME_DOWN: printf("button %d at %.0f,%.0f\n", ev.button, ev.x, ev.y); break;
    case GOOME_KEY: if (ev.key == GOOME_K_ESC) running = 0; break;
    }
}
```

```csharp
while (g.Poll(out var ev, wait))
{
    if (ev.Type == EventType.Quit) running = false;
    if (ev.Type == EventType.Down) Console.WriteLine($"button {ev.Button} at {ev.X:0},{ev.Y:0}");
    if (ev.Type == EventType.Key && ev.Key == Keys.Esc) running = false;
}
```

```python
for ev in g.events(wait):
    if ev.type == goome.QUIT:
        running = False
    if ev.type == goome.DOWN:
        print("button %d at %.0f,%.0f" % (ev.button, ev.x, ev.y))
    if ev.type == goome.KEY and ev.key == goome.K_ESC:
        running = False
```

```java
for (Event ev : g.events(wait)) {
    if (ev.type() == Goome.QUIT) running = false;
    if (ev.type() == Goome.DOWN) System.out.printf("button %d at %.0f,%.0f%n", ev.button(), ev.x(), ev.y());
    if (ev.type() == Goome.KEY && ev.key() == Goome.K_ESC) running = false;
}
```

## The types

| Type | Fields that matter | When |
|:--|:--|:--|
| `GOOME_DOWN`, `GOOME_UP` | `x`, `y`, `mon`, `button` (1 left, 2 middle, 3 right), `mods` | a press or release over a hit rect |
| `GOOME_MOTION` | `x`, `y`, `mon` | the pointer moved over a hit, or while a press is held |
| `GOOME_SCROLL` | `x`, `y`, `dy` | wheel notches, +1 is down |
| `GOOME_KEY` | `key`, `mods`, `text` | a key, only while the keyboard is on |
| `GOOME_HOTKEY` | `id` | a combo you grabbed with `goome_hotkey` |
| `GOOME_CONTROL` | `msg` | a line from the [control fifo](hotkeys.md) |
| `GOOME_MONITORS` | | the monitor list changed, ask `goome_monitors` again |
| `GOOME_QUIT` | | time to go (session ending, or the test script hit its end) |
| `GOOME_CLOSE` <kbd>0.2</kbd> | | the window's close button, alt+f4 or cmd+w |
| `GOOME_FOCUS` <kbd>0.2</kbd> | `id` | the window got (1) or lost (0) focus |
| `GOOME_DROP` <kbd>0.2</kbd> | `x`, `y`, `msg` | a file got dropped on the window, full path from `goome_drop_path` |

## Keys

`key` is lowercase ascii for normal keys (`'a'`, `'1'`, `' '`) or a `GOOME_K_*` constant: `GOOME_K_ENTER`, `GOOME_K_ESC`, `GOOME_K_TAB`, `GOOME_K_BACKSPACE`, `GOOME_K_DELETE`, the arrows, `GOOME_K_HOME`, `GOOME_K_END`, `GOOME_K_PGUP`, `GOOME_K_PGDN`, `GOOME_K_INSERT` and `GOOME_K_F1` up to `GOOME_K_F12`.

`mods` is any of `GOOME_SHIFT`, `GOOME_CTRL`, `GOOME_ALT`, `GOOME_SUPER`. `text` is the utf-8 the key typed on the current layout, empty for stuff like arrows. Typing uses `text`, shortcuts use `key`.

In Java the types and keys are on `Goome` (`Goome.DOWN`, `Goome.K_ESC`, `Goome.CTRL`) and the fields are methods, `ev.x()`, `ev.key()`.

Overlay mode only sends keys while you hold the keyboard ([heres why](overlay-mode.md#things-to-know)). A window gets them whenever its focused.

## Pushing your own <kbd>0.2</kbd>

`goome_push(g, &ev)` queues an event for the next `goome_poll`. Java has `g.push(Event.down(x, y, 1))`, plus `g.pushClick` and `g.pushText` for the usual stuff. In [offscreen mode](offscreen-mode.md) thats the only way input gets in. Otherwise its for automation or custom events from elsewhere in your code.
