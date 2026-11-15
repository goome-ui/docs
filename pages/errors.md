---
title: Error messages
---

# Error messages <kbd>0.4</kbd>

Got an error out of goome? Paste it into the search box up top and it should land you right on it. Every message goome can hand you is on this page, 244 of them, pulled straight out of the c-goome source.

Bits like `<backend>` or `<n>` get filled in when it happens, so yours will have a real name or number there instead.

## Where the message comes from

Most calls give back one of the `GOOME_E*` codes and leave the message on the handle. For image loading theres no handle so it has its own:

```c
if (goome_hotkey(g, "alt+h", 1) != GOOME_OK) printf("%s\n", goome_error(g));
if (goome_bitmap_load("logo.png", &b) != GOOME_OK) printf("%s\n", goome_bitmap_error());
```

```csharp
if (!g.Hotkey("alt+h", 1)) Console.WriteLine(g.LastError);
try { var b = Bitmap.Load("logo.png"); } catch (GoomeException e) { Console.WriteLine(e.Message); }
```

```python
try:
    g.hotkey("alt+h", 1)
except goome.GoomeError:
    print(g.error)
```

```java
try {
    g.hotkey("alt+h", 1);
} catch (GoomeException e) {
    System.out.println(g.error());
}
```

`goome_strerror(code)` turns the number into a short line, those are below. If `goome_open` fails theres no handle yet, so all you get is the code from its `err` out arg.

| Code | Number | `goome_strerror` says |
|:--|:--|:--|
| `GOOME_ENOTSUP` | -1 | `this backend cant do that` |
| `GOOME_EDENIED` | -2 | `not allowed (permission or the user said no)` |
| `GOOME_ENODISPLAY` | -3 | `no display to draw on` |
| `GOOME_EGONE` | -4 | `that monitor is gone` |
| `GOOME_EAGAIN` | -5 | `nothing yet, try again in a bit` |
| `GOOME_ENOMEM` | -6 | `out of memory` |
| `GOOME_EARG` | -7 | `bad argument` |

## Core

These come from the shared code every backend goes through, so you can get them on any desktop. A lot of them have `<backend>` in front, thats whatever `goome_backend_name` says.

### `capture is off (no_capture) or this desktop has no way to grab`

<kbd>GOOME_ENOTSUP</kbd> from `goome.c` line [463](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L463)

`goome_capture` was called but either you set `no_capture` in the options or this desktop has no capture backend at all.

**What to do:** Turn `no_capture` off if you set it. If thats not it, this session type just cant be grabbed, so use the test backend or a different session.

### `no monitor <mon>`

<kbd>GOOME_EGONE</kbd> from `goome.c` line [464](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L464)

`goome_capture` got a monitor index that doesnt exist, either negative or past the number of monitors.

**What to do:** Call `goome_monitors` and pass an index below the count it returns. Monitors can also come and go, so re-check after a display change.

### `that rect is off monitor <mon>`

<kbd>GOOME_EARG</kbd> from `goome.c` line [471](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L471)

The rect you gave `goome_capture` doesnt overlap the monitor at all once its clipped to the monitor area.

**What to do:** Pass a rect inside the monitor `area`, or `NULL` to grab the whole monitor. Remember the rect is in that monitors own coordinates.

### `no memory for the hit rects`

<kbd>GOOME_ENOMEM</kbd> from `goome.c` line [525](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L525)

`goome_end` couldnt allocate room to keep your click-through hit rects for the frame.

**What to do:** Nothing to do in the app except use fewer rects. If this really happens the machine is out of memory.

### `<backend> cant take the keyboard`

<kbd>GOOME_ENOTSUP</kbd> from `goome.c` line [578](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L578)

`goome_keyboard` was called on a backend that has no way to take keyboard focus, so `<backend>` is the name of the backend goome ended up on.

**What to do:** Dont rely on keyboard input in that mode. Use `goome_hotkey` for global keys or switch to window mode, which can take the keyboard.

### `<backend> cant grab the pointer`

<kbd>GOOME_ENOTSUP</kbd> from `goome.c` line [587](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L587)

`goome_grab` was called on a backend that cant grab the pointer. `<backend>` is the backend name.

**What to do:** Skip the grab on that backend or check the capabilities first. Window mode and overlay backends that support it are the ones that can do this.

### `<backend> cant grab keys system wide, bind a key to send a line to <state_dir> instead`

<kbd>GOOME_ENOTSUP</kbd> from `goome.c` line [601](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L601)

`goome_hotkey` was called on a backend with no system-wide key grab, which is common on Wayland. `<state_dir>` in the message is your control fifo path (or a hint to set `state_dir`).

**What to do:** Bind a key in your compositor or desktop settings that writes a line to that fifo, and set `state_dir` if goome says it has none. See [hotkeys](hotkeys.md).

### `cant read the combo '<combo>'`

<kbd>GOOME_EARG</kbd> from `goome.c` line [607](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L607)

`goome_hotkey` couldnt parse the combo string you gave it, so nothing was registered.

**What to do:** Use modifiers and a key name joined with plus, like `ctrl+shift+k`. Check the spelling of the key name, see [hotkeys](hotkeys.md).

### `only <n> hotkeys at once`

<kbd>GOOME_ENOMEM</kbd> from `goome.c` line [608](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L608)

`goome_hotkey` hit the limit of hotkeys goome keeps at once, `<n>` in the message.

**What to do:** Remove ones you dont need by calling `goome_hotkey` with a `NULL` combo and the same id, or reuse ids since the same id replaces the old combo.

### `<backend> has no window to change`

<kbd>GOOME_ENOTSUP</kbd> from `goome.c` line [640](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L640)

One of the `goome_window_*` calls was made on a backend that has no real window, so there was nothing to change. `<backend>` is its name.

**What to do:** Use window mode if you need to change the title, size or state. In overlay mode just skip the call.

### `<backend> cant change the cursor`

<kbd>GOOME_ENOTSUP</kbd> from `goome.c` line [689](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L689)

`goome_cursor` was called on a backend that cant change the pointer shape. goome still remembers the shape you asked for.

**What to do:** Ignore the error if you dont care, or draw your own cursor in the canvas. Window mode usually supports it.

### `<backend> has no clipboard`

<kbd>GOOME_ENOTSUP</kbd> from `goome.c` lines [698](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L698), [706](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L706)

`goome_clipboard_set` or `goome_clipboard_get` was called on a backend that has no clipboard.

**What to do:** Dont depend on the clipboard there. Window mode or offscreen mode both have one, offscreen just keeps it in memory.

### `the event queue is full`

<kbd>GOOME_EAGAIN</kbd> from `goome.c` line [728](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L728)

`goome_push` couldnt add your event because the queue of waiting events is already full.

**What to do:** Poll events more often so the queue drains, or push fewer events per frame. The event wasnt added, so you can retry after polling.

### `goome_resize is for offscreen mode`

<kbd>GOOME_ENOTSUP</kbd> from `goome.c` line [734](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L734)

`goome_resize` was called while goome isnt in offscreen mode.

**What to do:** Only call it in offscreen mode. In window mode use `goome_window_size` instead.

### `no memory for the clipboard`

<kbd>GOOME_ENOMEM</kbd> from `goome.c` lines [743](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L743), [755](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L755)

goome couldnt allocate a copy of the clipboard text, either while storing it with `goome_clipboard_set` or reading it back with `goome_clipboard_get`.

**What to do:** Nothing the app can do except copy less text. If it happens the machine is out of memory.

### `no frame sent yet`

<kbd>GOOME_EAGAIN</kbd> from `goome.c` line [778](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L778)

`goome_frame`, or something that uses it like `goome_frame_copy`, was called before any frame was finished with `goome_end`, or the last canvas is no longer the current one for its monitor.

**What to do:** Draw and call `goome_end` at least once first, and then read the frame. If you resized or changed monitors, wait for the next frame.

### `frame_copy: rect is off the <w>x<h> frame`

<kbd>GOOME_EARG</kbd> from `goome.c` line [802](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L802)

The rect you gave `goome_frame_copy` isnt fully inside the last frame, or its width or height is zero or negative.

**What to do:** Keep the rect inside the `<w>x<h>` frame size shown, or pass `NULL` to copy the whole frame.

### `frame_copy: stride <stride> is too small for <w> px`

