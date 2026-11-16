---
title: Try it in your browser
---

# Try it in your browser <kbd>0.5.2</kbd>

Two real goome apps, running in this page. Nothing is a video and nothing is a js ui, its plain C compiled to webassembly with `goome build --web` and drawn by the same goome code you would run on a desktop. Click inside one once so it gets the keyboard.

<div class="demos">
<figure class="demo demo-game">
<iframe src="{{ '/demos/game/' | relative_url }}" title="Brickout, a breakout game made with goome" loading="lazy" allow="fullscreen"></iframe>
<figcaption><a href="{{ '/demos/game/' | relative_url }}">Open full page</a> <span>&middot;</span> <a href="https://github.com/goome-ui/c-goome/blob/dev/examples/web_game.c">View the source</a></figcaption>
</figure>
<figure class="demo demo-app">
<iframe src="{{ '/demos/app/' | relative_url }}" title="Tidy, a task list made with goome" loading="lazy" allow="fullscreen"></iframe>
<figcaption><a href="{{ '/demos/app/' | relative_url }}">Open full page</a> <span>&middot;</span> <a href="https://github.com/goome-ui/c-goome/blob/dev/examples/web_app.c">View the source</a></figcaption>
</figure>
</div>

## Brickout

A breakout game, the left one. Move the paddle with the mouse, a finger or the arrow keys (or a and d). Click, tap or space launches the ball, p or esc pauses and r starts over. Chain bricks without touching the paddle for a combo, clear the board for the next level, three lives on normal. The score, buttons, progress bar and the start, pause and game over menus are all goome ui widgets, only the field is drawn by hand with the [draw api](drawing.md).

The source is [`examples/web_game.c`](https://github.com/goome-ui/c-goome/blob/dev/examples/web_game.c), about 350 lines.

## Tidy

A little task list, the right one. Type a task and hit enter, tick them off, sort and filter the table, look at the stats tab, and flip the theme in settings (dark, light, a few presets, your own accent color). It has a menu bar, a modal that asks before it deletes things and tooltips on the buttons. Everything lives in memory, reload and it resets.

The source is [`examples/web_app.c`](https://github.com/goome-ui/c-goome/blob/dev/examples/web_app.c), about 280 lines. The widgets it uses are in [tables](ui-tables.md), [app mode and menus](ui-app.md) and [themes](ui-theme-easy.md).

Both examples are only on the `dev` branch of c-goome for now, so the links go there. They land on main with the next release.

## How it works

Each demo is one `.c` file. `goome build --web` compiles it with clang to a `.wasm`, links it against goome and a tiny libc, and puts an `index.html` and a `goome.js` next to it. The js is about 300 lines: it loads the wasm, hands it mouse, keyboard and touch events, and paints the pixels goome draws onto a canvas. No emscripten, no framework, no bundler.

A browser cant sit in a `while` loop, so the main loop is split into `goome_web_init` and `goome_web_frame`, and `main` stays for the desktop build. The same file still builds on Linux, Windows and macOS. The details are on [Run it in the browser](browser.md).

Each demo is around 300 KB (130 to 160 KB gzipped), which is the whole of goome with the ui kit and the font in it.

Build your own:

```sh
goome build --web web_game.c
goome serve web
```

The first one makes a `web` folder with the page, `goome.js` and `goome.wasm`, the second hosts it on localhost. If you would rather drag widgets around than write them, the [UI builder](https://goome-ui.github.io/docs/builder/) runs real goome in your browser too, [how it works is here](ui-builder.md).
