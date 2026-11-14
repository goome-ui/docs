---
title: The UI builder
---

# The UI builder <kbd>0.3</kbd>

[The builder](https://goome-ui.github.io/docs/builder/) lets you drag widgets around in your browser and copy out the C, C#, Python, Java or GDScript for it. Nothing to install and nothing gets uploaded, it all stays in your browser.

**Templates.** Project, then New from template. Theres mod menus, a game HUD, a settings window, a notes app, an inventory, a login screen and a few more. Pick one and change it, thats faster than starting empty.

**Themes.** The Theme tab has the presets, and you can change any color or size in it. Export one as a `.goome-theme.json` to use it in other projects.

**Custom elements.** The Elements tab is for your own widgets made out of shapes, like a crosshair or an item slot. They show up in the Add list next to the normal ones. Export them as `.goome-element.json`.

**Exports.** Pick C, C#, Python, Java or GDScript in the code panel, then copy it or hit Save. You get a full program that opens the overlay or app and runs your UI, not just a snippet. Java uses [java-goome](https://github.com/goome-ui/java-goome). GDScript is a script for a `GoomeView` node from [godot-goome](https://github.com/goome-ui/godot-goome), and since Godot has no desktop overlay the windows float over your game instead. Anything Godot cant do shows up as a warning in the code panel.

**Project files.** Your project saves to the browser on its own. To keep it for real or move it to another pc use Project, then Save project (`.goome.json`). Drop any of the three file types on the page to load them.

Overlay and App up top pick between an overlay and a normal [app window](window-mode.md).
