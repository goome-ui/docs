---
title: Getting started in Python
---

# Getting started in Python

Python 3.8+. [python-goome](https://github.com/goome-ui/python-goome) calls the C library through ctypes, pip compiles it once on install.

To start from a project that already builds, `goome new my-app --lang python` makes one from the [Python template](https://github.com/goome-ui/goome-app-template-python), see [Templates and goome new](templates.md) <kbd>0.4</kbd>.

> On Windows and only want your window, with no black console box? Add `GOOME_WINDOW_NO_CONSOLE`, see [Hide the console on Windows](windows-console.md) <kbd>0.5.5</kbd>. It is off by default.

## Pick what you are making

`open` is the overlay, `open_app` a window, `open_offscreen` a buffer with no window.

### Overlay on top of everything

```python
import goome

with goome.open("my overlay") as g:
    running = True
    while running:
        for ev in g.events(16):
            if ev.type == goome.QUIT:
                running = False
        with g.frame(0) as c:
            if c is None:
                continue
            c.round_rect(40, 40, 240, 50, 12, 0xE0202838)
            c.text(56, 56, "on top of everything", 0xFFFFFFFF)
```

More on [Overlay mode](overlay-mode.md).

### Make a normal app <kbd>0.2</kbd>

```python
import goome

with goome.open_app("My app", 960, 640) as g, g.ui() as ui:
    clicks, running = 0, True
    while running:
        for ev in g.events(16):
            if ev.type in (goome.CLOSE, goome.QUIT):
                running = False
            ui.feed(ev)
        with ui.frame(0) as c:
            if c is None:
                continue
            with ui.app("My app") as shown:
                if shown:
                    if ui.button("Click me"):
                        clicks += 1
                    ui.label("clicked %d times" % clicks)
```

More on [Window mode](window-mode.md).

### Inside a game engine <kbd>0.2</kbd>

```python
import goome

with goome.open_offscreen(320, 200) as g:
    with g.frame(0) as c:
        c.round_rect(20, 20, 280, 160, 16, 0xFF6FDC5F)
    g.last_frame().save_ppm("frame.ppm")
```

More on [Offscreen mode](offscreen-mode.md).

## Install

```sh
pip install goome
```

Its on [PyPI](https://pypi.org/project/goome/). The wheels for Linux x64, Windows x64 and both Macs already have the lib inside, so nothing gets built. Anywhere else pip builds it from the sdist, which needs a C compiler:

- Debian / Ubuntu: `sudo apt install build-essential`
- Mac: `xcode-select --install`
- Windows: [mingw-w64](https://www.mingw-w64.org/) gcc, or Visual Studio (run pip from the developer prompt)

`CC` picks a different compiler. `GOOME_LIB=/path/to/libgoome.so` uses your own libgoome. The newest code on dev comes straight from git:

```sh
pip install git+https://github.com/goome-ui/python-goome@dev
```

For one exact version instead of the newest, see [Versions](versions.md).

## Your first overlay

```python
import goome

with goome.open("my overlay") as g:
    pace = goome.Pacer(60)
    running = True
    while running:
        for ev in g.events(pace.wait()):
            if ev.type == goome.QUIT:
                running = False
            if ev.type == goome.DOWN:
                print("clicked at %.0f,%.0f" % (ev.x, ev.y))
        with g.frame(0) as c:
            if c is None:
                continue
            c.round_rect(100, 100, 200, 80, 12, 0xE0202838)
            c.text(116, 128, "click me", 0xFFFFFFFF, big=True)
            c.hit(100, 100, 200, 80)
```

Colors are `0xAARRGGBB` ints, positions are logical desktop coords, same as C.

## How it maps to C

Canvas methods are the C draw functions minus `goome_draw_`, so `goome_draw_circle(c, ...)` is `c.circle(...)`. Widgets return the new value, no pointers:

```python
volume = ui.slider("Volume", volume, 0, 1, "%.2f")
```

`ui.changed` is whether the last widget changed this frame (what the C functions return as an int). Errors raise `goome.GoomeError` or a subclass like `goome.Again`, C error code on `.code`.
