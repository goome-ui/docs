---
title: Getting started in C#
---

# Getting started in C#

[csharp-goome](https://github.com/goome-ui/csharp-goome) is the C library built as a shared lib and called with P/Invoke. Needs .NET 8+, and a C compiler the first time to build the native lib.

To start from a project that already builds, `goome new my-app --lang csharp` makes one from the [C# template](https://github.com/goome-ui/goome-app-template-csharp), see [Templates and goome new](templates.md) <kbd>0.4</kbd>.

## Pick what you are making

### Overlay on top of everything

```csharp
using GoomeSharp;

using var g = new Goome(new GoomeOptions { Title = "my overlay" });
while (true)
{
    while (g.Poll(out var ev, 16))
        if (ev.Type == EventType.Quit) return;
    var c = g.Begin(0);
    if (c == null) continue;
    c.DrawRoundRect(40, 40, 240, 50, 12, 0xE0202838);
    c.DrawText(56, 56, "on top of everything", false, 0xFFFFFFFF);
    g.End(c);
}
```

More on [Overlay mode](overlay-mode.md).

### Make a normal app <kbd>0.2</kbd>

```csharp
using GoomeSharp;

using var g = Goome.OpenApp("My app", 960, 640);
using var ui = new Ui(g);
int clicks = 0;
for (bool running = true; running;)
{
    while (g.Poll(out var ev, 16))
    {
        if (ev.Type == EventType.Close || ev.Type == EventType.Quit) running = false;
        ui.Feed(ev);
    }
    if (ui.Begin(0) == null) continue;
    if (ui.App("My app"))
    {
        if (ui.Button("Click me")) clicks++;
        ui.Label($"clicked {clicks} times");
    }
    ui.AppEnd();
    ui.End();
}
```

More on [Window mode](window-mode.md).

### Inside Unity or a game engine <kbd>0.2</kbd>

Whole MonoBehaviour is on [Getting started in Unity](start-unity.md). Short version, offscreen mode and then upload the frame:

```csharp
using var g = Goome.OpenOffscreen(320, 200);
var c = g.Begin(0)!;
c.DrawRoundRect(20, 20, 280, 160, 16, 0xFF6FDC5F);
g.End(c);
if (g.TryFrame(out var frame)) Goome.SavePpm("frame.ppm", frame);
```

## Get it

Not on nuget.org. Clone it and build the native lib:

```sh
git clone https://github.com/goome-ui/csharp-goome
cd csharp-goome
./build.sh                      # libgoome.so / libgoome.dylib into runtimes/<rid>/native/
./build.sh win                  # goome.dll with mingw, also works from linux
dotnet run --project examples/Hello
```

Then reference `src/GoomeSharp/GoomeSharp.csproj` from your project. The native lib gets copied next to your app by itself.

`dotnet pack src/GoomeSharp -c Release -o out` makes a .nupkg with every lib in `runtimes/`. CI builds one with linux-x64, win-x64, osx-arm64 and osx-x64 as the **nupkg** artifact, grab it from the latest run and add the folder as a local source:

```sh
dotnet nuget add source /path/to/folder/with/the/nupkg --name goome-local
dotnet add package GoomeSharp --version 0.2.0
```

For one exact version instead of the newest, see [Versions](versions.md).

## Your first overlay

```csharp
using GoomeSharp;

using var g = new Goome(new GoomeOptions { Title = "my overlay" });
var pace = new Pacer();
while (true)
{
    int wait = pace.Pace(60);
    while (g.Poll(out var ev, wait))
    {
        if (ev.Type == EventType.Quit) return;
        if (ev.Type == EventType.Down) Console.WriteLine($"clicked at {ev.X:0},{ev.Y:0}");
        wait = pace.Pace(60);
    }

    var c = g.Begin(0);
    if (c == null) continue;
    c.DrawRoundRect(100, 100, 200, 80, 12, 0xE0202838);
    c.DrawText(116, 128, "click me", true, 0xFFFFFFFF);
    g.End(c, new Rect(100, 100, 200, 80));
}
```

`new Goome()` throws a `GoomeException` if it cant get an overlay (no display, nothing supported). `Code` says why.

## How it maps to C

All of goome.h is there. `goome_draw_round_rect(c, ...)` is `c.DrawRoundRect(...)`, `goome_ui_slider(u, ...)` is `ui.Slider(...)` with a `ref` for the value, etc.

Stuff that can fail normally (hotkeys on Wayland, a grab thats not ready yet) gives you a bool or a `GoomeError` and puts the details in `g.LastError`. Anything else throws.

`Goome`, `Ui`, `Bitmap`, `Font` and `Canvas.Create` are `IDisposable`. Call everything from the thread that made the `Goome`, on Mac thats the main thread.

IDE setup: [Rider](editor-rider.md) or [Visual Studio](editor-visualstudio.md).
