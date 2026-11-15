---
title: Keyboard and focus
---

# Keyboard and focus <kbd>0.2</kbd>

The 0.2 ui kit works without a mouse.

| Key | What it does |
|:--|:--|
| Tab / Shift+Tab | move focus to the next / previous widget |
| Space or Enter | press the focused button, flip the focused checkbox or toggle |
| arrows | move sliders, pick radios and combo items |
| Esc | close the top popup, menu or modal |

The focused widget gets a ring in the theme's accent color.

## From your code

```c
goome_ui_set_focus(u);
goome_ui_input(u, "Search", search, sizeof(search));
if (goome_ui_focused(u)) goome_ui_statusbar(u, "type to search");
```

- `goome_ui_set_focus(u)` gives focus to the next widget. Call it once when a dialog opens to focus the first input.
- `goome_ui_focused(u)` is 1 when the widget right before it has focus.

## Text editing keys

Single line inputs and `goome_ui_text_edit`:

| Key | What |
|:--|:--|
| Shift+arrows | select |
| Home / End | start / end of the line |
| Ctrl+A | select all |
| Ctrl+C, Ctrl+X, Ctrl+V | copy, cut, paste through the goome clipboard |
| Ctrl+Z | undo |
| double click | select a word |

`goome_ui_text_edit` also has Ctrl+Y and Ctrl+Shift+Z for redo, and Page Up / Page Down.

The [overlay keyboard rule](overlay-mode.md#things-to-know) still applies, clicking into an input handles it.
