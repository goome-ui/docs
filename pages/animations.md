---
title: Animations
---

# Animations <kbd>0.5</kbd>

The built in widgets already fade and slide on their own. This is for your stuff: a number that slides to where you want it, or a color that fades over, kept by id so you dont need your own timers.

`examples/anim.c` in c-goome has every ease next to each other, a color fade, a springy toggle and a bell with a bouncing badge.

## One number

```c
double x = goome_ui_anim(u, "panel x", open ? 0 : -260, 300, GOOME_EASE_OUT);
```

Call it every frame with where you want the value to end up. It gives back where it is right now. Change the target and it starts moving from wherever it is, so flipping it halfway just turns around.

- `id` is just a name, its kept away from widget ids so "Volume" here doesnt touch the "Volume" slider
- `ms` is how long the whole trip takes. 0 jumps straight there, below 0 uses the themes `anim_ms`
- `ease` is one of the `GOOME_EASE_*` below

The first time an id shows up it starts on the target, nothing moves until you change it.

While something is still moving `goome_ui_animating(u)` is 1, so a loop that only draws on input knows to keep drawing:

```c
int wait = goome_ui_animating(u) ? goome_pace(&pace, 60) : 500;
```

Ids nobody asks for in a while (about 1200 frames) get thrown away like all the other widget state.

## A slide out panel

```c
double x = goome_ui_anim(u, "drawer", open ? 0 : -280, 260, GOOME_EASE_OUT);
double fade = goome_ui_anim(u, "drawer fade", open ? 1 : 0, 200, GOOME_EASE_LINEAR);
goome_ui_pos(u, x, 40);
goome_ui_custom(u, "drawer", 260, 400, GOOME_ITEM_NO_HIT, &it);
goome_canvas *c = goome_ui_canvas(u);
if (c && fade > 0.01) goome_draw_rrect(c, it.x, it.y, it.w, it.h, goome_radius(14), 0xE0202838);
```

```csharp
double x = ui.Anim("drawer", open ? 0 : -280, 260, Ease.Out);
double fade = ui.Anim("drawer fade", open ? 1 : 0, 200, Ease.Linear);
```

```python
x = ui.anim("drawer", 0 if open else -280, 260, goome.EASE_OUT)
fade = ui.anim("drawer fade", 1 if open else 0, 200, goome.EASE_LINEAR)
```

```java
double x = ui.anim("drawer", open ? 0 : -280, 260, Theme.EASE_OUT);
double fade = ui.anim("drawer fade", open ? 1 : 0, 200, Theme.EASE_LINEAR);
```

```rust
let x = ui.anim("drawer", if open { 0.0 } else { -280.0 }, 260.0, goome::EASE_OUT);
let fade = ui.anim("drawer fade", if open { 1.0 } else { 0.0 }, 200.0, goome::EASE_LINEAR);
```

```go
to, shown := -280.0, 0.0
if open {
	to, shown = 0, 1
}
x := ui.Anim("drawer", to, 260, goome.EaseOut)
fade := ui.Anim("drawer fade", shown, 200, goome.EaseLinear)
```

```zig
const x = ui.anim("drawer", if (open) 0 else -280, 260, .out);
const fade = ui.anim("drawer fade", if (open) 1 else 0, 200, .linear);
```

```lua
local x = ui:anim("drawer", open and 0 or -280, 260, goome.EASE_OUT)
local fade = ui:anim("drawer fade", open and 1 or 0, 200, goome.EASE_LINEAR)
```

```js
const x = ui.anim("drawer", open ? 0 : -280, 260, goome.EASE_OUT);
const fade = ui.anim("drawer fade", open ? 1 : 0, 200, goome.EASE_LINEAR);
```

## Colors

```c
uint32_t bg = goome_ui_anim_color(u, "card", hovered ? 0xFF2E333C : 0xFF262A31, 140, GOOME_EASE_OUT);
```

Same thing for an `0xAARRGGBB` color. It mixes with the alpha premultiplied and close to linear light, so fading in from fully see through doesnt go dark on the way, and red to green goes through a bright middle instead of brown mud.

## The eases

| Ease | What it does |
|:--|:--|
| `GOOME_EASE_LINEAR` | same speed the whole way |
| `GOOME_EASE_IN` | starts slow, ends fast |
| `GOOME_EASE_OUT` | starts fast, slows down at the end. Good for most ui stuff |
| `GOOME_EASE_IN_OUT` | slow, fast, slow |
| `GOOME_EASE_SMOOTH` | smoothstep, what the widgets use by default |
| `GOOME_EASE_BACK` | goes a little past and comes back |
| `GOOME_EASE_SPRING` | a real damped spring, about 16% over then settles |
| `GOOME_EASE_BOUNCE` | drops and bounces like a ball |
| `GOOME_EASE_CUSTOM` | your own function from the [ui config](ui-anything.md) |

`goome_ease(ease, t)` gives you the curve itself, `t` from 0 to 1. Spring, back and bounce can go past 1 on the way, they always land on exactly 0 and 1 at the ends.

The numbers in the enum arent in the order above. In, spring and bounce got added at the end so old themes that saved an ease as a number keep the same one. Use the names, not the numbers.

## The widgets own animations

Hovers, presses, popups, collapsing and toasts already animate, set by the theme:

```c
goome_ui_theme(u)->anim_ms = 0;
goome_ui_theme(u)->ease = GOOME_EASE_SPRING;
```

`anim_ms` 0 turns all of it off, and the per thing times (`hover_ms`, `press_ms`, `popup_ms`, `collapse_ms`, `toast_fade_ms`) are on [Change anything](ui-anything.md).

## Tests

Its all worked out from the time, not stepped, so on the test backend (fixed 16 ms frames) the same script gives the exact same numbers and pixels every run. Theres no libm in it, spring and bounce use goomes own sin, cos and exp.
