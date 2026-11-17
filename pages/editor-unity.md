---
title: Unity
---

# Unity <kbd>0.2</kbd>

## Add the package

Window > Package Manager, the + at the top left, Add package from git URL:

```text
https://github.com/goome-ui/csharp-goome.git?path=/unity/com.goome-ui.goome
```

Add a tag to pin a version, like `...?path=/unity/com.goome-ui.goome#v0.2.0`. Or put it in `Packages/manifest.json`:

```json
{
  "dependencies": {
    "com.goome-ui.goome": "https://github.com/goome-ui/csharp-goome.git?path=/unity/com.goome-ui.goome"
  }
}
```

It has GoomeSharp and the native libs for Windows x64, Linux x64 and both Macs, with import settings in the `.meta` files (CI checks that the libs and their `.meta` files are there). It asks for Unity 2021.3 or newer. CI never starts Unity, it only compiles the package C# against stand-in UnityEngine types, so if the import settings or something else misbehaves in your editor, tell me which Unity version.

## Using it

Unity means [offscreen mode](offscreen-mode.md). goome draws into a buffer, you upload it as a texture and push it your input. Copy the MonoBehaviour from [Getting started in Unity](start-unity.md).

## Debugging

Attach Rider or Visual Studio to Unity like normal. The native libs in the package have no symbols, build your own with `-g` and drop it over the packaged one if you need to step into C.

## Gotchas

- `DllNotFoundException: goome` means the native lib didnt load. In the package's `Plugins` folder the lib for your OS has to be ticked for the Editor and your build target. Restart the editor after changing it, Unity holds on to native libs until then.
- Dark edges around the UI = wrong blend mode, see [the pixels](offscreen-mode.md#the-pixels).
- Upside down? Set the RawImage UV rect height to -1, goome's rows go top down.
- No screen recording or accessibility permissions in Unity, offscreen mode never touches the OS.
