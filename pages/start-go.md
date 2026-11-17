---
title: Getting started in Go
---

# Getting started in Go <kbd>0.5</kbd>

Go 1.23+ with cgo on. [go-goome](https://github.com/goome-ui/go-goome) compiles goome.h with cgo, no `-l` flags, no pkg-config and nothing to ship next to your exe.

To start from a project that already builds, `goome new my-app --lang go` makes one from the [Go template](https://github.com/goome-ui/goome-app-template-go), see [Templates and goome new](templates.md) <kbd>0.5.1</kbd>.

## Pick what you are making

`goome.Open` is the overlay, `goome.NewApp` a window, `goome.OpenOffscreen` a buffer with no window.

### Overlay on top of everything

```go
package main

import (
	"log"

	"github.com/goome-ui/go-goome"
)

func main() {
	g, err := goome.Open(goome.Options{Title: "my overlay"})
	if err != nil {
		log.Fatal(err)
	}
	defer g.Close()
	for running := true; running; {
		for ev := range g.Events(16) {
			if ev.Type == goome.EventQuit {
				running = false
			}
		}
		g.Frame(0, func(c *goome.Canvas) {
			c.RoundRect(40, 40, 240, 50, 12, 0xE0202838)
			c.Text(56, 56, "on top of everything", false, 0xFFFFFFFF)
		})
	}
}
```

More on [Overlay mode](overlay-mode.md).

### Make a normal app

```go
app := goome.NewApp("My app", 960, 640, 0)
clicks := 0
app.Run(func(ui *goome.UI) {
	if ui.Button("Click me") {
		clicks++
	}
	ui.Label(fmt.Sprintf("clicked %d times", clicks))
})
```

`Run` only redraws when something happened (or while the ui animates) and closes when someone hits the x. More on [Window mode](window-mode.md).

### Inside a game engine

```go
g, _ := goome.OpenOffscreen(320, 200, 1)
g.Frame(0, func(c *goome.Canvas) {
	c.RoundRect(20, 20, 280, 160, 16, 0xFF6FDC5F)
})
frame, _ := g.LastFrame()
uploadTexture(frame.Pixels(), frame.W(), frame.H())
```

`Pixels()` is a `[]uint32` right over goomes buffer, good until the next begin. More on [Offscreen mode](offscreen-mode.md).

## Install

```sh
go get github.com/goome-ui/go-goome@v0.5.2
```

The first build compiles goome with your C compiler, after that Go caches it:

- Debian / Ubuntu: `sudo apt install build-essential`
- Mac: `xcode-select --install`
- Windows: [mingw-w64](https://www.mingw-w64.org/) gcc on your PATH

If cgo is off (`CGO_ENABLED=0`, or no compiler found on Windows) turn it on with `CGO_ENABLED=1`. For another version see [Versions](versions.md).

## Your first overlay

```go
package main

import (
	"fmt"
	"log"

	"github.com/goome-ui/go-goome"
)

func main() {
	g, err := goome.Open(goome.Options{Title: "my overlay"})
	if err != nil {
		log.Fatal(err)
	}
	defer g.Close()
	pace := goome.NewPacer(60)
	defer pace.Free()
	for running := true; running; {
		for ev := range g.Events(pace.Wait()) {
			switch ev.Type {
			case goome.EventQuit:
				running = false
			case goome.EventDown:
				fmt.Printf("clicked at %.0f,%.0f\n", ev.X, ev.Y)
			}
		}
		c := g.Begin(0)
		if c == nil {
			continue
		}
		c.RoundRect(100, 100, 200, 80, 12, 0xE0202838)
		c.Text(116, 128, "click me", true, 0xFFFFFFFF)
		c.Hit(100, 100, 200, 80)
		g.End(c)
	}
}
```

Colors are `0xAARRGGBB` uint32s, positions are logical desktop coords, same as C.

On Mac goome has to run on the main thread. Put `runtime.LockOSThread()` in an `init()` of your main package and open goome from `main`.

## How it maps to C

Names are the C ones in CamelCase without `goome_`: `goome_draw_rrect` is `c.RRect`, `GOOME_WIN_MOVE` is `goome.WinMove`, `GOOME_K_LEFT` is `goome.KeyLeft`, `GOOME_S_ACCENT` is `goome.StyleAccent`, events are `goome.EventDown` and so on. Widgets take a pointer and return true when they changed it:

```go
ui.SliderFmt("Volume", &volume, 0, 1, "%.2f")
```

Every begin (`Begin`, `Window`, `Menu`, `Table`...) gets closed by one `ui.End()`, no matter what it returned. It knows if C wants the end or not, so `defer ui.End()` works too. Errors are values, `errors.Is(err, goome.ErrAgain)` works. Things that hold C memory have a `Free()`, freeing twice is fine.

## Editors

**VS Code**: the Go extension (`golang.go`) with gopls. cgo packages take a bit longer for gopls the first time, after that completion works on all of goome. F5 debugs it, the extension installs the debugger for you. The [goome extension](editor-vscode.md) side panel and `.goome.json` preview work in a Go project too, its snippets are only C, C#, Python and Java for now.

**GoLand**: open the folder with go.mod. If it shows cgo errors check that `CGO_ENABLED` isnt 0 in its environment. The [goome plugin](editor-rider.md) should load since it only needs the base platform, nobody tried it in GoLand yet.

`go run ./examples/ui` in a clone shows every widget. Set `GOOME_BACKEND=test` and `GOOME_TEST_SHOTS=shots/` in the run config to test without touching your screen ([Testing without a screen](testing.md)).
