---
title: Hide the console on Windows
---

# Hide the console on Windows <kbd>0.5.5</kbd>

> **I only want my window, no black console box.** Add `GOOME_WINDOW_NO_CONSOLE` to your window flags. On Windows the console goes away and all you see is your goome window and its icon in the taskbar. **It is off by default**, so you have to turn it on yourself. Linux and macOS dont have this, the flag does nothing there.

<br>

The flag is in goome 0.5.5, in C, C#, Python, Java, Rust, Node, Go, Zig and Lua. Older versions dont know it.

```c
goome_opts o = {
    .title = "my app",
    .mode = GOOME_MODE_WINDOW,
    .width = 960, .height = 640,
    .window_flags = GOOME_WINDOW_RESIZABLE | GOOME_WINDOW_CENTER | GOOME_WINDOW_NO_CONSOLE,
};
goome *g = goome_open(&o, NULL);
```

```csharp
using var g = new Goome(new GoomeOptions
{
    Title = "my app",
    Mode = Mode.Window,
    Width = 960, Height = 640,
    WindowStyle = WindowStyle.Resizable | WindowStyle.Center | WindowStyle.NoConsole,
});
```

```python
g = goome.open_app("my app", 960, 640,
    window_flags=goome.WINDOW_RESIZABLE | goome.WINDOW_CENTER | goome.WINDOW_NO_CONSOLE)
```

```java
Options o = new Options().windowFlags(Goome.WINDOW_RESIZABLE | Goome.WINDOW_CENTER | Goome.WINDOW_NO_CONSOLE);
new App("my app", 960, 640).options(o).onFrame(ui -> {
    ...
}).run();
```

```rust
let mut g = Options::new()
    .title("my app")
    .mode(goome::MODE_WINDOW)
    .size(960, 640)
    .window_flags(goome::WINDOW_RESIZABLE | goome::WINDOW_CENTER | goome::WINDOW_NO_CONSOLE)
    .open()?;
```

```js
const g = goome.openApp("my app", 960, 640, {
  windowFlags: goome.WINDOW_RESIZABLE + goome.WINDOW_CENTER + goome.WINDOW_NO_CONSOLE,
});
```

```go
g, err := goome.Open(goome.Options{
	Title: "my app", Mode: goome.ModeWindow, Width: 960, Height: 640,
	WindowFlags: goome.WindowResizable | goome.WindowCenter | goome.WindowNoConsole,
})
```

```zig
const g = try goome.Goome.open(.{
    .title = "my app",
    .mode = .window,
    .width = 960,
    .height = 640,
    .window_flags = goome.window_flags.resizable | goome.window_flags.center | goome.window_flags.no_console,
});
```

```lua
local g = goome.open{
  title = "my app", mode = "window", width = 960, height = 640,
  window_flags = goome.WINDOW_RESIZABLE | goome.WINDOW_CENTER | goome.WINDOW_NO_CONSOLE,
}
```

Thats the whole thing. The rest of this page is what it does exactly, and the other way to get there.

## What the flag does

When your program is a console exe (what you get from a plain `gcc main.c`, `dotnet new console`, `cargo new`, `go build`, `python app.py`...), Windows gives it a console window. Double click it and you get the black box next to your window, and the taskbar shows two things.

With `GOOME_WINDOW_NO_CONSOLE` goome closes that console for you right after it opens. You only see your window.

It only does that when your process **owns** the console, meaning you double clicked the exe or started it without a terminal. If you ran it from cmd, PowerShell or Windows Terminal, the terminal belongs to the shell and goome leaves it alone, so `printf` and your logs keep showing up where you expect while you develop. Nothing to switch off for debugging.

| How you start it | Console with the flag |
|:--|:--|
| double click, or a shortcut | gone |
| cmd, PowerShell, Windows Terminal | stays, goome doesnt touch it |
| Linux, macOS | nothing to hide, no-op |
| [in the browser](browser.md) | accepted and ignored |

If you want the console gone only in releases, set the flag in your release build and leave it out of the debug one.

## Or link it as a GUI app

The other way is to tell Windows at build time that your exe is a window app and never gets a console. This is not a goome thing, every language has its own switch:

| Language | How |
|:--|:--|
| C, gcc / MinGW | `-mwindows` |
| C, MSVC | `/SUBSYSTEM:WINDOWS /ENTRY:mainCRTStartup` (keeps your normal `main`) |
| C# | `<OutputType>WinExe</OutputType>` in the .csproj |
| Rust | `#![windows_subsystem = "windows"]` at the top of main.rs |
| Go | `go build -ldflags "-H=windowsgui"` |
| Zig | `exe.subsystem = .Windows;` in build.zig |
| Python | run it with `pythonw app.py`, or name the file `app.pyw` |
| Java | start it with `javaw -jar app.jar` instead of `java` |
| Node | no switch, `node.exe` is a console app. Use the flag, or a launcher that starts it hidden |
| Lua | use `wlua.exe` if your Lua comes with one, otherwise the flag |

With a GUI subsystem exe there is no console to read output from either, so `printf` goes nowhere. Log to a file while you test.

## Flag or subsystem

- **The flag** is the quick one. One line, works in every language, and your normal console build keeps working from a terminal. The catch is that a double clicked exe still has a console for a split second before goome closes it, so you can see a tiny flash.
- **The subsystem** has no flash at all, because the console never exists. Prefer it when you ship an exe and you care about that first moment. It needs a build setting, and Node and Lua cant do it.

Doing both is fine too. With a GUI subsystem exe there is no console to hide, so the flag just has nothing to do.

More on window flags in [Window mode](window-mode.md), and the full list in [Types and constants](api-types.md).
