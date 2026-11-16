---
title: Emoji, fonts and RTL
---

# Emoji, fonts and RTL <kbd>0.5</kbd>

Emoji come out in color, letters a font doesnt have come from fallback fonts, and Arabic and Hebrew go right to left. If you use `goome_font_system` (the ui kit does) you dont have to do anything, it finds the emoji font and an Arabic / Hebrew font by itself.

`examples/text.c` in c-goome is a window with emoji, Arabic, Hebrew and mixed lines, a direction switch, an input and a text editor.

## Fallback fonts

Every font has a list of fonts it asks when it doesnt have a letter. They get tried in order, color fonts first for emoji.

```c
goome_font *ui = goome_font_load("Inter.ttf");
goome_font *jp = goome_font_load("NotoSansJP-Regular.otf");
goome_font *emoji = goome_font_system("Noto Color Emoji");
goome_font_fallback(ui, jp);
goome_font_fallback(ui, emoji);
goome_text(c, ui, 18, 20, 20, "hi \xE3\x81\x93\xE3\x82\x93\xE3\x81\xAB\xE3\x81\xA1\xE3\x81\xAF \xF0\x9F\x91\x8B", 0xFFFFFFFF);
```

```csharp
var ui = Font.Load("Inter.ttf");
ui.Fallback(Font.Load("NotoSansJP-Regular.otf"));
ui.Fallback(Font.System("Noto Color Emoji"));
```

```python
ui = goome.Font.load("Inter.ttf")
ui.fallback(goome.Font.load("NotoSansJP-Regular.otf"))
ui.fallback(goome.Font.system("Noto Color Emoji"))
```

```java
Font ui = Font.load("Inter.ttf");
ui.fallback(Font.load("NotoSansJP-Regular.otf"));
ui.fallback(Font.system("Noto Color Emoji"));
```

```rust
let mut ui = goome::Font::load("Inter.ttf")?;
ui.fallback(goome::Font::load("NotoSansJP-Regular.otf")?);
ui.fallback(goome::Font::system(Some("Noto Color Emoji"))?);
```

```go
ui, _ := goome.LoadFont("Inter.ttf")
jp, _ := goome.LoadFont("NotoSansJP-Regular.otf")
emoji, _ := goome.SystemFont("Noto Color Emoji")
ui.Fallback(jp)
ui.Fallback(emoji)
```

```zig
const ui = try goome.Font.load("Inter.ttf");
ui.fallback(try goome.Font.load("NotoSansJP-Regular.otf"));
if (goome.Font.system("Noto Color Emoji")) |emoji| ui.fallback(emoji);
```

```lua
local ui = assert(goome.font_load("Inter.ttf"))
ui:fallback(assert(goome.font_load("NotoSansJP-Regular.otf")))
ui:fallback(assert(goome.font_system("Noto Color Emoji")))
```

```js
const ui = goome.Font.load("Inter.ttf");
ui.fallback(goome.Font.load("NotoSansJP-Regular.otf"));
ui.fallback(goome.Font.system("Noto Color Emoji"));
```

- up to 8 fallbacks per font, adding the same one twice does nothing
- `f` doesnt free its fallbacks, in C keep them alive until youre done with `f` and free them after
- a fallback can have its own fallbacks too

`goome_font_system` adds these by itself, loaded once per process:

| OS | Emoji | Arabic / Hebrew (only when the ui font has none) |
|:--|:--|:--|
| Linux | Noto Color Emoji, through fontconfig or the usual folders | whatever fontconfig has for `:lang=ar` / `:lang=he`, or DejaVu Sans |
| Windows | Segoe UI Emoji (`seguiemj.ttf`) | Segoe UI, Arial or Tahoma |
| Mac | Apple Color Emoji | Geeza Pro, Arial Hebrew, or Arial Unicode |

The 6 built in bitmap fonts (NULL as the font) dont have emoji or Arabic. Pass a real font when you need those.

## Color emoji

Color glyphs work from:

- COLR v0 + CPAL, the layered vector kind, drawn through the normal rasterizer so they stay sharp at any size
- CBDT / CBLC, the PNG kind Noto Color Emoji uses
- sbix, the PNG kind Apple Color Emoji uses

The PNG ones get scaled down with an area filter and up with bilinear, then cached per size. They ignore the color you pass to `goome_text`, everything else in the line still uses it.

Sequences that work: skin tones, ZWJ families and jobs like 👨‍👩‍👧, flags like 🇩🇪, keycaps like #️⃣, and the text / emoji variation selectors (U+FE0E / U+FE0F). Those go through the fonts own GSUB ligatures and cmap format 14.

## Right to left

Arabic and Hebrew come out right to left, numbers in them stay left to right, and brackets get mirrored. Mixed lines work too, like `goome says مرحبا (123) to שלום`. Arabic letters get their joined forms and lam alef.

```c
goome_text_dir(GOOME_DIR_AUTO);
```

| | |
|:--|:--|
| `GOOME_DIR_AUTO` | the default. Each line goes the way its first strong letter goes |
| `GOOME_DIR_LTR` | every line is left to right, RTL runs inside still flip |
| `GOOME_DIR_RTL` | every line is right to left |

Its one setting for all text in the process, not per font or per widget. Set it before you draw and put it back after if only one window wants it, thats what text.c does around its frame:

```c
goome_text_dir(dir);
if (goome_ui_app(u, "goome text", 0)) {
    goome_ui_label(u, "%s", "\xD7\xA9\xD7\x9C\xD7\x95\xD7\x9D \xD7\xA2\xD7\x95\xD7\x9C\xD7\x9D");
    goome_ui_input(u, "Name", name, sizeof(name));
    goome_ui_app_end(u);
}
goome_ui_end(u);
goome_text_dir(GOOME_DIR_AUTO);
```

```csharp
Goome.TextDir(TextDir.Rtl);
```

```python
goome.text_dir(goome.DIR_RTL)
```

```java
Goome.textDir(Goome.DIR_RTL);
```

```rust
goome::text_dir(goome::DIR_RTL);
```

```go
goome.TextDir(goome.DirRTL)
```

```zig
goome.textDir(goome.c.GOOME_DIR_RTL);
```

```lua
goome.text_dir(goome.DIR_RTL)
```

```js
goome.textDir(goome.DIR_RTL);
```

Inputs and the text editor handle it too. The caret, clicks, selection and the arrow keys follow what you see, so selecting across an Arabic word inside an English line does the right thing. `goome_text_measure` and `goome_text_width` measure the shaped text.

## Whats left out

On purpose, to keep it small:

- the explicit bidi controls (LRE, RLO, LRI and friends) get ignored
- no GPOS mark positioning, no contextual GSUB
- no AAT `morx`, so on a Mac ZWJ sequences in Apple Color Emoji show up as separate emoji
- no COLR v1 and no SVG glyphs
- Arabic fonts that only have the joined forms in GSUB (and not in the presentation forms block) show plain letters
- RTL lines in widgets still sit on the left side of the widget
- no Indic, Thai or other complex scripts beyond what a font draws without shaping

The tests hash every line in text.c, so the pixels come out the same on Linux, Windows and both Macs.
