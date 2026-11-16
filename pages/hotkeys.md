---
title: Hotkeys and the control fifo
---

# Hotkeys and the control fifo

> On Wayland global hotkeys dont exist, go to [the control fifo](#the-control-fifo).

## Global hotkeys

```c
if (goome_hotkey(g, "alt+h", 1) != GOOME_OK)
    printf("no global hotkeys here: %s\n", goome_error(g));
```

```csharp
if (!g.Hotkey("alt+h", 1)) Console.WriteLine($"no global hotkeys here: {g.LastError}");
```

```python
try:
    g.hotkey("alt+h", 1)
except goome.GoomeError:
    print("no global hotkeys here: %s" % g.error)
```

```java
try {
    g.hotkey("alt+h", 1);
} catch (GoomeException e) {
    System.out.println("no global hotkeys here: " + g.error());
}
```

```rust
if g.hotkey("alt+h", 1).is_err() {
    println!("no global hotkeys here: {}", g.error());
}
```

```js
try {
  g.hotkey("alt+h", 1);
} catch (e) {
  console.log(`no global hotkeys here: ${g.error}`);
}
```

```go
if err := g.Hotkey("alt+h", 1); err != nil {
	fmt.Println("no global hotkeys here:", g.LastError())
}
```

```zig
g.hotkey("alt+h", 1) catch {
    std.debug.print("no global hotkeys here: {s}\n", .{g.lastError()});
};
```

```lua
local ok, err = g:hotkey("alt+h", 1)
if not ok then print("no global hotkeys here: " .. err) end
```

Works system wide, also when another app has focus. You get a `GOOME_HOTKEY` event with your `id`. Combos look like `alt+h`, `ctrl+shift+f5`, `super+space`. `goome_parse_combo` checks one without grabbing.

| Where | Hotkeys |
|:--|:--|
| X11 | yes |
| Windows | yes |
| macOS | yes, with Accessibility on. goome cant tell if you have it, so it says OK either way |
| Wayland | no, use the control fifo |

`GOOME_CAP_HOTKEYS` to know for sure.

## The control fifo

Wayland doesnt let apps grab keys system wide and XWayland grabs only see X windows. So bind the key in your compositor and have it tell your app.

With a `state_dir` goome makes a fifo at `state_dir/control`. Each line written to it comes out of `goome_poll` as `GOOME_CONTROL` with the line in `msg`. In Java the state dir is `new Options().stateDir(dir)`, and `Goome.send(dir, "hide")` is the sending side.

```c
#include <stdio.h>
#include <string.h>
#include "goome.h"

int main(int argc, char **argv)
{
    const char *dir = "/home/me/.local/state/myapp";
    if (argc > 2 && !strcmp(argv[1], "--send")) return goome_send(dir, argv[2]) == GOOME_OK ? 0 : 1;

    goome *g = goome_open(&(goome_opts){.title = "myapp", .state_dir = dir}, NULL);
    if (!g) return 1;
    printf("bind a key to: myapp --send hide (fifo at %s)\n", goome_control_path(g));
    int hidden = 0;
    for (;;) {
        goome_event ev;
        while (goome_poll(g, &ev, 16) > 0) {
            if (ev.type == GOOME_QUIT) return 0;
            if (ev.type == GOOME_CONTROL && !strcmp(ev.msg, "hide")) hidden = !hidden;
        }
        goome_canvas *c = goome_begin(g, 0);
        if (!c) continue;
        if (!hidden) goome_draw_text(c, 40, 40, "alt+h hides me", 1, 0xFFFFFFFF);
        goome_end(g, c, NULL, 0);
    }
}
```

sway:

```text
bindsym alt+h exec myapp --send hide
```

Hyprland is `bind = ALT, H, exec, myapp --send hide`.

Works on X11 too. Anything that can write a line to a file can talk to your overlay, so its handy for scripts.
