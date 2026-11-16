---
title: The UI builder
---

# The UI builder <kbd>0.3</kbd>

[The builder](https://goome-ui.github.io/docs/builder/) lets you drag widgets around in your browser and copy out the C, C#, Python, Java, GDScript, Rust, Node, Go, Zig or Lua for it. Nothing to install and nothing gets uploaded, it all stays in your browser.

**Templates.** Project, then New from template. Theres mod menus, a game HUD, a settings window, a notes app, an inventory, a login screen and a few more. Pick one and change it, thats faster than starting empty.

**Themes.** The Theme tab has the presets, and you can change any color or size in it. Export one as a `.goome-theme.json` to use it in other projects.

**Custom elements.** The Elements tab is for your own widgets made out of shapes, like a crosshair or an item slot. They show up in the Add list next to the normal ones. Export them as `.goome-element.json`.

**Exports.** Pick C, C#, Python, Java, GDScript, Rust, Node, Go, Zig or Lua in the code panel, then copy it or hit Save. You get a full program that opens the overlay or app and runs your UI, not just a snippet. Rust, Node, Go, Zig and Lua use [rust-goome](https://github.com/goome-ui/rust-goome), [node-goome](https://github.com/goome-ui/node-goome), [go-goome](https://github.com/goome-ui/go-goome), [zig-goome](https://github.com/goome-ui/zig-goome) and [lua-goome](https://github.com/goome-ui/lua-goome), each output follows that languages app template. Java uses [java-goome](https://github.com/goome-ui/java-goome). GDScript is a script for a `GoomeView` node from [godot-goome](https://github.com/goome-ui/godot-goome), and since Godot has no desktop overlay the windows float over your game instead. Anything Godot cant do shows up as a warning in the code panel.

**Project files.** Your project saves to the browser on its own. To keep it for real or move it to another pc use Project, then Save project (`.goome.json`). Drop any of the three file types on the page to load them.

Overlay and App up top pick between an overlay and a normal [app window](window-mode.md).

## Real goome preview <kbd>0.5</kbd>

The preview in the middle can be real goome now. c-goome gets built to WebAssembly (the offscreen backend plus the ui kit, no emscripten) and the builder runs your project through it, so what you see is the exact pixels goome draws on a desktop, not a CSS look-alike.

**The toggle.** The bar on top of the preview has **CSS** and **Real goome**. Real goome is the default and the builder remembers what you picked. If `goome.wasm` cant load (an old browser, or it got blocked) it stays on CSS and the button says why when you hover it.

**Try it.** In real mode you can click, drag sliders, type into inputs, open combos and menus, and the actions you set up (toast, open, set a var...) run like in the exported app. Copying from an input lands on your clipboard.

**Font.** Real goome starts with goomes built in font, since the browser cant hand it your system font. Hit **Font** and pick a .ttf, .otf or .ttc (like the one your desktop uses) to see it the way your app will look. Click the font name to go back to the built in one. The font stays in your browser, it doesnt get saved into the project.

**Moving things around is CSS only.** Dragging widgets onto the stage, **Drop exactly there** / **In line** and **Pick many** are in CSS mode. Switch to CSS to lay things out, then back to Real goome to check it. The tree, the properties panel, the Theme tab and the code panel work in both.

The Elements tab editor for custom elements still uses the CSS drawing.

The same project files work in the [OBS plugin](obs.md) <kbd>0.5</kbd>, which reads the .goome.json and draws it with goome inside OBS.
