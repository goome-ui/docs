import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEADER = os.path.join(ROOT, "api", "goome.h")
OLDS = [(v, os.path.join(ROOT, "api", "goome-%s.h" % v)) for v in ("0.1", "0.2", "0.3")]
OUT = os.path.join(ROOT, "pages")

GROUPS = [
    ("api-anim", "API: animations", "animations.md", r"^goome_(ease|ui_anim|ui_anim_color|ui_animating)$"),
    ("api-ime", "API: typing and the IME", "ime.md", r"^goome_(event_text|preedit_cursor|text_input)$"),
    ("api-a11y", "API: accessibility", "accessibility.md", r"^goome_(ui_a11y\w*|a11y_tree)$"),
    ("api-core", "API: open, poll and frames", "frames.md", r"^goome_(open|open_app|close|error|strerror|backend_name|caps|mode|monitors|begin|end|damage|poll|pointer|keyboard|push|pace|now_ms|save_ppm|hit|frame|frame_dirty|frame_copy|resize)$"),
    ("api-window", "API: windows, cursor and clipboard", "window-mode.md", r"^goome_(window_\w+|cursor\w*|clipboard_\w+|drop_path)$"),
    ("api-capture", "API: capture and hotkeys", "capture.md", r"^goome_(capture|alpha_at|hotkey|parse_combo|control_path|send)$"),
    ("api-draw", "API: drawing", "drawing.md", r"^goome_(clear|draw_(?!bitmap)\w+|erase|text_width|set_font|font_count|canvas_blit|radius|clip_\w+)$"),
    ("api-images-fonts", "API: images and fonts", "images-fonts.md", r"^goome_(bitmap_\w+|draw_bitmap\w*|font_\w+|text|text_measure|text_line_height|text_dir)$"),
    ("api-input", "API: input capture", "input-capture.md", r"^goome_(grab|grabbed|ui_wants|ui_auto_grab)$"),
    ("api-ui", "API: ui kit", "ui.md", r"^goome_ui_(new|free|theme\w*|feed|begin|end|hit|animating|window|window_end|row|same_line|space|separator|width|label|heading|wrapped|button|image_button|image|checkbox|toggle|radio|slider|slider_int|input|combo|selectable|tabs|collapsing|progress|color|tooltip|hovered|scroll_begin|scroll_end|push_id|pop_id)$"),
    ("api-ui-app", "API: ui app, menus and popups", "ui-app.md", r"^goome_ui_(app\w*|menubar\w*|menu\w*|context\w*|popup\w*|modal\w*|toast|statusbar|focused|set_focus)$"),
    ("api-ui-custom", "API: styles and custom widgets", "ui-custom.md", r"^goome_ui_(pos|size|push_(color|num|radii|font|skin|theme)|pop|custom|canvas|store)$"),
    ("api-ui-more", "API: more ui widgets", "ui-tables.md", r"^goome_ui_\w+$"),
]


def strip_comment(line):
    m = re.match(r"^(.*?);\s*//\s*(.*)$", line)
    if m:
        return m.group(1) + ";", m.group(2).strip()
    return line, ""


def names_in(path):
    with open(path, encoding="utf-8") as f:
        return set(re.findall(r"\w+", f.read()))


def parse(path):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    text = text.split("#if defined(GOOME_IMPLEMENTATION) && !defined(GOOME_IMPLEMENTED)")[0]
    lines = text.split("\n")
    funcs, types, enums = [], [], []
    lead = []
    i = 0
    while i < len(lines):
        raw = lines[i]
        line = raw.strip()
        if line.startswith("//"):
            lead.append(line[2:].strip())
            i += 1
            continue
        if line.startswith("typedef struct {") or line.startswith("typedef struct{"):
            body = [raw]
            i += 1
            while i < len(lines) and not lines[i].startswith("}"):
                body.append(lines[i])
                i += 1
            end = lines[i] if i < len(lines) else "}"
            name = re.search(r"}\s*(\w+)\s*;", end).group(1)
            body.append(end)
            types.append((name, "\n".join(body), " ".join(lead)))
            lead = []
            i += 1
            continue
        if line.startswith("typedef struct "):
            m = re.match(r"typedef struct (\w+) (\w+);", line)
            if m:
                types.append((m.group(2), line, "you only ever get a pointer to one"))
            lead = []
            i += 1
            continue
        if line.startswith("enum"):
            body = [raw]
            while not lines[i].split("//")[0].rstrip().endswith("};"):
                i += 1
                body.append(lines[i])
            code, note = strip_comment(body[-1])
            body[-1] = code
            text = "\n".join(body)
            first = re.search(r"\b(GOOME_\w+)", text)
            if first:
                enums.append((first.group(1), text, note or " ".join(lead)))
            lead = []
            i += 1
            continue
        m = re.match(r"^([\w\s\*]+?)\s*\*?\s*\b(goome_\w+)\s*\((.*)$", line)
        if m and not line.startswith("#") and not line.startswith("typedef"):
            decl = line
            while not decl.rstrip().split("//")[0].rstrip().endswith(";"):
                i += 1
                decl += " " + lines[i].strip()
            code, note = strip_comment(decl)
            if not note and lead:
                note = " ".join(lead)
            funcs.append((m.group(2), code.strip(), note))
            lead = []
            i += 1
            continue
        if line and not line.startswith("#ifndef GOOME_NO") and not line.startswith("#endif"):
            lead = []
        i += 1
    return funcs, types, enums


