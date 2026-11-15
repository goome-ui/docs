import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOTES = os.path.join(ROOT, "tools", "errors-notes.json")
OUT = os.path.join(ROOT, "pages", "errors.md")
REPO = "https://github.com/goome-ui/c-goome/blob/main/src/"

AREAS = [
    ("core", "Core", ["goome.c", "draw.c"]),
    ("test", "Test and offscreen backends", ["test.c", "offscreen.c"]),
    ("x11", "X11", ["x11.c"]),
    ("wayland", "Wayland", ["wl.c"]),
    ("gnome", "GNOME and the portal", ["gnome.c"]),
    ("win32", "Windows", ["win32.c"]),
    ("macos", "macOS", ["macos.c"]),
    ("loading", "Image and font loading", ["image.c", "font.c"]),
    ("ui", "UI kit", ["ui.c"]),
]

CODES = ["GOOME_ENOTSUP", "GOOME_EDENIED", "GOOME_ENODISPLAY", "GOOME_EGONE", "GOOME_EAGAIN", "GOOME_ENOMEM", "GOOME_EARG"]

SPEC = re.compile(r"%[-+ #0]*(\*|\d+)?(\.(\*|\d+))?(hh|h|ll|l|z|j|t)?([diouxXfFeEgGcsp%])")


def strip_comments(src):
    out = []
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c == '"' or c == "'":
            j = i + 1
            while j < n and src[j] != c:
                j += 2 if src[j] == "\\" else 1
            out.append(src[i:j + 1])
            i = j + 1
        elif src.startswith("//", i):
            j = src.find("\n", i)
            j = n if j < 0 else j
            out.append(" " * (j - i))
            i = j
        elif src.startswith("/*", i):
            j = src.find("*/", i + 2)
            j = n if j < 0 else j + 2
            out.append(re.sub(r"[^\n]", " ", src[i:j]))
            i = j
        else:
            out.append(c)
            i += 1
    return "".join(out)


def call_args(src, start):
    args, depth, cur, i = [], 0, [], start
    while i < len(src):
        c = src[i]
        if c == '"' or c == "'":
            j = i + 1
            while src[j] != c:
                j += 2 if src[j] == "\\" else 1
            cur.append(src[i:j + 1])
            i = j + 1
            continue
        if c in "([{":
            depth += 1
        elif c in ")]}":
            if depth == 0:
                args.append("".join(cur).strip())
                return args, i
            depth -= 1
        elif c == "," and depth == 0:
            args.append("".join(cur).strip())
            cur = []
            i += 1
            continue
        cur.append(c)
        i += 1
    return args, i


def literals(expr):
    parts = re.findall(r'"((?:[^"\\]|\\.)*)"', expr)
    if not parts:
        return []
    if "?" in expr:
        return [bytes(p, "utf-8").decode("unicode_escape") for p in parts]
    return ["".join(bytes(p, "utf-8").decode("unicode_escape") for p in parts)]


RENAME = {"getlasterror": "error", "x11_err": "n", "r": "n", "code": "n", "e": "n", "resp_code": "n", "nsty": "n",
          "i": "mon", "names": "symbol", "m": "symbol", "fr": "dir", "conn": "stream", "dst_stride_bytes": "stride",
          "pw": "w", "ph": "h", "width": "w", "height": "h", "rm": "mask", "dlerror": "reason"}


def arg_name(expr):
    e = expr.strip()
    if "ov->name" in e:
        return "backend"
    if "->message" in e:
        return "reason"
    env = re.search(r'gm_env\("(\w+)"\)', e)
    if env:
        return env.group(1).lower()
    if re.fullmatch(r"[A-Z_][A-Z0-9_]*", e):
        return "n"
    e = re.sub(r"\[[^\]]*\]", "", e)
    ids = re.findall(r"[A-Za-z_][A-Za-z0-9_]*", e)
    ids = [i for i in ids if i not in ("sizeof", "int", "double", "unsigned", "long", "char", "const")]
    if not ids:
        return "n"
    name = ids[-1].lower()
    return RENAME.get(name, name)


def placeholders(fmt, args):
    k = 0
    out = []
    pos = 0
    for m in SPEC.finditer(fmt):
        out.append(fmt[pos:m.start()])
        pos = m.end()
        if m.group(5) == "%":
            out.append("%")
            continue
        if m.group(1) == "*":
            k += 1
        if m.group(3) == "*":
            k += 1
        name = arg_name(args[k]) if k < len(args) else "x"
        k += 1
        out.append("<" + name + ">")
    out.append(fmt[pos:])
    return "".join(out)


def line_of(src, i):
    return src.count("\n", 0, i) + 1


def scan_file(path):
    raw = open(path, encoding="utf-8", errors="replace").read()
    src = strip_comments(raw)
    name = os.path.basename(path)
    found = []
    relay = {}
    for m in re.finditer(r"\bgm_fail\s*\(", src):
        if re.search(r"\bint\s+$", src[max(0, m.start() - 8):m.start()]):
            continue
        args, _ = call_args(src, m.end())
        if len(args) < 3:
            continue
        code = args[1]
        fmts = literals(args[2])
        if not fmts:
            continue
        if fmts == ["%s"] and len(args) > 3:
            relay.setdefault(args[3], code)
            continue
        for f in fmts:
            found.append((f, code, args[3:], line_of(src, m.start())))
    for m in re.finditer(r"\bim_fail\s*\(", src):
        if re.search(r"\bint\s+$", src[max(0, m.start() - 8):m.start()]):
            continue
        args, _ = call_args(src, m.end())
        if len(args) < 2:
            continue
        for f in literals(args[1]):
            found.append((f, args[0], [], line_of(src, m.start())))
    for buf, code in relay.items():
        pat = re.compile(r"\bsnprintf\s*\(\s*" + re.escape(buf) + r"\s*,")
        for m in pat.finditer(src):
            args, _ = call_args(src, m.end())
            if len(args) < 2:
                continue
            for f in literals(args[1]):
                if SPEC.sub("", f).strip() == "":
                    continue
                found.append((f, code, args[2:], line_of(src, m.start())))
    out = []
    for f, code, args, line in found:
        out.append({"file": name, "line": line, "code": code, "raw": f, "msg": placeholders(f, args)})
    return out


