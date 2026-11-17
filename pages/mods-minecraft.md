---
title: Minecraft
---

# Minecraft <kbd>0.3</kbd>

[java-goome](https://github.com/goome-ui/java-goome) has a Fabric mod and a NeoForge mod for Minecraft 26.3 in `minecraft/`, built by CI on every push. CI never starts Minecraft though, it builds the jars and checks what is inside them, so the screen, the keys and the input blocking below are only tested through the Minecraft free `GoomeView` layer. Both do the same thing:

| Key | Does |
|:--|:--|
| G | opens a goome screen with a small mod menu, tabs, toggles, sliders and a combo |
| H | turns the goome hud in the corner on and off |

## Build and install

```sh
git clone https://github.com/goome-ui/java-goome
cd java-goome
./build.sh
cd minecraft/fabric && ../../gradlew build
cd ../neoforge && ../../gradlew build
```

`./build.sh` makes the native lib for your OS and needs a C compiler, Gradle needs a JDK 25. You get `build/libs/goome-fabric-<version>.jar` and `build/libs/goome-neoforge-<version>.jar`, drop the one for your loader in `.minecraft/mods`. The jars from CI have the native libs for Linux, Windows and macOS arm64 in them, the ones you build only have yours.

The mods use java-goome's LWJGL path since Minecraft already loads LWJGL, so theres no JNI glue and no native access warning.

## How it works

The screen is an offscreen goome the size of the gui. Every frame goome draws into its own pixels, the changed part (`frameDirty`) gets copied straight into a `NativeImage` and goes on screen as one premultiplied texture.

All of Minecraft's input goes into goome first. While goome wants it (youre dragging a slider or typing in a box) Minecraft never sees it. When goome doesnt want it, it goes on to Minecraft like normal, so esc still closes the screen. Same rules as [eaten input](mods-platforms.md#eaten-input).

## Your own menu

`minecraft/common` doesnt touch Minecraft at all. `GoomeView` does the input and the texture upload, `Keys` maps the keys and `Menu` is the sample menu. `minecraft/shared` is the Minecraft side both loaders use, `GoomeScreen`, `GoomeHud` and `GoomeTexture`. The loader folders are only the entrypoints.

A `GoomeScreen` takes a `Consumer<Ui>`, so swap `Menu::draw` for your own:

```java
Window win = new Window(20, 20, 260, 0);
double[] speed = {1.0};
mc.gui.setScreen(new GoomeScreen(Component.literal("my mod"), ui -> {
    if (ui.window("my mod", win, Ui.WIN_MOVE)) speed[0] = ui.slider("Speed", speed[0], 0.1, 4, "%.1fx");
    ui.windowEnd();
}));
```

The `Ui` there is the normal java-goome one, `ui.wantsMouse()` and `ui.wantsKeyboard()` included. The rest of the Java API is on [Getting started in Java](start-java.md) and in the [java-goome readme](https://github.com/goome-ui/java-goome#readme).