def since(name, olds, new):
    for v, names in olds:
        if name in names:
            return v
    return new


def tag(name, olds, new):
    v = since(name, olds, new)
    return "" if v == olds[0][0] else " <kbd>%s</kbd>" % v


def note_text(note):
    note = note.strip()
    return re.sub(r"\b((?:GOOME|goome)_\w+\*?|\w+=\w+)", r"`\1`", note)


def write(name, title, text):
    with open(os.path.join(OUT, name + ".md"), "w", encoding="utf-8") as f:
        f.write("---\ntitle: \"%s\"\n---\n\n" % title + text.rstrip() + "\n")


def main():
    header = sys.argv[1] if len(sys.argv) > 1 else HEADER
    olds = [(v, names_in(p)) for v, p in OLDS if os.path.exists(p)]
    funcs, types, enums = parse(header)
    with open(header, encoding="utf-8") as f:
        version = re.search(r'#define GOOME_VERSION "([^"]+)"', f.read()).group(1)
    if len(sys.argv) > 2:
        version = sys.argv[2]
    new = ".".join(version.split(".")[:2])
    stamp = "Made from `goome.h` %s by `tools/apiref.py`. Dont edit it by hand, fix the header in c-goome.\n\n" % version
    left = list(funcs)
    for page, title, guide, pat in GROUPS:
        mine = [f for f in left if re.match(pat, f[0])]
        left = [f for f in left if f not in mine]
        out = ["# %s\n" % title, stamp + "Guide: [%s](%s).\n" % (guide[:-3].replace("-", " "), guide)]
        for name, code, note in mine:
            out.append("### %s%s\n" % (name, tag(name, olds, new)))
            out.append("```c\n%s\n```\n" % code)
            if note:
                out.append(note_text(note) + "\n")
        write(page, title, "\n".join(out))
    out = ["# API: types and constants\n", stamp, "## Structs\n"]
    for name, code, note in types:
        out.append("### %s%s\n" % (name, tag(name, olds, new)))
        out.append("```c\n%s\n```\n" % code)
        if note:
            out.append(note_text(note) + "\n")
    out.append("## Enums\n")
    for first, code, note in enums:
        members = re.findall(r"\b(GOOME_[A-Z0-9_]+)", code)
        firsts = [since(m, olds, new) for m in members]
        label = re.sub(r"_[A-Z0-9]+$", "", first) if len(members) > 1 else first
        common = os.path.commonprefix(members)
        if len(members) > 1 and "_" in common[6:]:
            label = common[:common.rindex("_")]
        label = label + "_*" if len(members) > 1 else label
        whole = min(firsts, key=lambda v: [int(x) for x in v.split(".")])
        out.append("### %s%s\n" % (label, "" if whole == olds[0][0] else " <kbd>%s</kbd>" % whole))
        out.append("```c\n%s\n```\n" % code.strip())
        for v in sorted(set(firsts), key=lambda v: [int(x) for x in v.split(".")]):
            if v == whole:
                continue
            out.append("New in %s: " % v + ", ".join("`%s`" % m for m, f in zip(members, firsts) if f == v) + ".\n")
        if note:
            out.append(note_text(note) + "\n")
    write("api-types", "API: types and constants", "\n".join(out))
    if left:
        print("not on any page: " + ", ".join(f[0] for f in left))
    print("wrote %d functions, %d types, %d enums" % (len(funcs), len(types), len(enums)))


if __name__ == "__main__":
    main()