def collect(src_dir):
    entries = {}
    for _, _, files in AREAS:
        for fn in files:
            p = os.path.join(src_dir, fn)
            if not os.path.exists(p):
                continue
            for e in scan_file(p):
                key = e["file"] + "|" + e["msg"]
                if key in entries:
                    entries[key]["lines"].append(e["line"])
                    if e["code"] not in entries[key]["codes"]:
                        entries[key]["codes"].append(e["code"])
                else:
                    entries[key] = {"file": e["file"], "msg": e["msg"], "codes": [e["code"]], "lines": [e["line"]]}
    return entries


def code_text(codes, note):
    if note.get("code"):
        return note["code"]
    real = [c for c in codes if c in CODES]
    if real and len(real) == len(codes):
        return ", ".join(real)
    return ", ".join(real) if real else "depends"


def render(entries, notes):
    total = len(entries)
    out = []
    out.append("---\ntitle: Error messages\n---\n")
    out.append("# Error messages <kbd>0.4</kbd>\n")
    out.append("Got an error out of goome? Paste it into the search box up top and it should land you right on it. Every message goome can hand you is on this page, " + str(total) + " of them, pulled straight out of the c-goome source.\n")
    out.append("Bits like `<backend>` or `<n>` get filled in when it happens, so yours will have a real name or number there instead.\n")
    out.append("## Where the message comes from\n")
    out.append("Most calls give back one of the `GOOME_E*` codes and leave the message on the handle. For image loading theres no handle so it has its own:\n")
    out.append("```c\nif (goome_hotkey(g, \"alt+h\", 1) != GOOME_OK) printf(\"%s\\n\", goome_error(g));\nif (goome_bitmap_load(\"logo.png\", &b) != GOOME_OK) printf(\"%s\\n\", goome_bitmap_error());\n```\n")
    out.append("```csharp\nif (!g.Hotkey(\"alt+h\", 1)) Console.WriteLine(g.LastError);\ntry { var b = Bitmap.Load(\"logo.png\"); } catch (GoomeException e) { Console.WriteLine(e.Message); }\n```\n")
    out.append("```python\ntry:\n    g.hotkey(\"alt+h\", 1)\nexcept goome.GoomeError:\n    print(g.error)\n```\n")
    out.append("```java\ntry {\n    g.hotkey(\"alt+h\", 1);\n} catch (GoomeException e) {\n    System.out.println(g.error());\n}\n```\n")
    out.append("`goome_strerror(code)` turns the number into a short line, those are below. If `goome_open` fails theres no handle yet, so all you get is the code from its `err` out arg.\n")
    out.append("| Code | Number | `goome_strerror` says |\n|:--|:--|:--|")
    say = notes.get("_codes", {})
    for i, c in enumerate(CODES):
        out.append("| `" + c + "` | " + str(-(i + 1)) + " | `" + say.get(c, "") + "` |")
    out.append("")
    missing = []
    for key, title, files in AREAS:
        group = [e for e in entries.values() if e["file"] in files]
        intro = notes.get("_areas", {}).get(key, "")
        if not group and not intro:
            continue
        out.append("## " + title + "\n")
        if intro:
            out.append(intro + "\n")
        group.sort(key=lambda e: (files.index(e["file"]), min(e["lines"])))
        for e in group:
            note = notes.get(e["file"] + "|" + e["msg"], {})
            if not note.get("what"):
                missing.append(e["file"] + "|" + e["msg"])
            out.append("### `" + e["msg"].replace("`", "'") + "`\n")
            lines = sorted(set(e["lines"]))
            where = ", ".join("[" + str(l) + "](" + REPO + e["file"] + "#L" + str(l) + ")" for l in lines[:6])
            out.append("<kbd>" + code_text(e["codes"], note) + "</kbd> from `" + e["file"] + ("` lines " if len(lines) > 1 else "` line ") + where + "\n")
            out.append(note.get("what", "Not written up yet. Look at the line above in the source for now.") + "\n")
            if note.get("fix"):
                out.append("**What to do:** " + note["fix"] + "\n")
    return "\n".join(out).rstrip() + "\n", missing


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    src = args[0] if args else os.path.join(ROOT, "..", "c-goome")
    if os.path.isdir(os.path.join(src, "src")):
        src = os.path.join(src, "src")
    entries = collect(src)
    if not entries:
        sys.exit("no errors found in " + src + ", is that a c-goome checkout?")
    if "--json" in sys.argv:
        print(json.dumps(list(entries.values()), indent=1))
        return
    notes = json.load(open(NOTES, encoding="utf-8")) if os.path.exists(NOTES) else {}
    page, missing = render(entries, notes)
    open(OUT, "w", encoding="utf-8").write(page)
    stale = [k for k in notes if not k.startswith("_") and k not in entries]
    print(str(len(entries)) + " errors -> pages/errors.md")
    for k in missing:
        print("no note yet: " + k)
    for k in stale:
        print("note for a message thats gone: " + k)


if __name__ == "__main__":
    main()
