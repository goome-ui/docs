---
title: Getting started in Node
---

# Getting started in Node <kbd>0.5</kbd>

Node 18+. [node-goome](https://github.com/goome-ui/node-goome) is a plain N-API addon. node-gyp compiles goome.h right into `goome.node`, so theres no separate library to find at runtime. It has TypeScript types in `index.d.ts`.

To start from a project that already builds, `goome new my-app --lang node` makes one from the [Node template](https://github.com/goome-ui/goome-app-template-node), see [Templates and goome new](templates.md) <kbd>0.5.1</kbd>.

> On Windows and only want your window, with no black console box? Add `GOOME_WINDOW_NO_CONSOLE`, see [Hide the console on Windows](windows-console.md) <kbd>0.5.5</kbd>. It is off by default.

## Pick what you are making

`goome.open` is the overlay, `goome.App` a window, `goome.openOffscreen` a buffer with no window.

### Overlay on top of everything

```js
const goome = require("goome");

const g = goome.open("my overlay");
let running = true;
while (running) {
  for (const ev of g.events(16)) if (ev.type === goome.QUIT) running = false;
  g.frame(0, (c) => {
    c.roundRect(40, 40, 240, 50, 12, 0xe0202838);
    c.text(56, 56, "on top of everything", 0xffffffff);
  });
}
g.close();
```

More on [Overlay mode](overlay-mode.md).

### Make a normal app

```js
const goome = require("goome");

const app = new goome.App({ title: "My app", width: 960, height: 640 });
let clicks = 0;
app.run((ui) => {
  if (ui.button("Click me")) clicks++;
  ui.label(`clicked ${clicks} times`);
});
```

More on [Window mode](window-mode.md).

### Inside a game engine

```js
const g = goome.openOffscreen(320, 200);
g.frame(0, (c) => c.roundRect(20, 20, 280, 160, 16, 0xff6fdc5f));
const frame = g.lastFrame();
uploadTexture(frame.pixels, frame.w, frame.h);
```

`frame.pixels` is a typed array right over goomes memory, nothing gets copied. Electron doesnt allow that, so there it gets copied, `goome.zeroCopy` says which one you got. More on [Offscreen mode](offscreen-mode.md).

## Install

Its not on npm. Install the package from the [release](https://github.com/goome-ui/node-goome/releases), it has the addon already built for linux x64, windows x64 and both Macs:

```sh
npm install https://github.com/goome-ui/node-goome/releases/download/v0.5.5/goome-0.5.5.tgz
```

Or straight from git, that builds the addon with node-gyp, which needs a C compiler and Python, a few seconds once:

```sh
npm install github:goome-ui/node-goome#v0.5.5
```

- Debian / Ubuntu: `sudo apt install build-essential python3`
- Mac: `xcode-select --install`
- Windows: the "Desktop development with C++" part of Visual Studio

For one exact version see [Versions](versions.md).

## Your first overlay

```js
const goome = require("goome");

const g = goome.open("my overlay");
const pace = new goome.Pacer(60);
let running = true;
while (running) {
  for (const ev of g.events(pace.wait())) {
    if (ev.type === goome.QUIT) running = false;
    if (ev.type === goome.DOWN) console.log(`clicked at ${ev.x},${ev.y}`);
  }
  const c = g.begin(0);
  if (!c) continue;
  c.roundRect(100, 100, 200, 80, 12, 0xe0202838);
  c.text(116, 128, "click me", 0xffffffff, true);
  c.hit(100, 100, 200, 80);
  g.end(c);
}
g.close();
```

Colors are `0xAARRGGBB` numbers, positions are logical desktop coords, same as C. goome runs on your thread and never starts one, so this loop is yours and it blocks while it runs. On Mac keep it on the main thread.

## How it maps to C

Everything from goome.h is in there, just camelCase: `goome_draw_rrect` is `c.rrect`, `GOOME_WIN_MOVE` is `goome.WIN_MOVE`. Widgets dont take pointers, they hand you the new value back:

```js
volume = ui.slider("Volume", volume, 0, 1, "%.2f");
```

`ui.changed` is whether the last widget changed this frame. Begin / end pairs take a function last and call the end for you, even if your code throws:

```js
ui.window("Settings", win, goome.WIN_MOVE, () => {
  muted = ui.toggle("Muted", muted);
});
```

## Editors

**VS Code**: nothing extra needed, it already reads `index.d.ts` so you get completion and docs on every call. Hit F5 on your script with the built in Node debugger. The [goome extension](editor-vscode.md) side panel and `.goome.json` preview work here too, its snippets are only C, C#, Python and Java for now.

**WebStorm**: same, the types get picked up from the package. The [goome plugin](editor-rider.md) should load since it only needs the base platform, nobody tried it in WebStorm yet.

Set `GOOME_BACKEND=test` and `GOOME_TEST_SHOTS=shots/` in the launch config env to test without touching your screen ([Testing without a screen](testing.md)).
