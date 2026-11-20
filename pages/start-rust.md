---
title: Getting started in Rust
---

# Getting started in Rust <kbd>0.5</kbd>

Rust 1.77+. [rust-goome](https://github.com/goome-ui/rust-goome) is two crates: `goome-sys` builds the C library from the vendored goome.h with the `cc` crate, and `goome` wraps it so you never touch a raw pointer.

To start from a project that already builds, `goome new my-app --lang rust` makes one from the [Rust template](https://github.com/goome-ui/goome-app-template-rust), see [Templates and goome new](templates.md) <kbd>0.5.1</kbd>. Or `cargo new` and the dependency below is all it takes.

> On Windows and only want your window, with no black console box? Add `GOOME_WINDOW_NO_CONSOLE`, see [Hide the console on Windows](windows-console.md) <kbd>0.5.5</kbd>. It is off by default.

## Pick what you are making

`Options::new().open()` is the overlay, `App::new` a window, `Goome::offscreen` a buffer with no window.

### Overlay on top of everything

```rust
use goome::{Draw, Options, QUIT};

fn main() -> goome::Result<()> {
    let mut g = Options::new().title("my overlay").open()?;
    let mut running = true;
    while running {
        for ev in g.events(16) {
            if ev.kind == QUIT {
                running = false;
            }
        }
        if let Some(mut c) = g.begin(0) {
            c.round_rect(40.0, 40.0, 240.0, 50.0, 12.0, 0xE0202838);
            c.text(56.0, 56.0, "on top of everything", 0xFFFFFFFF);
        }
    }
    Ok(())
}
```

More on [Overlay mode](overlay-mode.md).

### Make a normal app

```rust
fn main() -> goome::Result<()> {
    let mut app = goome::App::new("My app", 960, 640)?;
    let mut clicks = 0;
    while let Some(mut ui) = app.frame() {
        if ui.button("Click me") {
            clicks += 1;
        }
        ui.label(&format!("clicked {} times", clicks));
    }
    Ok(())
}
```

`app.frame()` waits for input when nothing moves, feeds the ui and gives you `None` once the window closes. More on [Window mode](window-mode.md).

### Inside a game engine

```rust
use goome::Draw;

let mut g = goome::Goome::offscreen(320, 200, 1.0)?;
if let Some(mut c) = g.begin(0) {
    c.round_rect(20.0, 20.0, 280.0, 160.0, 16.0, 0xFF6FDC5F);
}
let frame = g.last_frame()?;
upload_texture(frame.pixels(), frame.w(), frame.h());
```

`pixels()` is a `&[u32]` right on goomes memory, premultiplied BGRA. More on [Offscreen mode](offscreen-mode.md).

## Install

```toml
[dependencies]
goome = "0.5"
```

Its on [crates.io](https://crates.io/crates/goome). For the git version put the tag on a git dependency instead: `goome = { git = "https://github.com/goome-ui/rust-goome", tag = "v0.5.3" }`. The `.crate` files are on the [releases page](https://github.com/goome-ui/rust-goome/releases) too. The first build compiles goome.h with your C compiler, a few seconds once. Cargo already needs one for a lot of crates so you probably have it:

- Debian / Ubuntu: `sudo apt install build-essential`
- Mac: `xcode-select --install`
- Windows: the Visual Studio build tools, the same ones rustup asks for

Nothing gets linked on top, goome loads X11, Wayland, dbus and the rest at runtime. For one exact version see [Versions](versions.md).

## Your first overlay

```rust
use goome::{Draw, Options, Pacer, DOWN, QUIT};

fn main() -> goome::Result<()> {
    let mut g = Options::new().title("my overlay").open()?;
    let mut pace = Pacer::new(60);
    let mut running = true;
    while running {
        for ev in g.events(pace.wait()) {
            if ev.kind == QUIT {
                running = false;
            }
            if ev.kind == DOWN {
                println!("clicked at {:.0},{:.0}", ev.x, ev.y);
            }
        }
        if let Some(mut c) = g.begin(0) {
            c.round_rect(100.0, 100.0, 200.0, 80.0, 12.0, 0xE0202838);
            c.text(116.0, 128.0, "click me", 0xFFFFFFFF);
            c.hit(100, 100, 200, 80);
        }
    }
    Ok(())
}
```

The canvas gets sent when `c` drops, with the hits you added. Colors are `0xAARRGGBB` u32s, positions are logical desktop coords, same as C.

## How it maps to C

Names are the C ones without `goome_`, constants without `GOOME_` (`goome::WIN_MOVE`, `goome::K_ESC`). Widgets take `&mut` to your value and return `true` when they changed it, like the int in C:

```rust
ui.slider("Volume", &mut volume, 0.0, 1.0);
```

`ui.begin()`, `ui.window()`, `ui.style()` and the other begin / end pairs hand back guards that call the end when they drop, so you cant forget one. Things C only ends when they opened (`menu`, `popup`, `modal`, `tree`, `table`) give back an `Option`. Errors are a `goome::Error` with the C code on it.

goome isnt thread safe, so the types arent `Send`. On Mac stay on the main thread.

## Editors

**VS Code**: rust-analyzer (`rust-lang.rust-analyzer`) is all you need, and CodeLLDB (`vadimcn.vscode-lldb`) for debugging. `cargo run --example ui_demo` in a clone of rust-goome shows every widget. The [goome extension](editor-vscode.md) side panel and `.goome.json` preview work in a Rust project too, its snippets are only C, C#, Python and Java for now.

**RustRover**: open the folder with Cargo.toml and it sets itself up. The [goome plugin](editor-rider.md) only needs the base platform, so it should load there too (tool window, preview, schemas), but nobody tried it in RustRover yet.

Add `GOOME_BACKEND=test` and `GOOME_TEST_SHOTS=shots/` to the run config env to get every frame as a .ppm without touching your screen ([Testing without a screen](testing.md)).
