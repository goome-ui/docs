---
title: Unity mods
---

# Unity mods <kbd>0.3</kbd>

goome's UI kit as a mod menu in someone elses Unity game, for BepInEx (5 and 6) or MelonLoader. Its in [csharp-goome](https://github.com/goome-ui/csharp-goome) under `mods/`. Making your own Unity project is [Getting started in Unity](start-unity.md), this page is for games you dont have the project for. Read the [anti-cheat line](mods.md#anti-cheat) first.

`mods/GoomeMod/` is the helper. It runs goome offscreen, uploads the pixels to a Texture2D and draws it with `GUI.DrawTexture` in OnGUI. That only uses plain IMGUI calls, so it should work in most Unity versions and on IL2CPP too, but it has never run inside a real Unity or a real game, see [Testing](#testing). It feeds goome the mouse and keys and keeps them from the game while goome wants them. `mods/templates/` has a ready mod per loader with a sample menu, F8 opens it.

## Build

You need the .NET 8 SDK. From the csharp-goome root:

```sh
dotnet build mods/templates/BepInEx5 -c Release
dotnet build mods/templates/BepInEx6 -c Release
dotnet build mods/templates/MelonLoader -c Release
```

Every build makes a `dist/` folder next to the dll laid out like the game folder, copy whats inside it straight into the game. `netstandard2.0` and `net472` are the Mono builds, `net6.0` is IL2CPP.

It builds against the Unity 2019.4 reference dlls from NuGet, `-p:UnityVersion=2022.3.62` picks another (CI only builds the default one). IL2CPP games have their own generated dlls, build against those with `-p:GameDlls=path/to/BepInEx/interop` (or `MelonLoader/Il2CppAssemblies`). CI builds the `net6.0` templates against the NuGet Il2CppInterop reference dlls, not against a real game's.

## Install

| Loader | Copy | Ends up in |
|:--|:--|:--|
| BepInEx 5 (Mono) | `templates/BepInEx5/bin/Release/netstandard2.0/dist/BepInEx` | `BepInEx/plugins/GoomeMenu/` |
| BepInEx 6 Mono | `templates/BepInEx6/bin/Release/netstandard2.0/dist/BepInEx` | same |
| BepInEx 6 IL2CPP | `templates/BepInEx6/bin/Release/net6.0/dist/BepInEx` | same |
| MelonLoader 0.6+ | `Mods` and `UserLibs` from `templates/MelonLoader/bin/Release/net472/dist/` (Mono) or `net6.0/dist/` (IL2CPP) | mod dll in `Mods/`, the rest in `UserLibs/` |

Start the game once with the loader installed before you copy anything in. For BepInEx 6 IL2CPP thats also what makes `BepInEx/interop` for `-p:GameDlls`. MelonLoader tries to load every dll in `Mods/` as a mod, thats why everything but the mod dll goes in `UserLibs/`.

The hotkey is in `BepInEx/config/com.you.goomemenu.cfg` or `UserData/MelonPreferences.cfg`.

## Your own menu

```csharp
var mod = new GoomeMod("my.mod", "F8", pluginFolder);
mod.Draw += ui =>
{
    if (ui.Window("My mod", ref x, ref y, ref w, ref h, WindowFlags.Move))
    {
        ui.Toggle("Fly", ref fly);
        ui.Slider("Speed", ref speed, 1, 10);
    }
    ui.WindowEnd();
};
```

Call `mod.Update()` from Update, `mod.OnGUI()` from OnGUI and `mod.Dispose()` when the mod unloads, the templates already do. `mod.Open` shows or hides it, `mod.WantsMouse` and `mod.WantsKeyboard` say what goome has right now, `mod.BlockAllWhileOpen` gives the game nothing at all while its open and `mod.Scale` sizes the whole menu. goome only draws when something changed, set `mod.RedrawEveryFrame` if the menu shows live numbers.

## Input blocking

Harmony prefixes on `UnityEngine.Input` return nothing while goome wants that input. Thats `GetKey`, `GetKeyDown/Up`, `GetMouseButton*`, `GetButton*`, `GetAxis`, `GetAxisRaw`, `anyKey`, `anyKeyDown`, `mouseScrollDelta` and `inputString`, and `mousePosition` stays put so mouse look doesnt move. Mouse axes and Mouse0-6 count as mouse, the rest as keyboard. On the new Input System every enabled InputAction on the mouse or keyboard gets turned off and exactly those come back after.

It never leaves the game stuck. Blocking stops right away when the game loses focus, on a scene change, when the mod unloads or gets disabled, and when `Update()` hasnt run for 2 frames.

On IL2CPP the patches go through Il2CppInterop's native detours. Game code IL2CPP inlined can skip them, a mod cant do anything about that. I havent tried it on a real IL2CPP game yet, and the IL2CPP builds are only compiled in CI, so if it breaks tell me which game.

## Testing

Theres no Unity and no game in CI, and BepInEx and MelonLoader never load the mods there. What CI does: `tests/ModTests` runs GoomeMod against fake UnityEngine types with real HarmonyX patches and checks when input gets blocked and given back (55 checks), and the three templates get built against the NuGet reference dlls (BepInEx.Core 5.4.21, BepInEx.Unity 6, Unity 2019.4.40, MelonLoader 0.7.2) with their `dist/` layout checked:

```sh
./build.sh
dotnet run --project tests/ModTests -c Release
```

So the Mono builds are built and tested against a fake Unity, the IL2CPP ones only built, and none of it has run in a real game yet. Change a template and you need to try it in one. The release only ships the Mono zips (BepInEx 5, BepInEx 6 Mono and MelonLoader Mono), the IL2CPP ones you build yourself.
