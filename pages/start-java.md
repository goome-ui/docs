---
title: Getting started in Java
---

# Getting started in Java <kbd>0.3</kbd>

Needs Java 17+. [java-goome](https://github.com/goome-ui/java-goome) calls the C library directly, no JNI to build. On 22+ it uses FFM from the JDK. On 17 and 21 it goes through LWJGL, so put `org.lwjgl:lwjgl` 3.3+ on the classpath. CI tests on Java 17 (LWJGL) and 25 (FFM and LWJGL 3.3), and with LWJGL 3.4.3 like Minecraft ships, so 21 and 22 to 24 are untested.

To start from a project that already builds, `goome new my-app --lang java` makes one from the [Java template](https://github.com/goome-ui/goome-app-template-java), see [Templates and goome new](templates.md) <kbd>0.4</kbd>.

## Pick what you are making

### Overlay on top of everything

```java
try (Goome g = Goome.open("my overlay")) {
    boolean running = true;
    while (running) {
        for (Event e : g.events(16)) if (e.type() == Goome.QUIT) running = false;
        g.frame(0, c -> {
            c.roundRect(40, 40, 240, 50, 12, 0xE0202838);
            c.text(56, 56, "on top of everything", 0xFFFFFFFF);
        });
    }
}
```

[Overlay mode](overlay-mode.md) has more.

### Make a normal app <kbd>0.3</kbd>

`App` is the ready made loop, your code goes in `onFrame` and it quits on the close button.

```java
static int clicks = 0;

public static void main(String[] args) {
    new App("My app", 960, 640).onFrame(ui -> {
        if (ui.button("Click me")) clicks++;
        ui.label("clicked %d times", clicks);
    }).run();
}
```


### Inside a game engine <kbd>0.3</kbd>

```java
try (Goome g = Goome.openOffscreen(320, 200, 1)) {
    g.frame(0, c -> c.roundRect(20, 20, 280, 160, 16, 0xFF6FDC5F));
    g.lastFrame().savePpm("frame.ppm");
}
```

Call `tick` once a frame and upload `tex` when it changed:

```java
import io.github.goomeui.*;
import java.nio.ByteBuffer;

public class Panel implements AutoCloseable {
    final Goome g = Goome.openOffscreen(480, 320, 1);
    final Ui ui = g.ui();
    final Window win = new Window(20, 20, 300, 0);
    final ByteBuffer tex = ByteBuffer.allocateDirect(480 * 320 * 4);
    double volume = 0.5;

    public boolean tick(double mouseX, double mouseY, boolean pressed, boolean released) {
        g.push(Event.motion(mouseX, mouseY));
        if (pressed) g.push(Event.down(mouseX, mouseY, 1));
        if (released) g.push(Event.up(mouseX, mouseY, 1));
        for (Event e : g.events(0)) ui.feed(e);
        if (ui.begin(0) == null) return false;
        if (ui.window("Settings", win, Ui.WIN_MOVE)) volume = ui.slider("Volume", volume, 0, 1);
        ui.windowEnd();
        ui.end();
        Rect dirty = g.frameDirty();
        if (dirty != null) g.frameCopy(tex, 480 * 4, PixelFormat.RGBA_PREMUL, dirty);
        return ui.wantsMouse();
    }

    @Override
    public void close() {
        ui.close();
        g.close();
    }
}
```

`tick` gives back `wantsMouse`, when its true dont let the game see the mouse that frame. For Minecraft theres a ready made mod, see [Minecraft](mods-minecraft.md).

## Install

Its on [Maven Central](https://central.sonatype.com/artifact/io.github.goome-ui/goome) as `io.github.goome-ui:goome`, and the jar has the native lib for every OS inside, both Macs too.

For one exact version instead of the newest, see [Versions](versions.md).

### Gradle

```groovy
plugins {
    id 'application'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'io.github.goome-ui:goome:0.5.3'
}

application {
    mainClass = 'Main'
    applicationDefaultJvmArgs = ['--enable-native-access=ALL-UNNAMED']
}
```

`./gradlew run` and thats it. On Java 17 or 21 add LWJGL to `dependencies`, with the natives for your OS (`natives-windows`, `natives-macos-arm64`, `natives-macos` for Intel Macs):

```groovy
    implementation 'org.lwjgl:lwjgl:3.3.3'
    runtimeOnly 'org.lwjgl:lwjgl:3.3.3:natives-linux'
```

### Maven

```xml
<dependency>
    <groupId>io.github.goome-ui</groupId>
    <artifactId>goome</artifactId>
    <version>0.5.3</version>
</dependency>
```

For Java 17 or 21 add `org.lwjgl:lwjgl` the same way, plus a second one with `<classifier>natives-linux</classifier>` (or your OS).

### No build tool

Grab `goome-0.5.3.jar` from the [releases page](https://github.com/goome-ui/java-goome/releases) or Maven Central. Java 22+ runs a single source file straight away:

```sh
java --enable-native-access=ALL-UNNAMED -cp goome-0.5.3.jar Main.java
```

### From source

Needs a C compiler and a JDK 25:

```sh
git clone https://github.com/goome-ui/java-goome
cd java-goome
./build.sh test
./gradlew :goome:jar     # goome/build/libs/goome-<version>.jar
```

## Your first overlay

```java
import io.github.goomeui.*;

public class Main {
    public static void main(String[] args) {
        try (Goome g = Goome.open("my overlay"); Pacer pace = new Pacer(60)) {
            boolean running = true;
            while (running) {
                for (Event e : g.events(pace.next())) {
                    if (e.type() == Goome.QUIT) running = false;
                    if (e.type() == Goome.DOWN) System.out.printf("clicked at %.0f,%.0f%n", e.x(), e.y());
                }
                g.frame(0, c -> {
                    c.roundRect(100, 100, 200, 80, 12, 0xE0202838);
                    c.text(116, 128, "click me", 0xFFFFFFFF, true);
                    c.hit(100, 100, 200, 80);
                });
            }
        }
    }
}
```

Colors are `0xAARRGGBB` ints, positions are logical desktop coords, same as C.

## FFM or LWJGL

The api is the same both ways. java-goome picks FFM when it can. `-Dgoome.native=ffm` or `-Dgoome.native=lwjgl` picks one by hand and `Goome.nativeKind()` says which one it got.

On Java 22+ start it with `--enable-native-access=ALL-UNNAMED` or Java prints a "restricted method" warning. The jar manifest already says it for `java -jar`.

The first time goome loads it unpacks the native lib into `~/.cache/goome/java` (`%LOCALAPPDATA%\goome\java` on Windows, `~/Library/Caches/goome/java` on Mac). `-Dgoome.cache=folder` moves that, `-Dgoome.lib=/path/to/libgoome.so` skips it and loads your own.

64 bit only.

## How it maps to C

Canvas methods are the C draw functions in camelCase minus `goome_draw_`, so `goome_draw_round_rect(c, ...)` is `c.roundRect(...)`. Constants live on `Goome` and `Ui`: `GOOME_QUIT` is `Goome.QUIT`, `GOOME_WIN_MOVE` is `Ui.WIN_MOVE`. Widgets return the new value, no pointers:

```java
volume = ui.slider("Volume", volume, 0, 1, "%.2f");
```

`ui.changed()` is whether the last widget changed this frame. State that C keeps a pointer to lives in small holder objects, `Window` for window spots and `Flag` for open/checked bools. Anything holding native memory is `AutoCloseable`. Errors from C throw `GoomeException` or a subclass like `GoomeException.Again`, with the C code on `code()`.

Editors: [IntelliJ IDEA](editor-intellij.md), [Eclipse](editor-eclipse.md) or the [plain terminal](editor-terminal.md).
