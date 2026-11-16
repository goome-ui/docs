---
title: Rider
---

# Rider

Theres a goome plugin for Rider (and the other JetBrains IDEs), [jetbrains-goome](https://github.com/goome-ui/jetbrains-goome). It adds `goome` live templates for C# and C++, a "goome: New Project" action and a preview for `.goome.json` builder files. Get the `.zip` from its [releases](https://github.com/goome-ui/jetbrains-goome/releases/latest), then Settings > Plugins > gear > Install Plugin from Disk.

For C#. Rider can open CMake projects but for C just use [CLion](editor-clion.md).

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
