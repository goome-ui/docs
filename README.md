<p align="center">
  <img src="assets/logo.png" alt="goome" width="120">
</p>

<h1 align="center">🫠 goome docs 🫠</h1>

<p align="center">
<b>The docs for goome, the see-through overlay and ui library, plus all its bindings.</b>
</p>

<p align="center">
  <img src="https://goome-ui.github.io/docs/assets/badges/docs-site.svg" alt="docs">
  <img src="https://img.shields.io/badge/license-GPL--3.0-1b1d22?style=flat-square" alt="GPL-3.0">
</p>

<p align="center">
  Guides and the API reference for goome. The site is at <a href="https://goome-ui.github.io/docs/">goome-ui.github.io/docs</a> but its all markdown so it works on GitHub too.<br> <br>
  A <kbd>0.5</kbd>, <kbd>0.4</kbd>, <kbd>0.3</kbd> or <kbd>0.2</kbd> next to something means it came in that version.
</p>

<p align="center">
  0.5 brought <a href="pages/start-rust.md">Rust</a>, <a href="pages/start-node.md">Node</a>, <a href="pages/start-go.md">Go</a>, <a href="pages/start-zig.md">Zig</a> and <a href="pages/start-lua.md">Lua</a>, <a href="pages/animations.md">animations</a>, <a href="pages/emoji-rtl.md">emoji and RTL</a>, <a href="pages/ime.md">IME</a>, <a href="pages/accessibility.md">screen readers</a>, the <a href="pages/obs.md">OBS plugin</a> and real goome in the builder.<br>
  0.4 brought <a href="pages/downloads.md">apps you can download</a> and <a href="pages/templates.md">templates with <code>goome new</code></a>. Theres a <a href="pages/compare.md">Compare</a> page now too.<br>
  Questions go in <a href="https://github.com/goome-ui/c-goome/discussions">Discussions</a>, and the <a href="pages/community.md">good first issues</a> are small ones if you want to help.
</p>

## Repos

