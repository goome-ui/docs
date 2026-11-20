---
title: FAQ
---

# FAQ

### Why are my clicks going through my overlay?

No hit rects passed to `goome_end`, or the click missed them. In overlay mode only [hit rects](hit-rects.md) take clicks. UI kit windows are sent as hits for you.

### Why don't I get any key events?

Its off until `goome_keyboard(g, 1)`, otherwise the overlay would eat everything you type in other apps. UI kit text inputs flip it for you. Window mode doesnt have this problem.

### My hotkey doesnt work on Linux

Probably Wayland, it doesnt let apps grab keys system wide. Use the [control fifo](hotkeys.md) and bind the key in your compositor.

### How do I hide the console window on Windows?

Add `GOOME_WINDOW_NO_CONSOLE` <kbd>0.5.5</kbd> to your window flags, or link your exe as a GUI app instead. Its off by default. Both ways, per language, are on [Hide the console on Windows](windows-console.md).

### Can I use it from C++?

Yes, the header has `extern "C"`. Only the file with `GOOME_IMPLEMENTATION` has to be a `.c`.

### Can I use it from Java or Kotlin?

Java yes, see [Getting started in Java](start-java.md). Java 22+ needs no extra jars, 17 and 21 need LWJGL (CI runs Java 17 and 25 only). Its a normal jar, so Kotlin on the JVM can call it too.

### Do I have to draw every frame?

No, only when something changed or `goome_ui_animating` says something still moves. Idle it skips the frame, the benchmark in [Compare](compare.md) puts an unchanged 50 row frame at about 0.002 ms.

### Can I use goome from more than one thread?

No. Each `goome` stays on the thread that opened it, and on Mac thats the main thread (AppKit). Do other work on other threads and pass results back through your own queue. Same in Java, the `Goome` and its `Ui` stay on one thread.

### Does it work in fullscreen games?

Borderless and windowed fullscreen should work, though no CI run has put an overlay over a real fullscreen game. Exclusive fullscreen no, nothing can draw over that without hooking the game.

### Why do grabs ask for permission on KDE but not on GNOME?

On GNOME goome asks mutter directly. KDE and others go through the screen share portal, which asks. Set `state_dir` and it only asks once. [Screen capture](capture.md)

### My overlay shows up in my own screenshots

Always on Linux, check `img.has_self` and mask it with `goome_alpha_at`. Windows can leave it out with `hide_self` (CI tests that), Mac is meant to as well but CI runners cant record the screen so it never ran there.

### Can I replace WinForms with it?

Yes, thats [window mode](window-mode.md) (0.2). `goome_open_app` and the UI kit's [app mode](ui-app.md) get you a normal window with menus, dialogs and tables.

### What does GPL mean for me?

Ship something made with goome and you share your source too, under GPL-3.0. Keep the credits.

### What does this error mean?

Paste it into the search box, or look it up on [Error messages](errors.md). Every message goome can give you is on there with what to do about it.

### Something is broken on my desktop

Open an issue on [c-goome](https://github.com/goome-ui/c-goome/issues) with your OS, desktop + version, and what `goome_backend_name` and `goome_caps` say. Those are the bugs I want most.
