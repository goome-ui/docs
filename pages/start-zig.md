---
title: Getting started in Zig
---

# Getting started in Zig <kbd>0.5</kbd>

Zig 0.15.2. [zig-goome](https://github.com/goome-ui/zig-goome) is a Zig package, the module brings goomes C with it and links libc. Nothing else gets linked on any OS.

Theres no template or `goome new` for Zig yet.

## Pick what you are making

`goome.Goome.open` is the overlay, `openApp` a window, `openOffscreen` a buffer with no window.

### Overlay on top of everything

```zig
const goome = @import("goome");

pub fn main() !void {
    const g = try goome.Goome.open(.{ .title = "my overlay" });
    defer g.deinit();
    while (true) {
        while (try g.poll(16)) |ev| {
            if (ev.kind == .quit) return;
        }
        const c = g.begin(0) orelse continue;
        c.roundRect(40, 40, 240, 50, 12, 0xE0202838);
        _ = c.text(56, 56, "on top of everything", false, 0xFFFFFFFF);
        try g.end(c, &.{});
    }
}
```

More on [Overlay mode](overlay-mode.md).

### Make a normal app

```zig
const g = try goome.Goome.openApp("My app", 960, 640);
defer g.deinit();
const ui = try g.ui();
defer ui.deinit();
var clicks: i32 = 0;
while (true) {
    while (try g.poll(16)) |ev| {
        if (ev.kind == .quit or ev.kind == .close) return;
        _ = ui.feed(ev);
    }
    _ = ui.begin(0) orelse continue;
    if (ui.app("My app", 0)) {
        if (ui.button("Click me")) clicks += 1;
        ui.labelFmt("clicked {d} times", .{clicks});
    }
    ui.appEnd();
    ui.end();
}
```

More on [Window mode](window-mode.md).

### Inside a game engine

```zig
const g = try goome.Goome.openOffscreen(320, 200, 1);
defer g.deinit();
const c = g.begin(0) orelse return;
c.roundRect(20, 20, 280, 160, 16, 0xFF6FDC5F);
try g.end(c, &.{});
const frame = try g.frame();
uploadTexture(frame.pixels(), frame.width(), frame.height());
```

More on [Offscreen mode](offscreen-mode.md).

## Install

In your project:

```sh
zig fetch --save git+https://github.com/goome-ui/zig-goome#dev
```

Then in `build.zig`:

```zig
const goome = b.dependency("goome", .{ .target = target, .optimize = optimize });
exe.root_module.addImport("goome", goome.module("goome"));
```

build.zig compiles goome.h with zigs own C compiler, so theres nothing else to install, not even on Windows. If you only want the C side, `goome.artifact("goome")` is a static lib with goome.h next to it. For a release tag instead of dev see [Versions](versions.md).

## Your first overlay

```zig
const std = @import("std");
const goome = @import("goome");

pub fn main() !void {
    const g = try goome.Goome.open(.{ .title = "my overlay" });
    defer g.deinit();
    var pace: goome.Pacer = .{};
    while (true) {
        while (try g.poll(pace.wait(60))) |ev| {
            switch (ev.kind) {
                .quit => return,
                .down => std.debug.print("clicked at {d:.0},{d:.0}\n", .{ ev.x, ev.y }),
                else => {},
            }
        }
        const c = g.begin(0) orelse continue;
        c.roundRect(100, 100, 200, 80, 12, 0xE0202838);
        _ = c.text(116, 128, "click me", true, 0xFFFFFFFF);
        try g.end(c, &.{goome.rect(100, 100, 200, 80)});
    }
}
```

The hits go straight into `g.end`. Colors are `0xAARRGGBB` u32s, positions are logical desktop coords, same as C. Every goome error is a Zig error (`error.NotSupported`, `error.Again`...), so `try` works.

## How it maps to C

Names are the C ones without `goome_`, in camelCase, on the type they work on. Widgets take a pointer and return true when they changed it:

```zig
_ = ui.slider("Volume", &volume, 0, 1, "%.2f");
```

Checkboxes and toggles take `*bool`, radios, combos and tabs `*i32`, text boxes a `[]u8` buffer (`goome.text(&buf)` reads it, `goome.setText(&buf, "x")` writes it). Begin and end pairs are the same as C, `window` / `windowEnd` and so on. The short constants are `goome.key.esc`, `goome.win.move` and friends, everything else is `goome.c.GOOME_*`.

## Editors

**VS Code**: the Zig Language extension (`ziglang.vscode-zig`), it can download zig and ZLS for you. Make sure it picks 0.15.2. CodeLLDB (`vadimcn.vscode-lldb`) debugs the exe from `zig-out/bin`. The [goome extension](editor-vscode.md) side panel and `.goome.json` preview work here too, its snippets are only C, C#, Python and Java for now.

**CLion**: theres a ZigBrains plugin. CLion debugs the zig exe like a C one, and the [goome plugin](editor-clion.md) works there for the C side.

`zig build run-ui_demo` in a clone shows every widget. `zig build test` runs everything on the test backend, see [Testing without a screen](testing.md).
