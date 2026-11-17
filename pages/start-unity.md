---
title: Getting started in Unity
---

# Getting started in Unity <kbd>0.2</kbd>

Unity owns the window here, so goome runs in [offscreen mode](offscreen-mode.md). It draws into a pixel buffer, you upload that to a `Texture2D` every frame and feed it mouse and keyboard yourself. The pixels are the same ones goome draws on a desktop. CI builds this package's C# against stand-in UnityEngine types and runs the same code through plain .NET, it never opens a real Unity, so the Unity side (texture upload, input, your Unity version) is untested. The package asks for Unity 2021.3 or newer.

## Add the package

Theres a Unity package with the Windows, Linux and Mac native libs in it. Window > Package Manager, +, Add package from git URL:

```text
https://github.com/goome-ui/csharp-goome.git?path=/unity/com.goome-ui.goome
```

If Unity says it cant find `goome`, or you want to know where the native libs end up, see the [Unity editor page](editor-unity.md).

For one exact version instead of the newest, see [Versions](versions.md).

## The loop

Same in any engine:

1. open goome with `GOOME_MODE_OFFSCREEN` and a size
2. every frame, push the input you got from the engine with `goome_push`
3. poll with a timeout of 0, feed the events to the ui, draw your ui
4. after `goome_ui_end`, read the pixels with `goome_frame` and upload them

Put this on anything with a `RawImage` and you get a little settings window:

```csharp
using GoomeSharp;
using UnityEngine;
using UnityEngine.UI;
using Event = GoomeSharp.Event;
using RawImage = UnityEngine.UI.RawImage;

public class GoomePanel : MonoBehaviour
{
    public int width = 480, height = 320;
    Goome g;
    Ui ui;
    Texture2D tex;
    double x = 20, y = 20, w = 300, h = 0, volume = 0.5;

    void Start()
    {
        g = Goome.OpenOffscreen(width, height);
        ui = new Ui(g);
        tex = new Texture2D(width, height, TextureFormat.BGRA32, false);
        GetComponent<RawImage>().texture = tex;
    }

    void Update()
    {
        var rect = GetComponent<RectTransform>();
        RectTransformUtility.ScreenPointToLocalPointInRectangle(rect, Input.mousePosition, null, out var p);
        double mx = p.x - rect.rect.x, my = rect.rect.height - (p.y - rect.rect.y);
        g.Push(Event.Motion(mx, my));
        if (Input.GetMouseButtonDown(0)) g.Push(Event.Down(mx, my, 1));
        if (Input.GetMouseButtonUp(0)) g.Push(Event.Up(mx, my, 1));

        while (g.Poll(out var ev, 0)) ui.Feed(ev);
        if (ui.Begin(0) == null) return;
        if (ui.Window("Settings", ref x, ref y, ref w, ref h, WindowFlags.Move))
            ui.Slider("Volume", ref volume, 0, 1, "%.2f");
        ui.WindowEnd();
        ui.End();

        if (g.TryFrame(out var frame))
        {
            tex.SetPixelData(frame.Pixels.ToArray(), 0);
            tex.Apply();
        }
    }

    void OnDestroy()
    {
        ui?.Dispose();
        g?.Dispose();
    }
}
```

It'll be upside down. goome rows go top to bottom, Unity textures bottom to top, so set the `RawImage` UV rect height to -1 or flip the rows when you copy.

## Things to know

- Use [premultiplied alpha](offscreen-mode.md#the-pixels) on the material or you get dark halos on the edges.
- Poll with 0, nothing in offscreen mode blocks.
- Clipboard doesnt cross over by itself. Sync `GUIUtility.systemCopyBuffer` with `goome_clipboard_get` / `goome_clipboard_set` if you want copy paste.
- The UI asks for cursor shapes (ibeam over inputs etc). Ignore it or read `goome_cursor_shape` and set Unity's cursor.
- High DPI: pass a scale, the buffer is then `width * scale` by `height * scale` real pixels.

More engine side stuff (Godot, your own engine) on [Offscreen mode](offscreen-mode.md).