- [c-goome](https://github.com/goome-ui/c-goome) - the C library, everything else is built on it
- [csharp-goome](https://github.com/goome-ui/csharp-goome) - C# bindings for .NET 8
- [python-goome](https://github.com/goome-ui/python-goome) - Python bindings over ctypes
- [java-goome](https://github.com/goome-ui/java-goome) - Java bindings and the Minecraft mods
- [godot-goome](https://github.com/goome-ui/godot-goome) - goome as a Godot 4.4+ addon
- [rust-goome](https://github.com/goome-ui/rust-goome) - Rust crates
- [node-goome](https://github.com/goome-ui/node-goome) - a Node N-API addon
- [go-goome](https://github.com/goome-ui/go-goome) - Go bindings over cgo
- [zig-goome](https://github.com/goome-ui/zig-goome) - a Zig package
- [lua-goome](https://github.com/goome-ui/lua-goome) - a Lua 5.4 / LuaJIT module
- [obs-goome](https://github.com/goome-ui/obs-goome) - the OBS Studio plugin
- [vscode-goome](https://github.com/goome-ui/vscode-goome) and [jetbrains-goome](https://github.com/goome-ui/jetbrains-goome) - the editor extensions
- [examples](https://github.com/goome-ui/examples) - bigger example apps, one folder each, plus the apps you can [download](pages/downloads.md)
- [goome-cli](https://github.com/goome-ui/goome-cli) - `goome new`, makes a project from one of the `goome-app-template-*` repos
- [UI builder](https://goome-ui.github.io/docs/builder/) - drag a UI together in your browser and copy the code, source is in [builder/](builder/)

## Index

- **Start**
  - [Home](pages/index.md)
  - [Versions](pages/versions.md)
  - [Getting started in Java](pages/start-java.md) <kbd>0.3</kbd>
  - [Getting started in Godot](pages/start-godot.md) <kbd>0.3</kbd>
  - [Getting started in C](pages/start-c.md)
  - [Getting started in C#](pages/start-csharp.md)
  - [Getting started in Python](pages/start-python.md)
  - [Getting started in Unity](pages/start-unity.md) <kbd>0.2</kbd>
  - [Getting started in Rust](pages/start-rust.md) <kbd>0.5</kbd>
  - [Getting started in Node](pages/start-node.md) <kbd>0.5</kbd>
  - [Getting started in Go](pages/start-go.md) <kbd>0.5</kbd>
  - [Getting started in Zig](pages/start-zig.md) <kbd>0.5</kbd>
  - [Getting started in Lua](pages/start-lua.md) <kbd>0.5</kbd>
  - [Examples](pages/examples.md)
  - [Downloads](pages/downloads.md) <kbd>0.4</kbd>
  - [Templates and goome new](pages/templates.md) <kbd>0.4</kbd>
  - [Compare](pages/compare.md) <kbd>0.4</kbd>
- **Editors**
  - [Plain terminal](pages/editor-terminal.md)
  - [VS Code](pages/editor-vscode.md)
  - [Visual Studio](pages/editor-visualstudio.md)
  - [Rider](pages/editor-rider.md)
  - [CLion](pages/editor-clion.md)
  - [PyCharm](pages/editor-pycharm.md)
  - [IntelliJ IDEA](pages/editor-intellij.md) <kbd>0.3</kbd>
  - [Eclipse](pages/editor-eclipse.md) <kbd>0.3</kbd>
  - [Unity](pages/editor-unity.md) <kbd>0.2</kbd>
  - [Godot](pages/editor-godot.md) <kbd>0.3</kbd>
- **Modes**
  - [The three modes](pages/modes.md)
  - [Overlay mode](pages/overlay-mode.md)
  - [Window mode](pages/window-mode.md) <kbd>0.2</kbd>
  - [Offscreen mode](pages/offscreen-mode.md) <kbd>0.2</kbd>
- **How it works**
  - [Coords and monitors](pages/coords.md)
  - [Hit rects](pages/hit-rects.md)
  - [Frames, damage and pacing](pages/frames.md)
  - [Events](pages/events.md)
  - [Taking input from the game](pages/input-capture.md) <kbd>0.3</kbd>
  - [Typing other languages](pages/ime.md) <kbd>0.5</kbd>
- **Drawing**
  - [Shapes and clipping](pages/drawing.md)
  - [Images and fonts](pages/images-fonts.md)
  - [Emoji, fonts and RTL](pages/emoji-rtl.md) <kbd>0.5</kbd>
- **UI kit**
  - [How the ui kit works](pages/ui.md)
  - [Windows and layout](pages/ui-layout.md)
  - [Text and buttons](pages/ui-buttons.md)
  - [Checkboxes and toggles](pages/ui-switches.md)
  - [Sliders and colors](pages/ui-values.md)
  - [Inputs, combos and lists](pages/ui-text.md)
  - [Themes](pages/ui-theme.md)
  - [Themes the simple way](pages/ui-theme-easy.md) <kbd>0.3</kbd>
  - [Icons and skins](pages/ui-icons.md) <kbd>0.3</kbd>
  - [App mode and menus](pages/ui-app.md) <kbd>0.2</kbd>
  - [Keyboard and focus](pages/ui-keyboard.md) <kbd>0.2</kbd>
  - [Tables, trees and editors](pages/ui-tables.md) <kbd>0.2</kbd>
  - [Plots, drag and more](pages/ui-more.md) <kbd>0.2</kbd>
  - [Custom everything](pages/ui-custom.md) <kbd>0.3</kbd>
  - [Change anything](pages/ui-anything.md) <kbd>0.3</kbd>
  - [Animations](pages/animations.md) <kbd>0.5</kbd>
  - [Screen readers](pages/accessibility.md) <kbd>0.5</kbd>
- **UI builder**
  - [How the builder works](pages/ui-builder.md) <kbd>0.3</kbd>
  - [Open the builder](https://goome-ui.github.io/docs/builder/) <kbd>0.3</kbd>
- **Mods and engines**
  - [How mods work](pages/mods.md) <kbd>0.3</kbd>
  - [Renderer backends](pages/mods-renderers.md) <kbd>0.3</kbd>
  - [Platform backends](pages/mods-platforms.md) <kbd>0.3</kbd>
  - [Native DLL mods](pages/mods-native.md) <kbd>0.3</kbd>
  - [Unity mods](pages/mods-unity.md) <kbd>0.3</kbd>
  - [Minecraft](pages/mods-minecraft.md) <kbd>0.3</kbd>
  - [Godot](pages/mods-godot.md) <kbd>0.3</kbd>
  - [Other engines](pages/mods-engines.md) <kbd>0.3</kbd>
  - [OBS plugin](pages/obs.md) <kbd>0.5</kbd>
- **Other stuff**
  - [Screen capture](pages/capture.md)
  - [Hotkeys and the control fifo](pages/hotkeys.md)
  - [Where it works](pages/platforms.md)
  - [Testing without a screen](pages/testing.md)
  - [One file and building](pages/building.md)
  - [FAQ](pages/faq.md)
  - [Error messages](pages/errors.md) <kbd>0.4</kbd>
  - [Community](pages/community.md) <kbd>0.4</kbd>
  - [Badges](pages/badges.md) <kbd>0.4</kbd>
  - [Contributing](pages/contributing.md)
- **API reference**
  - [Open, poll and frames](pages/api-core.md)
  - [Windows and clipboard](pages/api-window.md)
  - [Capture and hotkeys](pages/api-capture.md)
  - [Input capture](pages/api-input.md)
  - [Drawing](pages/api-draw.md)
  - [Images and fonts](pages/api-images-fonts.md)
  - [UI kit](pages/api-ui.md)
  - [UI app and menus](pages/api-ui-app.md)
  - [More UI widgets](pages/api-ui-more.md)
  - [Styles and custom widgets](pages/api-ui-custom.md)
  - [Animations](pages/api-anim.md) <kbd>0.5</kbd>
  - [Typing and the IME](pages/api-ime.md) <kbd>0.5</kbd>
  - [Accessibility](pages/api-a11y.md) <kbd>0.5</kbd>
  - [Types and constants](pages/api-types.md)

The API pages are made from `goome.h` by `tools/apiref.py`, dont edit them by hand.

<details>
<summary align="center"><b>🛠 Pull Requests 🛠</b></summary>

<br>

<p align="center">
Found a typo or a sample that doesnt compile? Make A pull request to <b>dev</b>!<br>
Read <a href="CONTRIBUTING.md">CONTRIBUTING.md</a> first, it has the docs rules and how to preview the site locally.
</p>
</details>

<details>
<summary align="center"><b>⚖️ License ⚖️</b></summary>

<br>

<p align="center">
The docs are under the <a href="LICENSE">GPL-3.0</a>, same as goome.<br> <br>
<sub>
• You can use it, change it and share it<br>
• If you share something made with it, you have to share your source too, under the same license<br>
• Keep the credits
</sub><br> <br>
In short: play fair, keep it open, and give credit where it's due.
</p>
</details>

<details>
<summary align="center"><b>🩷 Donate 🩷</b></summary>

<br>

<p align="center">
<a href="https://sevvy-wevvy.com/kofi">Ko-fi</a> (Preferred)<br>
<a href="https://sevvy-wevvy.com/patreon">Patreon</a><br>
<a href="https://sevvy-wevvy.com/throne">Throne</a>
</p>
</details>

<p align="center">
<b>🫶 Contributors 🫶</b><br>
Thanks to everyone who helped out!<br> <br>
<a href="https://github.com/goome-ui/docs/graphs/contributors"><img src="https://contrib.rocks/image?repo=goome-ui/docs" alt="contributors"></a>
</p>
