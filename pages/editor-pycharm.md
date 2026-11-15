---
title: PyCharm
---

# PyCharm

## New project

1. File > New Project, default virtualenv, Python 3.8 or newer.
2. In the Terminal tab (venv is already active):

```sh
pip install git+https://github.com/goome-ui/python-goome
```

3. Paste the overlay from [Getting started in Python](start-python.md) into `main.py`, right click, Run 'main'.

pip builds the C library on install so you need a C compiler once, [Getting started in Python](start-python.md) says which one.

The Python Interpreter settings dialog only searches PyPI, so use the terminal for the git URL.

## Debugging

The PyCharm debugger works fine in your own code. goome is a C library behind ctypes though, you cant step into it from here. Use [CLion](editor-clion.md) or gdb for that.

Test backend: add `GOOME_BACKEND=test;GOOME_TEST_SHOTS=shots/` to the run config's environment variables and every frame lands in `shots/` ([Testing without a screen](testing.md)).

## Gotchas

- On Windows the wheel has `goome.dll` inside the package. `GOOME_LIB=C:\path\goome.dll` uses your own build instead.
- `GOOME_BACKEND=x11` in the run config gets you real global hotkeys on a Wayland desktop with XWayland.
