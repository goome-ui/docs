---
title: Eclipse
---

# Eclipse <kbd>0.3</kbd>

## Plain Java project

1. File > New > Java Project, JRE 22 or newer.
2. Right click the project > Build Path > Add External Archives and pick `goome-0.5.0.jar` ([where to get it](start-java.md#no-build-tool)).
3. Paste the overlay from [Getting started in Java](start-java.md#your-first-overlay) into `Main.java` in the default package.
4. Run > Run Configurations > Arguments, put `--enable-native-access=ALL-UNNAMED` in VM arguments, then Run.

On Java 17 or 21 add `lwjgl.jar` and the `lwjgl-natives` jar for your OS the same way.

If `module-info.java` got made, delete it or put `requires` lines in it yourself. The steps above assume no modules.

## Gradle

File > Import > Gradle > Existing Gradle Project works with the `build.gradle` from [Getting started in Java](start-java.md#gradle). Running `main` from the editor still needs the VM argument above.

## Debugging

Debug As > Java Application. Breakpoints work in your code, goome itself is C so you cant step into it. Environment variables like `GOOME_BACKEND=test` go on the Environment tab of the run config ([Testing without a screen](testing.md)).
