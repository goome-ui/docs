---
title: Testing without a screen
---

# Testing without a screen

The test backend fakes a screen for CI, ssh, anywhere without a display. You give it a script of what the "user" does and it saves a screenshot after every frame. Its all env vars, no code changes:

```sh
GOOME_TEST_FRAMES=frames/ GOOME_TEST_SHOTS=shots/ GOOME_TEST_SCRIPT=script.txt ./myapp
```

Every screenshot on this site is from the test backend.

## The script

One step a line, keyed by frame number. `;` also works as a line break so short scripts fit in the env var.

```text
screen 1920x1080 2     # size and scale when there are no frames
3 click 400,300        # frame 3, a click
3 click 400,300 3      # same, right button
4 key hello\n          # typed, \b \e \n \t for backspace esc enter tab
5 hover 120,80         # the mouse sits there from now on
6 hold 200,200 9       # button down on frame 6, up on frame 9
7 scroll 400,300 -1    # one notch up
8 hotkey alt+h         # a grabbed combo comes back as GOOME_HOTKEY
9 send hide            # a control fifo line
10 text 日本            # an IME finished some text, GOOME_TEXT (0.5)
11 preedit にほ 6       # composing text with the caret at byte 6 (0.5)
end 12                 # GOOME_QUIT after frame 12
```

```sh
GOOME_TEST_SHOTS=shots/ GOOME_TEST_SCRIPT="screen 640x360 1; 2 click 200,120; 4 key hi; end 8" ./myapp
```

Frames count your `goome_end` calls. No `end` line means it quits after 30 frames, so it cant hang CI.

## What you get

`GOOME_TEST_SHOTS=dir/` gets a .ppm after every `goome_end`, your overlay blended over the screen.

`GOOME_TEST_FRAMES` is the fake screen, either a folder of `000000.ppm`, `000001.ppm`... (one per frame) or one .ppm that repeats. Without it you get a gradient with a grid. `goome_capture` returns these too, so grabbing code is testable.

Clicks outside your hit rects get dropped like on a real screen, and keys only come in while the keyboard is on.

Blending is integer only, so shots are byte for byte the same on Linux, Windows and Mac (goome's CI compares them). The UI kit runs on a fixed 16 ms clock here so animations land on the same pixels every run.

## From code

```c
goome *g = goome_open(&(goome_opts){
    .backend = GOOME_TEST,
    .test_script = "screen 640x360 1; 1 click 20,20; 2 key hi; end 5",
    .test_shots = "shots/",
}, NULL);
```

```csharp
using var g = new Goome(new GoomeOptions
{
    Backend = Backend.Test,
    TestScript = "screen 640x360 1; 1 click 20,20; 2 key hi; end 5",
    TestShots = "shots/",
});
```

```python
g = goome.open("test", backend="test", test_script="screen 640x360 1; 1 click 20,20; 2 key hi; end 5", test_shots="shots/")
```

```java
Goome g = Goome.open(new Options().backend(Goome.TEST)
    .testScript("screen 640x360 1; 1 click 20,20; 2 key hi; end 5")
    .testShots("shots/"));
```

`test_frames`, `test_script` and `test_shots` match the env vars (`testFrames`, `testScript` and `testShots` in Java). If you set both, the one in code wins.

## When it fails

If the test backend or offscreen mode gives you an error, the text from `goome_error` is on [Error messages](errors.md#test-and-offscreen-backends) with what it means.

## Turning shots into PNGs

With Pillow:

```sh
python3 -c "from PIL import Image; import sys; Image.open(sys.argv[1]).save(sys.argv[2])" shots/000007.ppm shot.png
```

## Checking pixels

Render, hash the shot, compare to a saved hash. Update the hash when drawing changes on purpose. c-goome's `tests/unit.c` checks every draw function like that.

## Window mode and offscreen <kbd>0.2</kbd>

It can pretend to be a window too:

```text
5 resize 800x600       # the window got resized, you get GOOME_MONITORS
6 focus 0              # lost focus, GOOME_FOCUS with id 0
7 drop 100,80 /home/me/notes.txt
8 close                # GOOME_CLOSE, like the x was clicked
```

[Offscreen mode](offscreen-mode.md) is headless anyway, just `goome_push` your input and check `goome_frame`.
