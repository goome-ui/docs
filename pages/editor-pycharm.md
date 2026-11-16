---
title: PyCharm
---

# PyCharm

Theres a goome plugin for the JetBrains IDEs with a tool window <kbd>0.5</kbd>, live templates and a `.goome.json` preview. Get it from the [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/36174-goome) or from disk, the [Rider page](editor-rider.md#the-goome-plugin) has both ways and everything it does.

## New project

1. File > New Project, default virtualenv, Python 3.8 or newer.
2. In the Terminal tab (venv is already active):

```sh
pip install goome
```

3. Paste the overlay from [Getting started in Python](start-python.md) into `main.py`, right click, Run 'main'.

Or Settings > Python Interpreter > + and search goome. The wheels have the C library inside, on other platforms pip builds it and you need a C compiler once, [Getting started in Python](start-python.md) says which one.

## Debugging

The PyCharm debugger works fine in your own code. goome is a C library behind ctypes though, you cant step into it from here. Use [CLion](editor-clion.md) or gdb for that.

Test backend: add `GOOME_BACKEND=test;GOOME_TEST_SHOTS=shots/` to the run config's environment variables and every frame lands in `shots/` ([Testing without a screen](testing.md)).

## Gotchas

- On Windows the wheel has `goome.dll` inside the package. `GOOME_LIB=C:\path\goome.dll` uses your own build instead.
- `GOOME_BACKEND=x11` in the run config gets you real global hotkeys on a Wayland desktop with XWayland.
