---
title: Rider
---

# Rider

## The goome plugin

[jetbrains-goome](https://github.com/goome-ui/jetbrains-goome) works in Rider, CLion, IntelliJ IDEA and PyCharm, 2024.3 or newer. Its on the [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/36174-goome) as **goome** (`io.github.goomeui.goome`): Settings > Plugins > Marketplace, search goome, Install.

The Marketplace page can still be waiting on JetBrains to approve it. If it doesnt show up yet, install it from disk: grab `jetbrains-goome-x.y.z.zip` from the [releases](https://github.com/goome-ui/jetbrains-goome/releases/latest), dont unzip it, then Settings > Plugins > gear > Install Plugin from Disk and restart.

**The tool window** <kbd>0.5</kbd>. The goome icon on the left stripe, right by Project. It has:

- quick actions: New Project, Open UI builder, Search docs, Open docs
- every `.goome.json` and `.goome-theme.json` in the project, click one to open it with the preview
- the templates for each language, click one and New Project opens with it picked
- a snippet cheat sheet that drops the snippet into the file youre in

The rest:

- Live templates - type `goome` and pick one. In Rider theyre C# and C++ and ship as a ReSharper settings layer, so they show up in the goome category by themselves
- goome: New Project - in Tools > goome or on the welcome screen, runs [goome new](templates.md)
- Preview - a `.goome.json` opens with the text on the left and a live preview on the right, with buttons that copy the C, C#, Python or Java
- goome: Search Docs - in Tools > goome, a searchable list of every goome function. In Rider the C quick docs stay with ReSharper, use this instead
- Schemas - check `.goome.json` and `.goome-theme.json` while you type

The preview needs JCEF, which every JetBrains IDE has unless you turned it off. Settings are in Settings > Tools > goome.

The plugin only needs the base platform, so it should load in RustRover, GoLand and WebStorm too, just without templates for those languages. Nobody tried that yet.

## C# in Rider

Rider can open CMake projects but for C just use [CLion](editor-clion.md).

## Open csharp-goome

1. Build the native lib once: `./build.sh` in the csharp-goome folder (Git Bash with mingw gcc on Windows, or `./build.sh win` from Linux).
2. File > Open, `csharp-goome.sln`.
3. Hello, Grab and UiDemo run configs are already there.

## Your own project

1. File > New Solution, Console, .NET 8 or newer.
2. Add goome:
   - right click the solution, Add > Existing Project, `src/GoomeSharp/GoomeSharp.csproj`, then reference it from your app
   - or add the nupkg folder as a NuGet source (Settings > NuGet > Sources) and install GoomeSharp
3. Paste the overlay from [Getting started in C#](start-csharp.md) into `Program.cs` and run.

Add `GOOME_BACKEND=test` and `GOOME_TEST_SHOTS=shots/` to the run config's environment to get every frame as a .ppm in `shots/` without touching your screen ([Testing without a screen](testing.md)).

## Debugging

Rider only debugs the managed side. For the C side build the native lib with `CC="gcc -g" ./build.sh` and attach gdb or lldb next to Rider.

## If something breaks

`DllNotFoundException` is almost always the native lib never getting built. It gets copied from `runtimes/<rid>/native/` on build, so run `build.sh` then rebuild. `GOOME_NATIVE` points it at another folder.

On a Mac its Rider that macOS asks about for grabs and hotkeys ([details](platforms.md#macos-permissions)).