<kbd>GOOME_EARG</kbd> from `goome.c` line [803](https://github.com/goome-ui/c-goome/blob/main/src/goome.c#L803)

The `dst_stride_bytes` you gave `goome_frame_copy` is smaller than one row of the copy needs, which is 4 bytes per pixel.

**What to do:** Pass a stride of at least width times 4. Use the real row size of your destination buffer.

## Test and offscreen backends

The test backend runs when `GOOME_TEST_*` is set or you ask for `GOOME_TEST`, and offscreen is `GOOME_MODE_OFFSCREEN`. See [Testing without a screen](testing.md) and [Offscreen mode](offscreen-mode.md).

### `test backend: bad size <w>x<h>`

<kbd>GOOME_EARG</kbd> from `test.c` line [232](https://github.com/goome-ui/c-goome/blob/main/src/test.c#L232)

The test backend was asked for a size under 1 or over 16384 in one direction, usually from `width` and `height` in the options or a `goome_window_size` call. Window mode also raises it to `min_width` and `min_height` first.

**What to do:** Pick a size between 1 and 16384. Check the size in your test script or options.

### `test backend: no memory for the canvas`

<kbd>GOOME_ENOMEM</kbd> from `test.c` line [235](https://github.com/goome-ui/c-goome/blob/main/src/test.c#L235)

The test backend couldnt allocate the canvas for the size you asked for.

**What to do:** Use a smaller size or scale. If the size is normal then the machine is out of memory.

### `test backend: cant read frames from <dir>`

<kbd>GOOME_ENODISPLAY</kbd> from `test.c` line [260](https://github.com/goome-ui/c-goome/blob/main/src/test.c#L260)

The test backend was pointed at a frames source (`test_frames` or `GOOME_TEST_FRAMES`) but couldnt load the first frame from it. `<dir>` is that path.

**What to do:** Check the path exists. Give a single `.ppm` file, or a folder with numbered files like `000000.ppm`, `000001.ppm` and so on, in a valid PPM format.

### `test backend: no memory for the frame`

<kbd>GOOME_ENOMEM</kbd> from `test.c` line [273](https://github.com/goome-ui/c-goome/blob/main/src/test.c#L273)

The test backend ended up with no desktop frame to show, either because it couldnt allocate the fake one or the loaded frame was empty.

**What to do:** If you set a frames path, check that the file is a normal PPM. Otherwise the machine is out of memory.

### `test backend: nothing to grab there`

<kbd>GOOME_EARG</kbd> from `test.c` line [302](https://github.com/goome-ui/c-goome/blob/main/src/test.c#L302)

`goome_capture` on the test backend got a rect that is empty once its cut down to the canvas, so there was nothing to copy.

**What to do:** Use a rect that overlaps the test screen and has some width and height. Check your `test_frames` size and scale.

### `test backend: no memory for the grab`

<kbd>GOOME_ENOMEM</kbd> from `test.c` line [305](https://github.com/goome-ui/c-goome/blob/main/src/test.c#L305)

The test backend couldnt allocate the buffer for a `goome_capture` result.

**What to do:** Grab a smaller rect. If it still fails the machine is out of memory.

### `test backend: no window in overlay mode`

<kbd>GOOME_ENOTSUP</kbd> from `test.c` line [485](https://github.com/goome-ui/c-goome/blob/main/src/test.c#L485)

A `goome_window_*` call was made on the test backend while it is in overlay mode, which has no window.

**What to do:** Open goome in window mode for tests that use `goome_window_*`, or dont call those in overlay mode.

### `offscreen: bad size <w>x<h> at <scale>`

<kbd>GOOME_EARG</kbd> from `offscreen.c` line [25](https://github.com/goome-ui/c-goome/blob/main/src/offscreen.c#L25)

`goome_open` in offscreen mode or `goome_resize` was given a width or height that is zero, negative or over 16384, or a scale outside 0 to 8. The scale in the message is `<scale>`.

**What to do:** Use a size from 1 to 16384 and a scale from 0 to 8. A scale of 0 means 1.

### `offscreen: <w>x<h> px is too big`

<kbd>GOOME_EARG</kbd> from `offscreen.c` line [30](https://github.com/goome-ui/c-goome/blob/main/src/offscreen.c#L30)

Once the size is multiplied by the scale, the offscreen frame goes over 16384 pixels in one direction. `goome_open` or `goome_resize` returns it.

**What to do:** Lower the size or the scale so width times scale and height times scale stay at 16384 or less.

### `offscreen: no memory for a <w>x<h> frame`

<kbd>GOOME_ENOMEM</kbd> from `offscreen.c` line [33](https://github.com/goome-ui/c-goome/blob/main/src/offscreen.c#L33)

goome couldnt allocate the pixel buffer for the offscreen frame size in the message.

**What to do:** Use a smaller size or scale. If the size is normal then the machine is out of memory.

### `offscreen: no memory`

<kbd>GOOME_ENOMEM</kbd> from `offscreen.c` line [47](https://github.com/goome-ui/c-goome/blob/main/src/offscreen.c#L47)

`goome_open` in offscreen mode couldnt allocate its small state block.

**What to do:** Nothing the app can do. The machine is out of memory.

### `offscreen: no window, nothing to move`

<kbd>GOOME_ENOTSUP</kbd> from `offscreen.c` line [96](https://github.com/goome-ui/c-goome/blob/main/src/offscreen.c#L96)

A `goome_window_*` call that offscreen mode doesnt handle was made, like `goome_window_drag`. Title, size, state and show do work offscreen, but there is no real window to move.

**What to do:** Skip dragging and moving calls in offscreen mode, or check `goome_mode` before calling them.

## X11

Linux on X11, or XWayland when goome falls back to it.

### `cant find libX11.so.6`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [301](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L301)

goome loads libX11 at runtime and couldnt find it, so `goome_open` and `goome_capture` cant use X11.

**What to do:** Install it, package `libx11-6` on Debian and Ubuntu, `libX11` on Fedora, `libx11` on Arch.

### `cant find libXfixes.so.3`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [302](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L302)

goome loads libXfixes at runtime and couldnt find it, so X11 can be used by neither `goome_open` nor `goome_capture`.

**What to do:** Install it, package `libxfixes3` on Debian and Ubuntu, `libXfixes` on Fedora, `libxfixes` on Arch.

### `libX11 has no <symbol>`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [376](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L376)

The libX11 or libXfixes on this machine is missing the function `<symbol>` that goome looks up when loading, so X11 cant be used.

**What to do:** Update the X libraries (`libx11-6`, `libxfixes3`) to a normal current version. A stripped or very old build is the usual cause.

### `no memory for a <w>x<h> overlay`

<kbd>GOOME_ENOMEM</kbd> from `x11.c` line [533](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L533)

The X11 overlay couldnt allocate its `<w>`x`<h>` pixel buffer while `goome_open` was setting up or after the screen size changed.

**What to do:** This is a real out of memory, theres nothing to change in the app. If the numbers look huge, check that the X server is reporting a sane screen size.

### `XCreateImage failed for <w>x<h>`

<kbd>GOOME_ENOMEM</kbd> from `x11.c` line [535](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L535)

Xlib refused to wrap the overlay buffer in an image for a `<w>`x`<h>` screen, so the overlay couldnt be built. It comes from `goome_open` or from a later screen size change.

**What to do:** Usually means Xlib itself ran out of memory, so free some up and try again. If it keeps happening on a normal screen size, thats a bug, tell me the resolution.

### `x11 does overlay and window mode only`

<kbd>GOOME_ENOTSUP</kbd> from `x11.c` line [577](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L577)

You asked `goome_open` for a mode the X11 backend doesnt have. It only does overlay and window.

**What to do:** Use `GOOME_MODE_OVERLAY` or `GOOME_MODE_WINDOW` in the options when youre on X11.

### `DISPLAY isnt set, no X server to talk to`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` lines [580](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L580), [1298](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1298)

`goome_open` (overlay or window mode) found no `DISPLAY` environment variable, so it has no X server to connect to.

**What to do:** Run the app from inside a desktop session, or set `DISPLAY` (like `:0`). Over ssh or from a service the variable is usually missing.

### `cant connect to the X server on <display>`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` lines [584](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L584), [1306](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1306), [1972](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1972)

Xlib couldnt open the display named in `DISPLAY`, from `goome_open` or `goome_capture`. The server isnt running there or youre not allowed to use it.

**What to do:** Check that `DISPLAY` points at a live X server and that your user is allowed on it (`XAUTHORITY` for a different user, or `xhost`). On Wayland make sure XWayland is running.

### `the X server has no XFixes, cant make a click-through window`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [591](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L591)

Overlay mode needs the XFixes extension to let mouse clicks pass through the overlay, and this X server doesnt have it. Comes from `goome_open`.

**What to do:** Use an X server that has XFixes (nearly all real ones do), or try window mode instead of overlay. Some bare VNC or test servers leave it out.

### `the X server has no 32 bit visual, cant make a see-through window`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [601](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L601)

The overlay needs a 32 bit TrueColor visual for transparency and the X server doesnt offer one. Comes from `goome_open`.

**What to do:** Run on a server with a 32 bit visual (any normal desktop has one), or use window mode without `GOOME_WINDOW_TRANSPARENT`. Some VNC servers with a 24 bit screen are the usual cause.

### `the X server said no while making the overlay (error <n>)`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [632](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L632)

An X protocol error came back while `goome_open` was creating the overlay window and buffers. `<n>` is the X error code, I dont know which request set it off.

**What to do:** Try again and check the terminal for an X error line. If it repeats, tell me the error number and your desktop and X server.

### `the desktop wont give keyboard focus to our X window`

<kbd>GOOME_EDENIED</kbd> from `x11.c` line [1048](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1048)

`goome_keyboard` (keyboard capture) asked for focus, but on Wayland the desktop wouldnt give it to our XWayland window, and a grab there wouldnt see keys going to native apps anyway.

**What to do:** On a Wayland session run the app with the Wayland backend if you need keyboard input, or log into an X11 session. Clicking the overlay first can also help.

### `couldnt grab the keyboard (X said <n>), another app or the desktop holds it`

<kbd>GOOME_EDENIED</kbd> from `x11.c` line [1052](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1052)

`goome_keyboard` tried an X keyboard grab and it failed, `<n>` is the X grab status. Most often another app already holds a grab, or a menu is open.

**What to do:** Close whatever has the keyboard (menus, screen lockers, other grabbing tools) and call it again.

### `couldnt grab the pointer (X said <n>)`

<kbd>GOOME_EDENIED</kbd> from `x11.c` lines [1069](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1069), [1692](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1692)

The pointer grab from `goome_grab` failed, `<n>` is the X status. Another app is holding the mouse, or the window wasnt visible yet.

**What to do:** Let go of any open menu or drag in another app and call it again. Make sure the window is mapped before grabbing.

### `the window manager wont give our window focus`

<kbd>GOOME_EDENIED</kbd> from `x11.c` line [1076](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1076)

`goome_grab` asked the window manager to focus our window and it didnt. The grab itself may still have worked.

**What to do:** Try again after the window is shown. Some window managers block focus stealing, so turn that off or click the window once.

### `hotkey <id> is taken by another app or isnt on this keyboard`

<kbd>GOOME_EDENIED</kbd> from `x11.c` line [1131](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1131)

`goome_hotkey` couldnt grab hotkey `<id>`. Either another app already owns that key combo, or the key has no keycode on the current keyboard layout.

**What to do:** Pick a different key or modifier combo, or close the app that has it. Check the key actually exists in your layout, see [hotkeys](hotkeys.md).

### `out of memory`

<kbd>GOOME_ENOMEM</kbd> from `x11.c` lines [1302](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1302), [1961](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1961)

A plain `calloc` failed while opening X11 window mode (`goome_open`) or capture (`goome_capture`).

**What to do:** Real out of memory, theres nothing the app can do except free some and retry.

### `the X server has no 24 bit visual`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [1322](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1322)

Window mode needs a 24 bit TrueColor visual when the window isnt transparent, and the X server doesnt have one. Comes from `goome_open`.

**What to do:** Use a server with a 24 bit visual, or ask for `GOOME_WINDOW_TRANSPARENT` so it picks the 32 bit one. Very odd or 16 bit setups cause this.

### `the X server said no while making the window (error <n>)`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [1374](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1374)

An X protocol error came back while `goome_open` was building the window in window mode. `<n>` is the X error code and I dont know which request caused it.

**What to do:** Try again and watch the terminal for the X error line. If it repeats, tell me the number, your desktop and X server.

### `the window is gone`

<kbd>GOOME_EGONE</kbd> from `x11.c` lines [1751](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1751), [2033](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L2033)

A window call (`goome_window_*` position lookup) or a window capture found the X window no longer exists, or couldnt be translated to screen coordinates.

**What to do:** The window was closed or destroyed, so reopen it with `goome_open` before using it again.

### `no window manager running, nobody to ask`

<kbd>GOOME_ENOTSUP</kbd> from `x11.c` line [1757](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1757)

`goome_window_*` state changes (minimize, maximize, fullscreen) need a window manager to carry them out, and none is running.

**What to do:** Start a window manager, or skip state changes on bare X servers. Size and position calls still work.

### `no window manager running, nobody to move the window`

<kbd>GOOME_ENOTSUP</kbd> from `x11.c` line [1768](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1768)

`goome_window_*` drag asks the window manager to move or resize the window, and there isnt one running.

**What to do:** Run under a window manager, or move the window yourself with the position and size calls.

### `no mouse button is down`

<kbd>GOOME_EARG</kbd> from `x11.c` line [1769](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1769)

`goome_window_*` drag was called when goome didnt see a mouse button held on the window, so theres nothing to drag with.

**What to do:** Only start the drag from inside a mouse down event handler, while the button is still held.

### `the X server wont give us the clipboard`

<kbd>GOOME_EDENIED</kbd> from `x11.c` line [1816](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1816)

`goome_clipboard_set` tried to become the clipboard owner and the X server didnt hand it over.

**What to do:** Try again. If it keeps failing, another clipboard tool may be fighting for ownership, so close clipboard managers to test.

### `lost the X server`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [1835](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1835)

`goome_clipboard_get` was waiting on the clipboard and the X connection dropped.

**What to do:** The X server went away or the session ended. Reopen goome once the server is back.

### `the app that owns the clipboard didnt answer`

<kbd>GOOME_EAGAIN</kbd> from `x11.c` line [1844](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1844)

`goome_clipboard_get` asked the app owning the clipboard for its text and got no reply in about 250 ms, twice if the first format failed.

**What to do:** Try again, the other app may be busy or frozen. Copying something again from a different app usually clears it.

### `DISPLAY isnt set, no X server to grab`

<kbd>GOOME_ENODISPLAY</kbd> from `x11.c` line [1968](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1968)

`goome_capture` on X11 found no `DISPLAY` variable, so theres no screen to grab from.

**What to do:** Set `DISPLAY` or run from inside the desktop session. From ssh or a service its usually missing.

### `the screen is <bpp> bits a pixel, only 24 and 32 work`

<kbd>GOOME_ENOTSUP</kbd> from `x11.c` line [1997](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1997)

`goome_capture` got an image from X that isnt 24 or 32 bits per pixel, which goome cant convert.

**What to do:** Switch the screen to 24 or 32 bit color depth. 16 bit and 8 bit displays arent supported.

### `odd pixel layout, red mask <mask>`

<kbd>GOOME_ENOTSUP</kbd> from `x11.c` line [1999](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L1999)

`goome_capture` got an image whose red channel mask `<mask>` isnt one goome knows how to convert, only common 8 bit layouts and 10 bit depth 30.

**What to do:** Try a standard 24 or 32 bit depth. If your normal desktop hits this, tell me the mask value.

### `that rect is off the screen`

<kbd>GOOME_EARG</kbd> from `x11.c` line [2040](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L2040)

`goome_capture` was asked for a rect that doesnt overlap the screen after clipping, so there is nothing to grab.

**What to do:** Pass a rect that sits at least partly on the screen, and check its width and height are above zero.

### `no memory for a <w>x<h> grab`

<kbd>GOOME_ENOMEM</kbd> from `x11.c` line [2044](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L2044)

`goome_capture` couldnt allocate the output buffer for a `<w>`x`<h>` grab.

**What to do:** A real out of memory. Grab a smaller rect if you can, otherwise free some memory.

### `XGetImage failed, the screen changed under us?`

<kbd>GOOME_EGONE</kbd> from `x11.c` line [2063](https://github.com/goome-ui/c-goome/blob/main/src/x11.c#L2063)

`goome_capture` asked X for the pixels and the request failed or raised an X error, most likely the screen size changed mid grab or the area became invalid.

**What to do:** Just try the capture again. If it fails every time, tell me your resolution and setup.

## Wayland

Linux on a Wayland compositor. What works depends a lot on the compositor, [Where it works](platforms.md) has the list.

### `cant find libwayland-client.so.0`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` line [859](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L859)

`goome_open` tried to `dlopen` `libwayland-client.so.0` for wayland and the system doesnt have it.

**What to do:** Install the wayland client library (`libwayland-client0` on Debian and Ubuntu, `wayland` on Arch, `libwayland-client` on Fedora). If youre on X11 this shouldnt come up, so check your session type.

### `libwayland-client.so.0 has no <symbol> (older than 1.20?)`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` line [874](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L874)

The wayland library was found but its missing the function `<symbol>`, which goome needs. Libraries older than 1.20 usually lack `wl_proxy_marshal_flags`.

**What to do:** Update `libwayland-client` to 1.20 or newer, which any current distro ships.

### `WAYLAND_DISPLAY isnt set`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` lines [881](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L881), [1867](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1867)

`goome_open` picked the wayland backend but neither `WAYLAND_DISPLAY` nor `WAYLAND_SOCKET` is in the environment, so theres no compositor to talk to.

**What to do:** Run the app from inside your wayland session, not over plain ssh or a bare tty. Under sudo or a service, pass `WAYLAND_DISPLAY` and `XDG_RUNTIME_DIR` through.

### `cant connect to the wayland display <wayland_display>`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` lines [888](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L888), [1882](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1882)

`wl_display_connect` failed for the socket named in `<wayland_display>`. Usually the socket doesnt exist or your user cant reach it.

**What to do:** Check that `$XDG_RUNTIME_DIR/<wayland_display>` exists and is yours. Wrong `XDG_RUNTIME_DIR` after su or sudo is the usual cause.

### `the wayland display hung up on us`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` lines [892](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L892), [894](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L894), [918](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L918), [1853](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1853), [1886](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1886)

The compositor closed the connection while goome was setting up, or a round trip to it failed. `goome_open` returns this, in window mode too.

**What to do:** Try again, and check the compositor didnt crash. Its not clear from the code why a compositor would drop a fresh client, so the compositor log is the place to look.

### `this compositor has no wl_compositor or wl_shm`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` lines [893](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L893), [1887](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1887)

The compositor connected fine but didnt offer the two basic globals goome needs to draw anything. `goome_open` gives this back in overlay and window mode.

**What to do:** Thats very unusual for a normal desktop compositor. Check that youre really connecting to a full compositor and not a stripped down or nested one.

### `wayland does overlay and window mode only`

<kbd>GOOME_ENOTSUP</kbd> from `wl.c` line [909](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L909)

`goome_open` on wayland was given a mode other than `GOOME_MODE_OVERLAY` or `GOOME_MODE_WINDOW`. `GOOME_MODE_OFFSCREEN` isnt handled by this backend.

**What to do:** Use overlay or window mode for `opts.mode`. For offscreen, pick a backend that supports it.

### `this compositor has no layer-shell (zwlr_layer_shell_v1)`

<kbd>GOOME_ENOTSUP</kbd> from `wl.c` line [911](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L911)

Overlay mode on wayland needs the wlr layer-shell protocol and this compositor doesnt offer it. GNOME and its Mutter compositor are the common ones without it.

**What to do:** Use `GOOME_MODE_WINDOW` instead, or run on a compositor with layer-shell like Hyprland, Sway or KDE.

### `the compositor didnt tell me about any outputs`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` line [919](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L919)

The overlay opened but the compositor never reported a monitor, so goome has nothing to put layers on. `goome_open` returns this.

**What to do:** Check that a monitor is actually enabled and connected, then try again. Not sure what makes a compositor report zero outputs other than all of them being off or still starting up.

### `monitor <mon> is gone`

<kbd>GOOME_EGONE</kbd> from `wl.c` lines [957](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L957), [2275](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2275)

The monitor index `<mon>` doesnt match a live output any more, usually because it was unplugged or the layout changed. Shows up from the overlay commit and from `goome_capture`.

**What to do:** Re-read the monitor list with the goome monitor calls and use a current index. Drop any canvas you were holding for the old one.

### `out of memory for <n> hit rects`

<kbd>GOOME_ENOMEM</kbd> from `wl.c` line [962](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L962)

A `malloc` failed while storing the `<n>` click-through rectangles for an overlay commit.

**What to do:** Nothing the app can do about a real out of memory. If `<n>` is huge, send fewer hit rects.

### `wayland: no layer surface to take the keyboard, and the pointer cant be grabbed`

<kbd>GOOME_ENOTSUP</kbd> from `wl.c` line [1019](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1019)

`goome_grab` with on set was called but there are no live layer surfaces to give keyboard focus to, and wayland has no way to grab the pointer by itself.

**What to do:** Make sure the overlay is open and its monitors are up before grabbing. Without a layer surface theres no fallback, so skip the grab.

### `the compositor never configured the window`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` line [1854](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1854)

goome made the window and waited about 20 round trips for the compositor to send its first configure, which never came. `goome_open` in window mode returns this.

**What to do:** Check the compositors xdg-shell support is working and try again. Not sure why a compositor would stay silent here, so look at its log.

### `out of memory for the window`

<kbd>GOOME_ENOMEM</kbd> from `wl.c` line [1857](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1857)

Building the windows shared memory buffer failed right after the window was configured. This can also mean the compositor refused the shm pool.

**What to do:** If its a real out of memory theres nothing to do. Otherwise try a smaller `width` and `height`, and check `XDG_RUNTIME_DIR` is writable and has space.

### `out of memory`

<kbd>GOOME_ENOMEM</kbd> from `wl.c` line [1873](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1873)

`goome_open` in window mode couldnt allocate the window state struct.

**What to do:** Nothing the app can do, the machine is out of memory.

### `this compositor has no xdg-shell, cant make a window`

<kbd>GOOME_ENOTSUP</kbd> from `wl.c` line [1888](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1888)

Window mode needs `xdg_wm_base` and the compositor didnt list it, so goome cant make a normal window.

**What to do:** Use a compositor that supports xdg-shell, which is nearly all of them. `GOOME_MODE_OVERLAY` is the other option if it has layer-shell.

### `wayland doesnt let apps see or set where their window is`

<kbd>GOOME_ENOTSUP</kbd> from `wl.c` line [1976](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1976)

`goome_window_pos` was called on a wayland window, and the protocol hides and forbids window positions.

**What to do:** Dont rely on window position on wayland. Check for `GOOME_ENOTSUP` and skip it, or center the window by letting the compositor place it.

### `the window is hidden`

<kbd>GOOME_EGONE</kbd> from `wl.c` line [1981](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1981)

A window state change like maximize or fullscreen was asked for but the toplevel doesnt exist right now, because the window was hidden.

**What to do:** Show it again with `goome_window_show(g, 1)` first, then change its state.

### `no mouse button is down`

<kbd>GOOME_EARG</kbd> from `wl.c` line [1992](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L1992)

A window drag or resize was asked for but goome has no mouse button held or no press serial. Wayland only lets a move or resize start from a real press.

**What to do:** Call the drag from your mouse down handler while the button is still held, not later from a timer.

### `this compositor has no clipboard (wl_data_device_manager)`

<kbd>GOOME_ENOTSUP</kbd> from `wl.c` line [2060](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2060)

`goome_clipboard_set` found no `wl_data_device_manager` or data device on the compositor, so theres no clipboard to write to.

**What to do:** Use a compositor that offers the data device protocol, which normal desktops do. Nothing to change in your app.

### `wayland only lets a window set the clipboard after the user did something in it`

<kbd>GOOME_EDENIED</kbd> from `wl.c` line [2062](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2062)

`goome_clipboard_set` needs a serial from a recent click or key press in the window and goome hasnt seen one yet.

**What to do:** Set the clipboard from inside a click or key handler, after the user has interacted with the window.

### `cant make a pipe`

<kbd>GOOME_ENOMEM</kbd> from `wl.c` line [2084](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2084)

`pipe()` failed while reading the clipboard in `goome_clipboard_get`, so goome couldnt receive the data.

**What to do:** Your process is probably out of file descriptors. Close ones you dont need or raise the `ulimit -n`.

### `the app that owns the clipboard didnt answer`

<kbd>GOOME_EAGAIN</kbd> from `wl.c` line [2090](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2090)

`goome_clipboard_get` asked the app that owns the clipboard for its text and got nothing back within about 250 ms.

**What to do:** Try again. The owning app might be frozen or slow, and goome cant tell which.

### `this compositor has no wlr-screencopy`

<kbd>GOOME_ENOTSUP</kbd> from `wl.c` line [2268](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2268)

The compositor doesnt offer `zwlr_screencopy_manager_v1`, so `goome_capture` has no way to read the screen. GNOME and KDE dont ship it.

**What to do:** Use a wlroots based compositor like Sway or Hyprland, or capture some other way on this desktop.

### `lost the wayland display`

<kbd>GOOME_ENODISPLAY</kbd> from `wl.c` line [2288](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2288)

The connection to the compositor broke while goome waited for a screen grab to finish. `goome_capture` returns this.

**What to do:** The compositor probably crashed or quit, so reopen goome once its back.

### `monitor <mon> got unplugged`

<kbd>GOOME_EGONE</kbd> from `wl.c` line [2290](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2290)

The output for `<mon>` disappeared in the middle of a `goome_capture`.

**What to do:** Refresh your monitor list and grab again with a current index.

### `<name> never sent a frame (asleep?)`

<kbd>GOOME_EAGAIN</kbd> from `wl.c` line [2294](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2294)

`goome_capture` asked output `<name>` for a frame and nothing came within 600 ms. Most often the screen is off or asleep.

**What to do:** Wake the display and try again, retrying a bit later works too.

### `<name> only offers screen formats i cant read:<list>`

<kbd>GOOME_ENOTSUP</kbd> from `wl.c` line [2304](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2304)

The compositor offered only pixel formats for output `<name>` that goome cant convert, and `<list>` shows which ones.

**What to do:** Not much to do from your app. If `<list>` is a common format, tell me so I can add it.

### `the compositor wont let me grab <name>`

<kbd>GOOME_EDENIED</kbd> from `wl.c` line [2306](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2306)

The screencopy frame for `<name>` failed. goome also uses this when it couldnt make the shared buffer for the frame, so I cant say which from the error alone.

**What to do:** Try again. Some compositors refuse protected or hidden outputs, so check their settings and log.

### `out of memory for a <w>x<h> grab`

<kbd>GOOME_ENOMEM</kbd> from `wl.c` lines [2308](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2308), [2315](https://github.com/goome-ui/c-goome/blob/main/src/wl.c#L2315)

`malloc` failed for the pixel buffer of a `<w>x<h>` `goome_capture`, or the output reported a zero size.

**What to do:** If it really is out of memory theres nothing to do. Grab a smaller region instead of the whole screen.

## GNOME and the portal

Screen capture on GNOME (straight through mutter) and on KDE and the others (through the xdg-desktop-portal screen share popup). Both need glib and gstreamer at runtime. See [Screen capture](capture.md).

### `cant find libgio-2.0.so.0 / libglib-2.0.so.0`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [101](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L101)

Goome loads glib and gio at runtime for the dbus calls and couldnt find them, so GNOME capture is off. Comes from `goome_open` or `goome_capture`.

**What to do:** Install glib (`libglib2.0-0` on Debian and Ubuntu). Its on nearly every desktop already, so a container or minimal install is the usual reason.

### `cant find gstreamer, install libgstreamer-1.0 and libgstapp-1.0`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [105](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L105)

Goome loads GStreamer at runtime to read the screen stream and the libraries arent there. Comes from `goome_open` on the mutter or portal backend.

**What to do:** Install `libgstreamer1.0-0` and `libgstreamer-plugins-base1.0-0`, plus `gstreamer1.0-pipewire` so the stream itself can be read.

### `<name> is missing from glib or gstreamer`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [112](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L112)

A glib or GStreamer library loaded fine but is missing the function `<name>` that goome needs, which means the version is too old or odd. Comes from `goome_open`.

**What to do:** Update glib and GStreamer to a current release from your distro. If you are on a custom build, check its the full library and not a stripped one.

### `cant reach the session bus: <reason>`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [150](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L150)

Goome couldnt connect to the dbus session bus, and `<reason>` is what glib said. Comes from `goome_open`.

**What to do:** Run the app inside your desktop session, not over plain ssh or from a service. If you need to, set `DBUS_SESSION_BUS_ADDRESS` and `XDG_RUNTIME_DIR` to the ones from your session.

### `<method> failed: <reason>`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [163](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L163)

A dbus call to mutter (`GetCurrentState`, `CreateSession`, `RecordMonitor`, `Start`) or to the portal came back with an error, and `<method>` is the call that failed. It comes out of `goome_open` or `goome_capture` while goome sets up the screen capture, and `<reason>` is whatever dbus said.

**What to do:** Read the `<reason>` text, its usually something like a service not running or access denied. Check that you are in a normal GNOME session with a session bus (`DBUS_SESSION_BUS_ADDRESS` set) and that `xdg-desktop-portal` and `xdg-desktop-portal-gnome` are running.

### `cant start gstreamer: <reason> (is gstreamer1.0-pipewire installed?)`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [232](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L232)

GStreamer refused to build the capture pipeline that reads the screen stream from PipeWire. Nearly always the `pipewiresrc` element is missing, and `goome_open` or `goome_capture` gives this back.

**What to do:** Install `gstreamer1.0-pipewire` (plus `gstreamer1.0-plugins-base` for `videoconvert` and `videorate`). If its installed, the `<reason>` text says which element GStreamer couldnt find.

### `gstreamer wont play the stream for <stream>`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [239](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L239)

The pipeline got built but GStreamer wouldnt switch it to playing for that screen, so goome has no frames from it. `<stream>` is the monitor connector name, or `screen 1` style when the portal is used.

**What to do:** Not sure what makes it refuse here, goome doesnt get a reason from GStreamer. Check that `pipewire` and `wireplumber` are running, then try again, or try the other capture backend.

### `mutter says no monitor is on`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [274](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L274)

GNOME asked mutter for the monitor list and not one of them has a current mode, so every screen is off or unplugged. Comes from `goome_open` on the mutter backend.

**What to do:** Turn a display on (wake the screen or plug one in) and call `goome_open` again. If you are on a headless box there is nothing to capture.

### `the screen sharing portal never answered <method>`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [347](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L347)

Goome sent `<method>` to the screen sharing portal and no reply showed up before the timeout. 30 seconds for `CreateSession` and `SelectSources`, 5 minutes for `Start` since a person has to click the popup. It ends up in `goome_open` or later in `goome_capture` if the stream restarts.

**What to do:** Look for a portal popup that is still open or hidden behind a window and answer it. If there isnt one, restart `xdg-desktop-portal` and `xdg-desktop-portal-gnome` and try again.

### `screen sharing was turned down in the portal popup`

<kbd>GOOME_EDENIED</kbd> from `gnome.c` line [353](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L353)

You (or whoever sat at the machine) clicked cancel on the GNOME screen sharing popup, so the portal said no. Comes out of `goome_open`, and `goome_capture` if the stream had to restart.

**What to do:** Call `goome_open` again and click Share this time. Goome keeps a restore token in its state dir so after the first yes the popup usually doesnt come back.

### `the screen sharing portal gave up on <method> (code <n>)`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [354](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L354)

The portal answered `<method>` with a response that wasnt a yes and wasnt the user cancelling, and `<n>` is the response code (2 means it ended some other way). Comes from `goome_open` or `goome_capture`.

**What to do:** Not sure what makes the portal do this, it doesnt say why. Check that `xdg-desktop-portal-gnome` is installed and running, then retry. Deleting the saved `portal-token` file in goomes state dir is worth a try if it keeps happening.

### `no screencast portal, is xdg-desktop-portal running?`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [384](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L384)

Goome asked `org.freedesktop.portal.Desktop` for its ScreenCast version and got nothing back, so there is no screencast portal on the session bus. Comes from `goome_open`.

**What to do:** Install and start `xdg-desktop-portal` and `xdg-desktop-portal-gnome`, then log in again so the service is on your session bus.

### `the portal made no screencast session`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [409](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L409)

The portal said yes to `CreateSession` but its reply had no session handle, so goome has nothing to attach the capture to. Comes from `goome_open`.

**What to do:** Not sure why a portal would do that, it should always give a handle. Update `xdg-desktop-portal` and `xdg-desktop-portal-gnome`, restart them, and retry.

### `the portal shared no screens`

<kbd>GOOME_EDENIED</kbd> from `gnome.c` line [470](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L470)

The portal finished the share but the stream list was empty, so nothing was picked. That happens when the popup closes with no monitor selected. Comes from `goome_open`.

**What to do:** Open again and pick a screen in the popup before you hit Share. If the saved choice is stale, delete `portal-token` in goomes state dir so it asks fresh.

### `OpenPipeWireRemote failed: <reason>`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [477](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L477)

The portal wouldnt hand over a PipeWire connection for the screencast session, and `<reason>` is the dbus error. Comes from `goome_open`.

**What to do:** Check that `pipewire` is running (`systemctl --user status pipewire`) and that `xdg-desktop-portal` is up to date. Then try again.

### `the portal gave no pipewire connection`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [488](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L488)

The portal replied to `OpenPipeWireRemote` but no usable file descriptor came with it, so goome cant talk to PipeWire. Comes from `goome_open`.

**What to do:** Restart `pipewire` and `xdg-desktop-portal` and open again. Not sure what causes it beyond a broken portal install.

### `mutter never sent a pipewire stream`

<kbd>GOOME_ENOTSUP</kbd> from `gnome.c` line [523](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L523)

Goome started the mutter screencast session and waited 5 seconds for it to announce a PipeWire node for every monitor, and at least one never did. Comes from `goome_open`.

**What to do:** Check that `pipewire` is running and not stuck, then retry. Switching to the portal backend is the other thing to try.

### `the screen streams are restarting`

<kbd>GOOME_EAGAIN</kbd> from `gnome.c` lines [657](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L657), [661](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L661)

The monitors changed (plugged, unplugged, resolution) or a stream just died, so goome is rebuilding the capture and cant give a frame right now. `goome_capture` returns this and its temporary.

**What to do:** Just call `goome_capture` again a moment later. Goome retries in the background, it usually takes under a second or a few.

### `no screen stream covers monitor <mon> (<name>)`

<kbd>GOOME_EGONE</kbd> from `gnome.c` line [662](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L662)

Goome has capture streams running but none of them overlaps the area of monitor `<mon>` (called `<name>`). Comes from `goome_capture`.

**What to do:** If you just changed your monitors, wait and call again. With the portal backend, make sure you picked that screen in the share popup, and delete `portal-token` in goomes state dir to be asked again.

### `no frame from <stream> yet`

<kbd>GOOME_EAGAIN</kbd> from `gnome.c` line [666](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L666)

The stream for `<stream>` is running but hasnt delivered its first frame, after a wait of about 20 ms. `goome_capture` gives this back, most often right after `goome_open`.

**What to do:** Call `goome_capture` again. If it never goes away, the screen may not be changing (some compositors only send frames when something moves) or PipeWire is stuck.

### `that rect is too small to grab`

<kbd>GOOME_EARG</kbd> from `gnome.c` line [675](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L675)

The rect you passed to `goome_capture` ends up with no pixels once its mapped onto the monitor stream and clipped to the screen edges. That means a zero size rect or one fully off the monitor.

**What to do:** Pass a rect that is at least a pixel wide and tall and sits inside the monitor area.

### `no memory for a <w>x<h> grab`

<kbd>GOOME_ENOMEM</kbd> from `gnome.c` line [679](https://github.com/goome-ui/c-goome/blob/main/src/gnome.c#L679)

Goome couldnt allocate the buffer for a `<w>`x`<h>` capture. This comes from `goome_capture` and means the machine is really out of memory or the rect is huge.

**What to do:** Grab a smaller rect or free up memory. Theres nothing else the app can do.

## Windows

Windows 10 and 11. Where theres an `(error <error>)` on the end its the `GetLastError` number, look it up in the Windows system error codes list if the text here isnt enough.

### `win32 does overlay and window mode`

<kbd>GOOME_ENOTSUP</kbd> from `win32.c` line [571](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L571)

`goome_open` on Windows only knows `GOOME_MODE_OVERLAY` and `GOOME_MODE_WINDOW`, and you passed some other mode.

**What to do:** Pick one of those two modes in the options you hand to `goome_open`.

### `cant load gdi32.dll`

<kbd>GOOME_ENODISPLAY</kbd> from `win32.c` lines [574](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L574), [1296](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1296)

goome loads `gdi32.dll` itself to draw, and Windows wouldnt give it to us when `goome_open` ran in overlay or window mode. This is rare and usually means a badly broken or stripped down Windows install.

**What to do:** Check the machine is a normal desktop Windows and that `C:\Windows\System32\gdi32.dll` exists. Running `sfc /scannow` can fix a damaged system.

### `cant register the overlay window class (error <error>)`

<kbd>GOOME_ENODISPLAY</kbd> from `win32.c` line [602](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L602)

`goome_open` in overlay mode asked Windows to register its `goome_overlay` window class and Windows said no. `<error>` is the Win32 `GetLastError` number.

**What to do:** Look the number up to see why. Most often a leftover class from a crashed run in the same process or a locked down session, so restart the app.

### `windows says there are no monitors`

<kbd>GOOME_ENODISPLAY</kbd> from `win32.c` line [610](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L610)

`goome_open` in overlay mode asked Windows for the monitor list and got nothing back. Usually its a session with no display attached, like a service or a remote session that isnt active.

**What to do:** Run the app in a normal logged in desktop session with a screen on.

### `cant make the overlay window on <name> (error <error>)`

<kbd>GOOME_ENODISPLAY</kbd> from `win32.c` line [615](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L615)

`goome_open` made the overlay window for monitor `<name>` and `CreateWindowEx` failed. `<error>` is the Win32 error number.

**What to do:** Look up the error number. Out of window handles or a restricted desktop are the usual reasons, so close some apps or run on the normal desktop.

### `no memory for <n> hit rects`

<kbd>GOOME_ENOMEM</kbd> from `win32.c` lines [689](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L689), [1432](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1432)

goome couldnt grow its list of `<n>` click-through hit rects while committing a frame, so the overlay or transparent window didnt update.

**What to do:** Thats a real out of memory, nothing the app can do except free some RAM. If `<n>` is huge, pass fewer hit rects.

### `windows wont hand us the keyboard right now (focus lock), click the overlay first`

<kbd>GOOME_EDENIED</kbd> from `win32.c` line [786](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L786)

Asking for the keyboard (`goome_keyboard` or a pointer grab that needs it) made goome call `SetForegroundWindow`, and Windows refused because another app owns the foreground focus lock.

**What to do:** Have the user click the overlay first so it gets focus, then ask for the keyboard again. Doing it from a click or hotkey handler works best.

### `no overlay window to hold the pointer`

<kbd>GOOME_EDENIED</kbd> from `win32.c` line [814](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L814)

A pointer grab was asked for but goome couldnt find an overlay window to capture the mouse with, so there was nothing to hold it.

**What to do:** Grab the pointer while the overlay is visible, like inside a click handler on it. Make sure `goome_open` succeeded first.

### `another app already has the hotkey with id <id>`

<kbd>GOOME_EDENIED</kbd> from `win32.c` lines [863](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L863), [1519](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1519)

`goome_hotkey` couldnt register the hotkey with id `<id>` because Windows says another app already took that key combo. If several failed, this names the last one.

**What to do:** Pick a different key or modifiers for that hotkey, or close the other app. Adding `GOOME_SHIFT` or `GOOME_CTRL` often gets around a clash.

### `the key for hotkey id <id> isnt on this keyboard`

<kbd>GOOME_EDENIED</kbd> from `win32.c` lines [863](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L863), [1519](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1519)

`goome_hotkey` couldnt turn the key for hotkey id `<id>` into a Windows virtual key, because the current keyboard layout has no such key. If several failed, this names the last one.

**What to do:** Use a key that exists on every layout, like a letter, a digit or an F key. Or check the layout the user has active.

### `cant turn that text into utf-16`

<kbd>GOOME_EARG</kbd> from `win32.c` line [951](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L951)

Windows wouldnt convert the text you gave `goome_clipboard_set` from utf-8 to utf-16, which usually means the string isnt valid utf-8.

**What to do:** Pass valid utf-8 text. If it comes from a file or bytes, clean or re-encode it first.

### `no memory for the clipboard`

<kbd>GOOME_ENOMEM</kbd> from `win32.c` lines [953](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L953), [963](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L963), [1003](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1003)

goome ran out of memory building or reading the clipboard text, in `goome_clipboard_set` or `goome_clipboard_get`.

**What to do:** Thats a real out of memory, nothing the app can do except free some RAM or use less text.

### `another app has the clipboard open`

<kbd>GOOME_EAGAIN</kbd> from `win32.c` lines [973](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L973), [988](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L988)

The clipboard was held open by another app and still was after goome retried for about 100 ms, so `goome_clipboard_set` or `goome_clipboard_get` gave up.

**What to do:** Just try the call again in a moment. Clipboard managers and remote desktop tools hold it open a lot.

### `windows wont take the clipboard text (error <error>)`

<kbd>GOOME_EDENIED</kbd> from `win32.c` line [979](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L979)

`goome_clipboard_set` opened the clipboard but `SetClipboardData` failed. `<error>` is the Win32 error number.

**What to do:** Look up the error number. Its rare, retrying once usually works, and a clipboard tool grabbing it at the same time can cause it.

### `cant register the window class (error <error>)`

<kbd>GOOME_ENODISPLAY</kbd> from `win32.c` line [1315](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1315)

`goome_open` in window mode asked Windows to register its `goome_window` class and Windows said no. `<error>` is the Win32 `GetLastError` number.

**What to do:** Look the number up to see why. Restarting the app clears a leftover class, and a locked down session can also block it.

### `no memory for the window`

<kbd>GOOME_ENOMEM</kbd> from `win32.c` line [1343](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1343)

`goome_open` in window mode couldnt allocate its window state.

**What to do:** Thats a real out of memory, nothing the app can do except free some RAM.

### `cant make the window (error <error>)`

<kbd>GOOME_ENODISPLAY</kbd> from `win32.c` line [1357](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1357)

`goome_open` in window mode failed at `CreateWindowEx`, or at making the device context it draws with. `<error>` is the Win32 error number, and it may be 0 if the device context was the problem.

**What to do:** Look up the error number. Out of GDI or window handles is the usual cause, so close other apps or check for a handle leak in yours.

### `cant make a <w>x<h> bitmap for the window`

<kbd>GOOME_ENOMEM</kbd> from `win32.c` line [1379](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1379)

`goome_open` in window mode couldnt make the `<w>x<h>` pixel buffer for the window, or Windows reported no monitors. Most likely the size is too big for memory, or the options have a bad width or height.

**What to do:** Use a smaller `width` and `height` in the options, and check there is a monitor on the session.

### `windows wont hand us the keyboard right now (focus lock)`

<kbd>GOOME_EDENIED</kbd> from `win32.c` line [1488](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1488)

Asking for the keyboard in window mode made goome call `SetForegroundWindow` and Windows refused because another app holds the focus lock.

**What to do:** Have the user click the window first, then ask again. Calling it from a click or key handler works best.

### `edges <edges> dont make a side or a corner`

<kbd>GOOME_EARG</kbd> from `win32.c` line [1578](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1578)

`goome_window_drag` got an `<edges>` value that isnt a single side or a corner, like left and right together.

**What to do:** Pass 0 to move the window, or one side or a corner like left, top or bottom-right as edge flags.

### `this window isnt resizable`

<kbd>GOOME_ENOTSUP</kbd> from `win32.c` line [1579](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1579)

`goome_window_drag` was asked to resize by an edge but the window was opened without the resizable flag.

**What to do:** Open it with `GOOME_WINDOW_RESIZABLE`, or pass edges 0 to move it instead.

### `the left button isnt down anymore`

<kbd>GOOME_EAGAIN</kbd> from `win32.c` line [1580](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1580)

`goome_window_drag` needs the left mouse button held, and it was already released by the time the call ran.

**What to do:** Start the drag from the mouse down event right away and dont wait. If it fails, just skip it, the user let go.

### `the window is gone`

<kbd>GOOME_EGONE</kbd> from `win32.c` lines [1610](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1610), [1617](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1617)

`goome_window_*` asked Windows for the window position and the window handle was dead, so the window was already destroyed.

**What to do:** Dont use the window after closing it or after the user shut it. Check for the close event first.

### `win32 cant do window op <op>`

<kbd>GOOME_ENOTSUP</kbd> from `win32.c` line [1639](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1639)

A window call reached goome for an operation number `<op>` that the win32 window backend doesnt handle.

**What to do:** Use only the documented `goome_window_*` calls. If you did, its a goome bug, so please report it with the op number.

### `that rect is off the window`

<kbd>GOOME_EARG</kbd> from `win32.c` line [1689](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1689)

`goome_capture` with a rect that lands completely outside the window, so there was nothing to grab. Its checked after clamping to the window size.

**What to do:** Pass a rect that overlaps the window, in window coordinates.

### `cant make a <w>x<h> bitmap to grab into`

<kbd>GOOME_ENOMEM</kbd> from `win32.c` line [1698](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1698)

`goome_capture` couldnt make the `<w>x<h>` pixel buffer it copies the screen into for the window.

**What to do:** Thats usually a real out of memory or out of GDI handles. Free some, or use a smaller window.

### `BitBlt from the screen failed (error <error>, locked or secure desktop?)`

<kbd>GOOME_EDENIED</kbd> from `win32.c` line [1709](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1709)

`goome_capture` of a window failed in `BitBlt` copying from the screen. Usually the desktop is locked or showing UAC or the secure desktop, where Windows blocks grabs.

**What to do:** Unlock the desktop and try again, theres no way around the secure desktop. If not, check the Win32 `<error>` number.

### `the window isnt open`

<kbd>GOOME_ENOTSUP</kbd> from `win32.c` line [1747](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1747)

`goome_capture` was started in window mode before the window had been opened with `goome_open`.

**What to do:** Call `goome_open` first and check it worked, then open capture.

### `win32 capture needs the win32 overlay open`

<kbd>GOOME_ENOTSUP</kbd> from `win32.c` line [1748](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1748)

`goome_capture` was started in overlay mode without the win32 overlay open, so the gdi library goome copies the screen with wasnt loaded.

**What to do:** Call `goome_open` in overlay mode and check it succeeded before capturing, and use the same mode for both.

### `no monitor <mon>`

<kbd>GOOME_EGONE</kbd> from `win32.c` line [1755](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1755)

`goome_capture` was asked for monitor `<mon>` and theres no such monitor index, maybe one got unplugged.

**What to do:** Use an index below the monitor count you get from goome. Recheck after a monitor change.

### `that rect is off monitor <mon>`

<kbd>GOOME_EARG</kbd> from `win32.c` line [1764](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1764)

`goome_capture` was given a rect that sits completely outside monitor `<mon>`, so there was nothing to grab.

**What to do:** Pass a rect inside that monitors area, in the same coordinates the overlay uses.

### `cant make a <w>x<h> bitmap to grab <name> into`

<kbd>GOOME_ENOMEM</kbd> from `win32.c` line [1770](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1770)

`goome_capture` couldnt make the `<w>x<h>` pixel buffer to copy monitor `<name>` into.

**What to do:** Thats usually a real out of memory or out of GDI handles. Free some, nothing else the app can do.

### `BitBlt from the screen failed on <name> (error <error>, locked or secure desktop?)`

<kbd>GOOME_EDENIED</kbd> from `win32.c` line [1778](https://github.com/goome-ui/c-goome/blob/main/src/win32.c#L1778)

`goome_capture` of monitor `<name>` failed in `BitBlt` copying from the screen. Usually the desktop is locked or showing UAC or the secure desktop, where Windows blocks grabs.

**What to do:** Unlock the desktop and try again, theres no way around the secure desktop. If not, check the Win32 `<error>` number.

## macOS

macOS 14 and newer, through AppKit and ScreenCaptureKit.

### `cant load appkit / libobjc: <reason>`

<kbd>GOOME_ENODISPLAY</kbd> from `macos.c` line [178](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L178)

One of the system frameworks (libobjc, Foundation, CoreGraphics or AppKit) wouldnt load, and `<reason>` is what `dlerror` said. Comes from `goome_open`.

**What to do:** Run goome as a normal macOS app on a logged in desktop, not from a stripped sandbox or a headless ssh job. If `<reason>` points at a missing file, the macOS install is odd.

### `libobjc or coregraphics is missing something goome needs`

<kbd>GOOME_ENODISPLAY</kbd> from `macos.c` line [214](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L214)

The frameworks loaded but some function goome looks up at runtime isnt in them, which means the macOS version is older than goome supports. Comes from `goome_open`.

**What to do:** Update macOS. Goome says nothing about which symbol it was, so if updating isnt possible please report your macOS version.

### `macos does overlay and window mode`

<kbd>GOOME_ENOTSUP</kbd> from `macos.c` line [596](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L596)

You asked `goome_open` for a mode macOS doesnt support. Only the overlay and window modes exist here.

**What to do:** Use `GOOME_MODE_OVERLAY` or `GOOME_MODE_WINDOW` in the options,.

### `appkit only works on the main thread, call goome from main()`

<kbd>GOOME_ENOTSUP</kbd> from `macos.c` lines [601](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L601), [1300](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1300)

`goome_open` was called from a thread that isnt the main thread, and AppKit refuses to create windows anywhere else. Goome also prints a line to stderr about it.

**What to do:** Call `goome_open` from the thread that runs `main()` and keep your own work on other threads.

### `cant set up NSApplication`

<kbd>GOOME_ENODISPLAY</kbd> from `macos.c` lines [609](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L609), [1307](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1307)

Goome couldnt get the shared `NSApplication` or register its helper classes with the Objective-C runtime. Comes from `goome_open` in overlay or window mode.

**What to do:** Not sure what makes this fail, its normally a broken session with no window server. Run it from a logged in desktop session and try again.

### `macos says there are no displays`

<kbd>GOOME_ENODISPLAY</kbd> from `macos.c` line [627](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L627)

The overlay opened, but CoreGraphics returned an empty display list, so there is nothing to draw on. Comes from `goome_open` in overlay mode.

**What to do:** Make sure a screen is on and youre in a graphical login session (not ssh or a screen locked at the login window). Then open again.

### `no monitor <mon>`

<kbd>GOOME_EGONE</kbd> from `macos.c` lines [636](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L636), [950](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L950)

The monitor index `<mon>` isnt one goome knows about. Comes from `goome_capture` or from committing a canvas for a monitor that went away or never existed.

**What to do:** Use an index below the monitor count that goome reports, and re-read it after you hear a monitor change since screens can come and go.

### `the macos overlay isnt open`

<kbd>GOOME_ENOTSUP</kbd> from `macos.c` line [846](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L846)

Screen grabs on macOS go through the overlay, and capture was opened with no overlay (or window) open before it. Comes from `goome_open` when it sets up capture.

**What to do:** Open in overlay or window mode so goome has something to attach the capture to, then capture.

### `screen grabs need macos 14 or newer`

<kbd>GOOME_ENOTSUP</kbd> from `macos.c` line [847](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L847)

Screen capture uses `SCScreenshotManager` from ScreenCaptureKit and that class isnt on your system. It needs macOS 14 Sonoma or newer. Comes from `goome_open` with capture.

**What to do:** Update to macOS 14 or newer. On older versions you can still use goome for overlays and windows, just not capture.

### `macos wont let this app record the screen: allow your terminal (or this app) in System Settings > Privacy & Security > Screen & System Audio Recording, then quit it and start again`

<kbd>GOOME_EDENIED</kbd> from `macos.c` line [851](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L851)

Screen recording permission isnt granted, so macOS blocked the capture. Permission goes to the app that launched goome, so when you run from a terminal its the terminal that needs it. Goome already triggered the system prompt once. Comes from `goome_open`.

**What to do:** Turn on your terminal or app under System Settings, Privacy & Security, Screen & System Audio Recording. Then quit it fully and start it again, macOS only picks the change up on a fresh launch.

### `screen recording got turned down (System Settings > Privacy & Security > Screen & System Audio Recording)`

<kbd>GOOME_EDENIED</kbd> from `macos.c` line [857](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L857)

ScreenCaptureKit refused to list the screens with a permission error, so screen recording is denied for this app. Comes from `goome_open`.

**What to do:** Allow the app (or your terminal) under System Settings, Privacy & Security, Screen & System Audio Recording, then restart it.

### `screencapturekit didnt list the screens (error <n>)`

<kbd>GOOME_EAGAIN</kbd> from `macos.c` line [858](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L858)

ScreenCaptureKit failed to give goome the list of screens in 5 seconds, and `<n>` is the error code (-1 is a timeout). Comes from `goome_open`.

**What to do:** Try again, it can fail right at login or while the screen is waking. If it keeps happening, the `<n>` code is the thing to search for.

### `screencapturekit doesnt know display <id>`

<kbd>GOOME_EGONE</kbd> from `macos.c` line [885](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L885)

ScreenCaptureKit doesnt list the display with id `<id>`, even after goome refreshed its list. That happens when a screen was just plugged or unplugged. Comes from `goome_capture`.

**What to do:** Wait a moment and call `goome_capture` again. If the monitor really is gone, stop grabbing from it.

### `cant set up the screenshot`

<kbd>GOOME_ENOMEM</kbd> from `macos.c` line [904](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L904)

Goome couldnt allocate the objects it needs for a screenshot request (the content filter, config or state), so the grab never started. Comes from `goome_capture`.

**What to do:** This is a real out of memory, theres nothing the app can do except free some memory.

### `screen recording got turned down`

<kbd>GOOME_EDENIED</kbd> from `macos.c` line [913](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L913)

The screenshot call came back with the screen recording permission error, so macOS blocked this grab. That can happen if you took the permission away while goome was running. Comes from `goome_capture`.

**What to do:** Allow the app (or your terminal) under System Settings, Privacy & Security, Screen & System Audio Recording, then restart it.

### `the screenshot took over 2 s`

<kbd>GOOME_EAGAIN</kbd> from `macos.c` line [914](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L914)

ScreenCaptureKit didnt hand back an image within 2 seconds, so goome gave up on that grab. Comes from `goome_capture`.

**What to do:** Call it again, this is usually a busy system or a screen waking up. If it keeps timing out, grab a smaller rect or less often.

### `the screenshot failed (error <n>)`

<kbd>GOOME_EAGAIN</kbd> from `macos.c` line [914](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L914)

ScreenCaptureKit returned an error for the screenshot, and `<n>` is its code. Comes from `goome_capture`.

**What to do:** Try the grab again, its often a screen changing mid grab. If one code keeps coming back, thats what to search for.

### `no memory for a <w>x<h> grab`

<kbd>GOOME_ENOMEM</kbd> from `macos.c` line [921](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L921)

Goome couldnt allocate the buffer for a `<w>`x`<h>` capture. Comes from `goome_capture`.

**What to do:** Grab a smaller rect or free up memory. Theres nothing else the app can do.

### `cant make a <w>x<h> bitmap`

<kbd>GOOME_ENOMEM</kbd> from `macos.c` line [932](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L932)

The screenshot came back, but goome couldnt create the CoreGraphics bitmap context of `<w>`x`<h>` to convert it to pixels. Comes from `goome_capture` and normally means the size is too big or memory is out.

**What to do:** Grab a smaller rect. If it happens on small sizes too, the machine is low on memory.

### `too many goome windows`

<kbd>GOOME_ENOMEM</kbd> from `macos.c` line [1302](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1302)

You already have the most goome windows that goome tracks open at once, so `goome_open` in window mode wont make another.

**What to do:** Close a window you dont need with `goome_close` before opening a new one.

### `no memory for the window`

<kbd>GOOME_ENOMEM</kbd> from `macos.c` line [1317](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1317)

Goome couldnt allocate its per window state, so the window mode `goome_open` failed.

**What to do:** Thats a real out of memory, theres nothing the app can do except free some.

### `cant make the NSWindow`

<kbd>GOOME_ENODISPLAY</kbd> from `macos.c` line [1334](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1334)

AppKit returned nothing when goome tried to create the `NSWindow`. Comes from `goome_open` in window mode.

**What to do:** Not sure what makes AppKit do this, its usually a session with no window server. Check youre in a normal logged in desktop session and try again.

### `cant make the window bitmap`

<kbd>GOOME_ENOMEM</kbd> from `macos.c` line [1373](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1373)

The window was created but goome couldnt size its pixel buffer, either from a lack of memory or because the width or height ended up under 1 pixel. Comes from `goome_open` in window mode.

**What to do:** Pass a real width and height in the options (at least 1) and check youre not out of memory.

### `the left button isnt down anymore`

<kbd>GOOME_EAGAIN</kbd> from `macos.c` line [1591](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1591)

You asked for a window drag or resize with `goome_window_*`, but macOS says the left mouse button is already up, so there is nothing to drag. Usually the click ended before the call ran.

**What to do:** Start the drag from the mouse down handler, while the button is still held. If you get this, just ignore it and wait for the next press.

### `this window isnt resizable`

<kbd>GOOME_ENOTSUP</kbd> from `macos.c` line [1595](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1595)

You asked for a resize drag with a `goome_window_*` call on a window that wasnt opened with `GOOME_WINDOW_RESIZABLE`.

**What to do:** Open the window with the `GOOME_WINDOW_RESIZABLE` flag, or only ask for moves.

### `macos cant do window op <op>`

<kbd>GOOME_ENOTSUP</kbd> from `macos.c` line [1615](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1615)

A `goome_window_*` call asked for an operation (number `<op>`) that the macOS window code doesnt know.

**What to do:** Use one of the window calls listed in the docs, on macOS only those are handled. Please report it if the call you used is in the docs.

### `the window isnt on any display`

<kbd>GOOME_EGONE</kbd> from `macos.c` line [1666](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1666)

To grab a window goome finds which display its center sits on, and the center isnt on any active display. Comes from `goome_capture` in window mode.

**What to do:** Move the window onto a screen and grab again. It can also happen briefly while displays are changing, so retry.

### `appkit isnt loaded`

<kbd>GOOME_ENOTSUP</kbd> from `macos.c` lines [1680](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1680), [1698](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1698)

A `goome_clipboard_*` call ran before goome loaded AppKit, which happens when nothing has been opened yet or the load failed.

**What to do:** Call `goome_open` first (it has to succeed) and then use the clipboard.

### `no NSPasteboardTypeString here`

<kbd>GOOME_ENOTSUP</kbd> from `macos.c` lines [1682](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1682), [1700](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1700)

AppKit loaded but doesnt export the plain text pasteboard type goome needs for `goome_clipboard_get` or `goome_clipboard_set`. Thats a very old or odd macOS.

**What to do:** Update macOS. Not sure how else you could hit this on a normal install.

### `that text isnt utf-8`

<kbd>GOOME_EARG</kbd> from `macos.c` line [1691](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1691)

`goome_clipboard_set` was given a string macOS couldnt read as UTF-8, so nothing was copied.

**What to do:** Pass valid UTF-8 text with a terminating zero.

### `the pasteboard didnt take it`

<kbd>GOOME_EDENIED</kbd> from `macos.c` line [1692](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1692)

macOS accepted the call but `setString:forType:` returned no, so the text wasnt put on the clipboard. From `goome_clipboard_set`.

**What to do:** Try again. Not sure why the pasteboard says no, it can happen if another app is holding it or the session is locked.

### `no memory for the clipboard`

<kbd>GOOME_ENOMEM</kbd> from `macos.c` line [1709](https://github.com/goome-ui/c-goome/blob/main/src/macos.c#L1709)

`goome_clipboard_get` found text on the clipboard but couldnt allocate a copy of it.

**What to do:** Thats a real out of memory, theres nothing the app can do except free some.

## Image and font loading

Image loading messages come from `goome_bitmap_error()` (`Bitmap.LastError` in C#, and in the exception message in Python and Java). Theres no `goome` handle involved, so `goome_error` wont have them.

Fonts dont have messages at all. `goome_font_load`, `goome_font_load_mem` and `goome_font_system` give back `NULL` when the file cant be opened, is over 64 MB, isnt a font goome can read (.ttf, .otf and .ttc work), or for `goome_font_system` when fontconfig (`libfontconfig.so.1`) isnt there or has nothing that matches. Check the path first, then try the file in a font viewer.

### `image size out of range`

<kbd>GOOME_EARG</kbd> from `image.c` line [53](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L53)

A decoder asked for a bitmap with a width or height of 0 or more than 16384 pixels, so `goome_bitmap_load` or `goome_bitmap_load_mem` refused to allocate it.

**What to do:** The file is probably lying about its size. Open it in an image editor, shrink it to 16384 pixels or less per side and save it again.

### `out of memory`

<kbd>GOOME_ENOMEM</kbd> from `image.c` lines [55](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L55), [441](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L441), [503](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L503), [858](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L858), [878](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L878), [1091](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1091)

`malloc` or `calloc` failed while goome was loading the image, either for the file buffer, the pixel buffer or a decoder work buffer. Big images need a lot, a 16384 by 16384 one is 1 GB of pixels alone.

**What to do:** Nothing goome can do about a real out of memory. Free some RAM or load a smaller image, and scale huge files down before loading.

### `png has no header`

<kbd>GOOME_EARG</kbd> from `image.c` lines [406](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L406), [454](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L454)

The png has its signature but the first chunk isnt a proper `IHDR` (or its shorter than 13 bytes), or no `IHDR` showed up at all. Comes back from `goome_bitmap_load` or `goome_bitmap_load_mem`.

**What to do:** The file is damaged or isnt really a png. Open and export it again from an image editor, or convert it with `convert in.png out.png`.

### `png size out of range`

<kbd>GOOME_EARG</kbd> from `image.c` line [412](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L412)

The png header says the width or height is 0 or bigger than 16384, which goome wont decode.

**What to do:** Resize the image to 16384 pixels or less on each side. If the size looks absurd for your file, the header is damaged, so export it again.

### `png header has a bad color type or depth`

<kbd>GOOME_EARG</kbd> from `image.c` line [426](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L426)

The `IHDR` has a color type and bit depth combo that png doesnt allow, or non zero compression/filter bytes, or an interlace value above 1.

**What to do:** The file is broken or was written by a buggy tool. Export it again as a normal 8 bit png from an image editor.

### `png palette missing`

<kbd>GOOME_EARG</kbd> from `image.c` line [458](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L458)

The png says it is a palette image (color type 3) but never has a `PLTE` chunk, so goome has no colors to look up.

**What to do:** Re-save the image from an editor, or convert it to a plain RGB png so it doesnt need a palette.

### `png has no image data`

<kbd>GOOME_EARG</kbd> from `image.c` line [462](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L462)

The png header was fine but there is no `IDAT` data (or its basically empty) after it, so theres no pixels to read. Often a file that got cut off while copying or downloading.

**What to do:** Download or copy the file again and compare its size. If its really like that, export the image again.

### `png too big to decode`

<kbd>GOOME_ENOMEM</kbd> from `image.c` line [483](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L483)

The unpacked pixel data of this png would be over 2 GB, so goome gives up before it tries. Large interlaced images get there fast.

**What to do:** Scale the image down in an editor and save it again. Theres no setting to raise the limit.

### `png data is not zlib`

<kbd>GOOME_EARG</kbd> from `image.c` line [487](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L487)

The `IDAT` data doesnt start with a valid zlib header (wrong method, window size or it asks for a preset dictionary), so it cant be unpacked.

**What to do:** The png is damaged or made by a weird encoder. Open it in an image editor and export it again, or run it through `optipng` or `pngcrush`.

### `png data is corrupt or cut off`

<kbd>GOOME_EARG</kbd> from `image.c` line [495](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L495)

Unpacking the png pixel data ran out of input or hit invalid compressed data before it got all the rows. Usually a truncated download or a damaged file.

**What to do:** Get a fresh copy of the file. If the original is the same, export the png again from an editor.

### `png has a bad filter type`

<kbd>GOOME_EARG</kbd> from `image.c` line [511](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L511)

One of the png rows uses a filter byte above 4, which isnt a real png filter. The compressed data decoded but the content is garbage.

**What to do:** The file is corrupt. Replace it with a good copy or export it again from an image editor.

### `jpeg is too short for its size`

<kbd>GOOME_EARG</kbd> from `image.c` lines [873](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L873), [995](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L995)

The jpeg header claims far more image than the file has bytes to hold, so goome stops before allocating buffers. Normally a truncated file or a header with a bogus size.

**What to do:** Get the file again in full. If it still fails, open it in an editor that can recover it and save a new jpeg, or convert it to png.

### `progressive jpeg too big to decode`

<kbd>GOOME_ENOMEM</kbd> from `image.c` line [874](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L874)

This is a progressive jpeg and storing all its coefficients would take more than goome allows, so it wont decode it.

**What to do:** Save it as a baseline (non progressive) jpeg or shrink it in an editor. Converting to png also works.

### `jpeg scan before frame`

<kbd>GOOME_EARG</kbd> from `image.c` line [903](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L903)

The jpeg has a scan (`SOS` marker) before any frame header (`SOF`), so goome doesnt know the size or components yet. Thats not a valid order.

**What to do:** The file is damaged or hand edited. Export it again from an image editor.

### `jpeg scan header cut off`

<kbd>GOOME_EARG</kbd> from `image.c` line [904](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L904)

The jpeg scan header segment is empty, so the file ends in the middle of it.

**What to do:** Likely a truncated file. Fetch it again, or open and re-save it in an image editor.

### `jpeg scan header is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [906](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L906)

The scan header has a component count outside 1 to 4, or its shorter than that count needs.

**What to do:** The jpeg is corrupt. Re-export it from an editor, or convert to png and load that.

### `jpeg scan uses a missing component`

<kbd>GOOME_EARG</kbd> from `image.c` line [911](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L911)

A scan points at a component id that the frame header never defined. goome cant tell which color channel it belongs to.

**What to do:** The file is broken or from a strange encoder. Re-save it in an image editor to get a clean jpeg.

### `jpeg scan repeats a component`

<kbd>GOOME_EARG</kbd> from `image.c` line [913](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L913)

The same color component is listed twice in one scan header, which jpeg doesnt allow.

**What to do:** The file is corrupt. Export it again from an editor or convert it to png.

### `jpeg progressive scan is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [922](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L922)

A scan in this progressive jpeg has spectral selection or successive approximation values that dont make sense (like a bad start/end band or refinement bits).

**What to do:** The jpeg is damaged or made by a buggy encoder. Re-export it as baseline jpeg or png.

### `jpeg huffman table missing`

<kbd>GOOME_EARG</kbd> from `image.c` line [930](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L930)

A scan needs a huffman table that no `DHT` segment ever defined, so goome cant decode the compressed data.

**What to do:** Some odd jpegs (like old mjpeg frames) rely on default tables and goome doesnt supply them. Re-save the image from an editor so the tables get written.

### `jpeg quant table missing`

<kbd>GOOME_EARG</kbd> from `image.c` line [931](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L931)

A scan uses a quantization table that no `DQT` segment defined, so the values cant be scaled back.

**What to do:** The file is incomplete or damaged. Re-save it from an image editor or convert to png.

### `jpeg mcu too big`

<kbd>GOOME_EARG</kbd> from `image.c` line [937](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L937)

The jpeg has a block layout where one MCU holds more than 10 blocks across its components, which the spec doesnt allow.

**What to do:** The sampling factors in the header are wrong, so the file is broken. Export it again from an editor.

### `jpeg has two frames`

<kbd>GOOME_EARG</kbd> from `image.c` line [969](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L969)

The jpeg has a second frame header (`SOF`) after the first one. goome only handles a single frame per file.

**What to do:** Re-save the image from an editor to get a plain single frame jpeg. A file thats several images glued together needs to be split first.

### `jpeg frame header cut off`

<kbd>GOOME_EARG</kbd> from `image.c` line [970](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L970)

The jpeg frame header is shorter than the 6 bytes it needs at the minimum, so the file ends or is damaged there.

**What to do:** Download or copy it again. If its still the same, re-export the image.

### `only 8 bit jpeg is supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [971](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L971)

The jpeg uses a sample precision other than 8 bits, like a 12 bit medical or scientific jpeg, and goome only decodes 8 bit.

**What to do:** Convert it to an 8 bit jpeg or a png with an image tool such as `convert in.jpg -depth 8 out.png`.

### `jpeg with the height in a dnl marker is not supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [973](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L973)

The jpeg header has a height of 0, which means the real height comes later in a `DNL` marker. goome doesnt read that.

**What to do:** Re-save it from an image editor so the height is in the normal header. Its a rare format so most editors will fix it just by opening and exporting.

### `jpeg size out of range`

<kbd>GOOME_EARG</kbd> from `image.c` line [974](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L974)

The jpeg has a width of 0, or a width or height above 16384.

**What to do:** Shrink the image in an editor and save it again. If the size shown is nonsense for the picture, the header is damaged.

### `jpeg frame header is bad`

<kbd>GOOME_EARG</kbd> from `image.c` lines [975](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L975), [980](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L980)

The frame header has a bad component count (not 1 to 4), a sampling factor outside 1 to 4, a quant table id above 3, or its too short for the components it lists.

**What to do:** The jpeg is corrupt. Open and save it again in an image editor, or convert it to png.

### `jpeg too big to decode`

<kbd>GOOME_ENOMEM</kbd> from `image.c` line [996](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L996)

The decoded planes for this jpeg would take more than 2 GB, so goome refuses.

**What to do:** Make the picture smaller before loading, with an editor or `convert in.jpg -resize 50% out.jpg`.

### `jpeg segment cut off`

<kbd>GOOME_EARG</kbd> from `image.c` line [1176](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1176)

A jpeg marker segment says its longer than whats left in the file (or shorter than its own length bytes) before any scan was read.

**What to do:** The file is truncated or damaged. Get a full copy, or export it again from an editor.

### `hierarchical jpeg is not supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` lines [1185](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1185), [1191](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1191)

The jpeg uses the hierarchical (differential) mode, which goome has no decoder for.

**What to do:** Its very rare. Open it in an image editor and save as normal jpeg or png.

### `arithmetic coded jpeg is not supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` lines [1185](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1185), [1191](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1191)

The jpeg uses arithmetic coding instead of huffman coding. goome only decodes huffman jpegs.

**What to do:** Re-save it as a standard huffman jpeg, for example with `jpegtran` or an image editor, or convert to png.

### `lossless jpeg is not supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [1188](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1188)

The file is a lossless jpeg (the old jpeg-ls style process), not the usual lossy one, and goome cant decode it.

**What to do:** Convert it to png with an image tool and load that instead.

### `jpeg huffman table is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [1199](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1199)

A huffman table segment has a bad class or id, too many codes or runs past the end of the segment, or the code lengths dont add up to a valid table.

**What to do:** The jpeg is corrupt. Export it again from an editor or convert to png.

### `jpeg quant table is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [1210](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1210)

A quantization table segment has a bad precision or id, or its shorter than the 64 values it should hold.

**What to do:** The file is damaged. Re-save it from an image editor.

### `jpeg has too many scans`

<kbd>GOOME_EARG</kbd> from `image.c` line [1221](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1221)

The jpeg has 256 or more scans, way past anything normal. A progressive jpeg usually has about 10.

**What to do:** The file is broken or built to be nasty. Re-export it from an editor or convert to png.

### `jpeg has no image data`

<kbd>GOOME_EARG</kbd> from `image.c` line [1238](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1238)

goome went through the whole jpeg and never found a frame header or a scan, so there was nothing to decode.

**What to do:** The file is empty after the header, truncated or only has metadata. Get the full file or export it again.

### `bmp cut off`

<kbd>GOOME_EARG</kbd> from `image.c` lines [1267](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1267), [1281](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1281), [1294](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1294)

The bmp ends before where its own header says the pixel data (or palette and bitfield masks) should be. Typical for a half downloaded file.

**What to do:** Get the file again. If it keeps happening, open it in an editor and save a fresh bmp or png.

### `bmp header is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [1276](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1276)

The bmp info header size is under 40 and not the old 12 byte kind, or it claims to be bigger than the file.

**What to do:** The header is damaged or the file isnt a real bmp. Export it again from an image editor, or convert it to png.

### `bmp size out of range`

<kbd>GOOME_EARG</kbd> from `image.c` line [1287](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1287)

The bmp has a width of 0 or less, a height of 0, or a size above 16384 pixels.

**What to do:** Resize the image to 16384 or less on each side and save it again. A negative width means the header is damaged.

### `rle bmp is not supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [1288](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1288)

The bmp is compressed with RLE4 or RLE8. goome only reads uncompressed and bitfield bmps.

**What to do:** Save it again as an uncompressed bmp, or just use png.

### `bmp with jpeg or png inside is not supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [1289](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1289)

This bmp has a jpeg or png stream wrapped inside it (compression type 4 or 5), which goome doesnt unwrap.

**What to do:** Open it in an image editor and export as a plain bmp, or save the picture as png or jpeg directly.

### `bmp compression is unknown`

<kbd>GOOME_EARG</kbd> from `image.c` line [1290](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1290)

The bmp compression field is a number goome doesnt know, so it cant say how the pixels are stored. Often the header is damaged.

**What to do:** Re-export the bmp from an editor, or convert it to png.

### `bmp bit depth is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [1291](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1291)

The bmp bits per pixel is something other than 1, 4, 8, 16, 24 or 32.

**What to do:** The header is damaged or its a rare format. Save it again as a 24 bit bmp or a png.

### `bmp bitfields need 16 or 32 bit`

<kbd>GOOME_EARG</kbd> from `image.c` line [1292](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1292)

The bmp has channel masks (bitfields compression) but its bit depth isnt 16 or 32, which makes no sense.

**What to do:** Re-export it from an image editor as a normal 24 bit bmp, or convert to png.

### `only binary ppm, pgm and pbm are supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [1370](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1370)

The file starts with `P1`, `P2`, `P3` or `P7`, so its a plain text netpbm or a pam. goome only reads the binary ones (`P4`, `P5`, `P6`).

**What to do:** Convert it to a binary one with `pnmtopnm` from netpbm, or just save it as png.

### `ppm header is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [1371](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1371)

goome couldnt read the width, height or maxval numbers in the netpbm header. They are missing, not numbers or too large.

**What to do:** Check the header looks like `P6 width height 255` with a whitespace between each. Re-export it from an editor if not.

### `ppm cut off`

<kbd>GOOME_EARG</kbd> from `image.c` lines [1372](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1372), [1378](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1378)

The netpbm file ends right after the header, or it has fewer pixel bytes than width times height says it needs.

**What to do:** Get the file again, or re-export it. A file missing its tail often comes from an interrupted write.

### `ppm size out of range`

<kbd>GOOME_EARG</kbd> from `image.c` line [1374](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1374)

The ppm, pgm or pbm has a width or height of 0 or above 16384.

**What to do:** Resize the image so each side is 16384 pixels or less and save it again.

### `ppm maxval is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [1375](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1375)

The maxval in the netpbm header is 0 or above 65535, which the format doesnt allow.

**What to do:** The header is wrong. Re-export the file from a tool that writes a standard 255 maxval.

### `qoi cut off`

<kbd>GOOME_EARG</kbd> from `image.c` lines [1405](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1405), [1422](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1422), [1429](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1429), [1442](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1442)

The qoi data ends too early, either before the 14 byte header or in the middle of the pixel stream before all pixels were read.

**What to do:** The file is truncated. Get it again or convert it from the source image with a qoi tool.

### `qoi size out of range`

<kbd>GOOME_EARG</kbd> from `image.c` line [1408](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1408)

The qoi header gives a width or height of 0 or above 16384.

**What to do:** Resize the original and encode it as qoi again. If the size looks silly the header is damaged.

### `qoi header is bad`

<kbd>GOOME_EARG</kbd> from `image.c` line [1409](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1409)

The qoi header says the channel count is something other than 3 or 4.

**What to do:** The file is damaged or was written by a broken encoder. Encode it again, or use png.

### `qoi is too short for its size`

<kbd>GOOME_EARG</kbd> from `image.c` line [1410](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1410)

The qoi header claims more pixels than the data could possibly hold, even if it was all runs, so goome stops early.

**What to do:** The size in the header is wrong or the file is cut. Make a new qoi from the source image.

### `no bitmap given`

<kbd>GOOME_EARG</kbd> from `image.c` lines [1459](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1459), [1492](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1492)

You passed a null `goome_bitmap *out` to `goome_bitmap_load` or `goome_bitmap_load_mem`, so theres nowhere to put the result.

**What to do:** Pass a pointer to a `goome_bitmap` you own. Its a bug in your code, not in the image.

### `no data given`

<kbd>GOOME_EARG</kbd> from `image.c` line [1461](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1461)

`goome_bitmap_load_mem` got a null `data` pointer.

**What to do:** Pass a real buffer with the file bytes in it and its length in `n`.

### `gif is not supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [1469](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1469)

The data starts with `GIF87a` or `GIF89a`, so it is a gif and goome doesnt decode those.

**What to do:** Convert it to png first, for example `convert in.gif[0] out.png` for the first frame.

### `webp is not supported`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [1470](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1470)

The data is a `RIFF`/`WEBP` file and goome has no webp decoder.

**What to do:** Convert it to png or jpeg with `dwebp` or an image editor.

### `unknown image format`

<kbd>GOOME_ENOTSUP</kbd> from `image.c` line [1471](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1471)

The first bytes dont match png, jpeg, bmp, qoi, ppm, pgm or pbm. The file might be another format like tiff or svg, or not an image at all, or empty.

**What to do:** Check what the file really is with `file name`, then convert it to png. A bad download that saved an html error page does this a lot.

### `no path given`

<kbd>GOOME_EARG</kbd> from `image.c` line [1494](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1494)

`goome_bitmap_load` got a null `path`.

**What to do:** Pass the path to the image file as a utf-8 string.

### `cant open the file`

<kbd>GOOME_EARG</kbd> from `image.c` line [1496](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1496)

`goome_bitmap_load` couldnt open the path for reading, because it doesnt exist, you dont have permission, or the path is wrong. Goome doesnt tell which one.

**What to do:** Check the path (relative paths start from the working directory of the app), and that your user can read the file.

### `file is bigger than 256 MB`

<kbd>GOOME_EARG</kbd> from `image.c` line [1504](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1504)

The file you gave `goome_bitmap_load` is over the 256 MB size limit, so goome stopped reading it.

**What to do:** Use a smaller image. If you really need a huge one, shrink it or convert it to a more compact format like png.

### `cant read the file`

<kbd>GOOME_EARG</kbd> from `image.c` line [1523](https://github.com/goome-ui/c-goome/blob/main/src/image.c#L1523)

The file opened fine but reading it hit an error partway through. Could be a directory instead of a file, a flaky drive or a network share dropping out.

**What to do:** Check the path is a regular file and copy it somewhere local to try again.

## UI kit

From the [UI kit](ui.md), these come out of `goome_error` after the frame where it happened.

### `ui style stack had <n> pushes left at ui_end`

<kbd>GOOME_EARG</kbd> from `ui.c` line [1343](https://github.com/goome-ui/c-goome/blob/main/src/ui.c#L1343)

A `goome_ui_push_*` call was never matched with a `goome_ui_pop` before `goome_ui_end`, so the frame ended with `<n>` styles still pushed. goome pops them for you and only reports this once.

**What to do:** Pair every push with a pop in the same frame, or call `goome_ui_pop` with the push count. Check early returns that skip the pop.

### `ui pop of <n> but only <n> pushed`

<kbd>GOOME_EARG</kbd> from `ui.c` line [5492](https://github.com/goome-ui/c-goome/blob/main/src/ui.c#L5492)

`goome_ui_pop` was asked to pop more styles than were pushed. The first `<n>` is what you asked for and the second is how many were there. goome only pops what exists and reports this once.

**What to do:** Count your pushes and pops, they should match. A pop after an early return or a duplicate pop is the usual cause.
