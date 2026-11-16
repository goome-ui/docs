---
title: Run it in the browser
---

# Run it in the browser <kbd>0.5.2</kbd>

A goome app can run in a web page. It gets compiled to webassembly and the page is its window, so it only works for apps, a normal window. Want to see one first? [Try a game and an app in your browser](try.md). Overlays and mod menus draw over other programs and a browser cant do that, the build says so and stops.

You need `clang` with the wasm32 target, `wasm-ld` and bash. `sudo apt install clang lld` on Debian and Ubuntu, `brew install llvm lld` on a mac (apples own clang cant do wasm), `winget install LLVM.LLVM` on windows. No emscripten.

```sh
goome build --web main.c
goome serve web
```

[goome-cli](templates.md#goome-new) makes a folder with `index.html`, `goome.js` and `goome.wasm`. Put it on any static host. `goome serve` is a small local server for trying it, it prints the address.

`goome build --web` takes the app as a file (`main.c` by default), `--out` picks the folder (`web` by default) and `--more a.c b.c` adds the other .c files of your app. `goome serve` takes `--port` (8000) and `--bind` (127.0.0.1). Without the cli it is `wasm/web-build.sh app.c outdir` in the [c-goome](https://github.com/goome-ui/c-goome/tree/main/wasm/web) repo.

## Split the loop

A browser cant wait inside a `while` loop, so the loop in `main` becomes two functions. `main` can stay for the desktop build, the web build never calls it.

```c
static goome *g;
static goome_ui *u;
static int clicks;

int goome_web_init(void)
{
    g = goome_open(&(goome_opts){.title = "Counter", .mode = GOOME_MODE_WINDOW, .width = 480, .height = 360}, NULL);
    u = g ? goome_ui_new(g) : NULL;
    return u ? 0 : 1;
}

int goome_web_frame(void)
{
    goome_event ev;
    while (goome_poll(g, &ev, 16) > 0) {
        if (ev.type == GOOME_QUIT || ev.type == GOOME_CLOSE) return 0;
        goome_ui_feed(u, &ev);
    }
    if (!goome_ui_begin(u, 0)) return 1;
    goome_ui_app(u, "Counter", GOOME_APP_TITLEBAR);
    if (goome_ui_button(u, "Click me")) clicks++;
    goome_ui_label(u, "%d clicks", clicks);
    goome_ui_app_end(u);
    goome_ui_end(u);
    return 1;
}

void goome_web_done(void)
{
    goome_ui_free(u);
    goome_close(g);
}

int main(void)
{
    if (goome_web_init()) return 1;
    while (goome_web_frame()) {
    }
    goome_web_done();
    return 0;
}
```

`goome_web_init` is the setup before the loop, return 0 when it worked. `goome_web_frame` is one trip through the loop, return 1 to keep going and 0 to quit. `goome_web_done` is optional and runs once after that. The page calls the frame function every animation frame, about 10 times a second when nothing is happening.

`goome_poll` never blocks on the web, it hands you what is queued. `goome_open` uses the size of the browser window, not the one you ask for, and you get a `GOOME_MONITORS` event when it changes, same as [window mode](window-mode.md).

## No title bar

The page already has a tab and a window around the app, so goome leaves out the title bar `goome_ui_app` draws. `GOOME_APP_TITLEBAR` is ignored and the content fills the whole canvas. The title you give `goome_open` goes in the page title. This is the `GOOME_WINDOW_NO_TITLEBAR` window flag, the web build sets it for you and you can set it on the desktop too. A bar you draw yourself with the draw api stays, skip it in your own code.

## What works

Mouse, wheel, keyboard, text typed in other languages ([IME](ime.md)), paste and copy, the cursor shape, a window that resizes and a screen with a different pixel ratio. All of it goes through `goome.js`, about 300 lines you can read and change.

## What doesnt

- A `main` that loops forever without the split above. Without asyncify or threads there is no way to pause webassembly and give the page its turn.
- Overlay mode, [capture](capture.md), global hotkeys, [grab](input-capture.md), window moving and state, dropping files, the system font (only the built in one, load a .ttf with `goome_font_load_mem`), files and sockets.
- The libc is a small one. Strings, `malloc`, `snprintf`, `strtol`, `qsort`, `math.h` and `printf` (it goes to the browser console) are there. `scanf`, `strtok`, `time` and the like fail at link time.

The `.wasm` interface is written down in [wasm/web](https://github.com/goome-ui/c-goome/tree/main/wasm/web), so the same page can run the output of other languages later.
