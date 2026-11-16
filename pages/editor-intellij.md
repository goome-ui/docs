---
title: IntelliJ IDEA
---

# IntelliJ IDEA <kbd>0.3</kbd>

Community edition is enough.

Theres a goome plugin for the JetBrains IDEs with a tool window <kbd>0.5</kbd>, live templates and a `.goome.json` preview. Get it from the [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/36174-goome) or from disk, the [Rider page](editor-rider.md#the-goome-plugin) has both ways and everything it does.

## New project

1. File > New > Project, pick Java, build system Gradle, DSL Groovy. For the JDK take 22 or newer, the dropdown can download one.
2. Swap `build.gradle` for the one on [Getting started in Java](start-java.md#gradle), it pulls goome from Maven Central, and hit the Load Gradle Changes button that pops up (or the refresh in the Gradle tool window).
3. Paste the overlay from [Getting started in Java](start-java.md#your-first-overlay) into `src/main/java/Main.java`.

## Running it

The green arrow next to `main` runs it. That run config doesnt read `applicationDefaultJvmArgs`, so add the flag yourself: Run > Edit Configurations, Modify options > Add VM options, and put in

```text
--enable-native-access=ALL-UNNAMED
```

Or run the Gradle `run` task from the Gradle tool window (Tasks > application > run), that one does use `build.gradle`.

To try it without touching your screen put `GOOME_BACKEND=test;GOOME_TEST_SHOTS=shots/` in the run config's Environment variables and every frame lands in `shots/` ([Testing without a screen](testing.md)).

## Debugging

The bug icon next to the arrow. Breakpoints work fine in your own code, including inside the `g.frame(0, c -> ...)` lambda. You cant step into goome itself, its C behind FFM. For that build a debug lib in c-goome, point `-Dgoome.lib` at it and attach gdb or lldb to the java process, or debug the same thing in C with [CLion](editor-clion.md).

Pausing on a breakpoint stops your loop, so an overlay just stays frozen on its last frame until you continue. Thats normal.

## Where the native lib comes from

The jar has `libgoome` for every OS inside. On the first run it gets unpacked into `~/.cache/goome/java/<hash>/` (`%LOCALAPPDATA%\goome\java` on Windows, `~/Library/Caches/goome/java` on Mac) and loaded from there. A different lib gets a different hash, so you never get a stale one.

| VM option | Does |
|:--|:--|
| `-Dgoome.lib=/path/to/libgoome.so` | loads that lib instead, for your own build of c-goome |
| `-Dgoome.cache=folder` | unpacks somewhere else, when your home folder isnt writable |
| `-Dgoome.native=lwjgl` | forces the LWJGL path, `ffm` forces FFM |

## Gotchas

- `cant call into goome ... goome needs Java 22+` means the project JDK is 17 or 21 and LWJGL isnt on the classpath. Add the two LWJGL lines from [Getting started in Java](start-java.md#gradle) or switch the JDK in File > Project Structure.
- The "restricted method" warning in the console is the missing `--enable-native-access=ALL-UNNAMED`. It still runs.
- Check the Gradle JVM too (Settings > Build, Execution, Deployment > Build Tools > Gradle). It can be a different JDK than the project one.
- On a Mac the Screen Recording and Accessibility prompts are for IntelliJ, not your program ([why](platforms.md#macos-permissions)).
- `GOOME_BACKEND=x11` in the environment variables gets you real global hotkeys on a Wayland desktop with XWayland.
