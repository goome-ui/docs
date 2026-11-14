---
title: Plain terminal
---

# Plain terminal

## C

Get `goome.h` (see [Getting started in C](start-c.md)) and a `goome.c` with the two implementation lines.

```sh
gcc -O2 -o myapp myapp.c goome.c          # linux, mac, mingw on windows
clang -O2 -o myapp myapp.c goome.c        # same thing with clang
cl /O2 myapp.c goome.c                    # visual studio, from the developer prompt
```

No `-ldl` or anything on Linux, goome loads the desktop libs at runtime. Debug is `-g -O0` and `gdb ./myapp` / `lldb ./myapp` like always.

`goome.c` is slow to compile, build it once:

```sh
gcc -O2 -c goome.c
gcc -O2 -o myapp main.c other.c goome.o
```

## Working on goome itself

See [One file and building](building.md#building-goome-itself).

## C#, Python and Java

```sh
cd csharp-goome && ./build.sh && dotnet run --project examples/Hello
pip install git+https://github.com/goome-ui/python-goome
python examples/hello.py                  # from a clone of python-goome, or your own script
```

Java 22+ runs one file straight from source. With more files, `javac` first:

```sh
java --enable-native-access=ALL-UNNAMED -cp goome-0.2.0.jar Main.java
javac -cp goome-0.2.0.jar -d out *.java
java --enable-native-access=ALL-UNNAMED -cp goome-0.2.0.jar:out Main      # ; instead of : on windows
```

Debugging Java from the terminal is `jdb`, or start it with `-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=5005` and attach an IDE. See [Getting started in Java](start-java.md) for the jar.

## Gotchas

- `GOOME_BACKEND=x11 ./myapp` forces a backend (wayland, gnome, portal, x11, test), otherwise it picks Wayland or X11 itself. Wayland has no global hotkeys, use the [control fifo](hotkeys.md).
- Over ssh or in CI theres no screen, use `GOOME_BACKEND=test` ([test backend](testing.md)).
- On a Mac the terminal app is what needs Screen Recording and Accessibility, see [macOS permissions](platforms.md#macos-permissions).
- `cl` only exists in the developer prompt, not a normal cmd or PowerShell.
