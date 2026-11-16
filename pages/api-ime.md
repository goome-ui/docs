---
title: "API: typing and the IME"
---

# API: typing and the IME

Made from `goome.h` 0.5.2 by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.

Guide: [ime](ime.md).

### goome_event_text <kbd>0.5</kbd>

```c
const char *goome_event_text(goome *g);
```

full utf-8 of the last `GOOME_TEXT` / `GOOME_PREEDIT`, good until the next poll

### goome_preedit_cursor <kbd>0.5</kbd>

```c
int goome_preedit_cursor(goome *g);
```

byte offset of the caret in the last preedit text

### goome_text_input <kbd>0.5</kbd>

```c
int goome_text_input(goome *g, int on, const goome_rect *caret);
```

ime on/off, caret (logical) is where the candidate window goes
