(function (root) {
  const GM = typeof require !== "undefined" && typeof module !== "undefined" ? require("./model.js") : root.GM;
  const X = {};

  const C_RESERVED = new Set("index time log exp pow round floor ceil puts printf abs exit free malloc rand signal remove rename select read write close open link kill sleep y0 y1 yn j0 j1 jn gamma fmin fmax fabs sin cos sqrt tan atan stdin stdout stderr errno placeholder set_theme set_config draw load_bitmap pace ph gm_min gm_max gm_abs gm_floor gm_clamp fmt app on_hotkey".split(" "));
  const CS_RESERVED = new Set("ui u g c s e ev th app placeholder running dirty test pace err value draw setTheme tryLoad state theme".split(" "));

  const camel = (s) => s.replace(/_([a-z0-9])/g, (m, c) => c.toUpperCase());
  const pascal = (s) => camel(s).replace(/^./, (c) => c.toUpperCase());
  const bytes = (s) => {
    let n = 0;
    for (const ch of String(s)) {
      const c = ch.codePointAt(0);
      n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
    }
    return n;
  };
  const cut = (s, max) => {
    s = String(s);
    while (bytes(s) > max) s = s.slice(0, -1);
    return s;
  };
  const strq = (s, lang) => {
    let v = String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
    if (lang === "c") v = v.replace(/\?\?/g, "?\\?");
    return '"' + v + '"';
  };
  const num = (v) => {
    v = +v;
    if (!Number.isFinite(v)) v = 0;
    return Number.isInteger(v) ? String(v) : String(+v.toFixed(6));
  };
  const gdColor = (v) => {
    v = (+v || 0) >>> 0;
    return "Color.hex(0x" + ((((v & 0xFFFFFF) << 8) | (v >>> 24)) >>> 0).toString(16).toUpperCase().padStart(8, "0") + ")";
  };
  const hex = (v, lang) => (lang === "gd" ? gdColor(v) : "0x" + ((+v || 0) >>> 0).toString(16).toUpperCase().padStart(8, "0") + (lang === "cs" ? "u" : ""));
  const bool = (v, lang) => (lang === "py" ? (v ? "True" : "False") : lang === "c" ? (v ? "1" : "0") : v ? "true" : "false");
  const cam = (lang) => lang === "cs" || lang === "java";
  const GD_TAKEN = new Set("hit redraw push_text wants_mouse wants_keyboard get_texture get_image show hide grab_focus release_focus queue_free queue_redraw get set call free connect emit_signal notification print update reset has_focus is_visible get_rect".split(" "));
  const gdFn = (f) => (GD_TAKEN.has(f) ? f + "_fn" : f);
  const JAVA_TAKEN = new Set("App Bitmap Canvas Cell Config Event Flag Fn Font Goome GoomeException Icon Image Item ItemFlag Layout LwjglNative FfmNative Monitor Native Options Pacer PixelFormat Pointer Radii Rect Scratch Skin Sort Split Style Styled TextBuffer TextSize Theme Ui Window String Math System Object Integer Double Boolean Base64 DoubleBuffer Main".split(" "));
  const javaClass = (project) => {
    let n = pascal(GM.ident(project.name || project.title || "ui", "ui").replace(/_v$/, "")) || "Ui";
    if (/^[0-9]/.test(n)) n = "V" + n;
    if (JAVA_TAKEN.has(n)) n += "App";
    return n;
  };
  const floats = (s) => String(s || "").split(/[\s,]+/).filter((x) => x !== "").map(Number).filter(Number.isFinite);

  function Out(py) {
    this.l = [];
    this.d = 0;
    this.py = py;
    this.marks = [];
  }
  Out.prototype.add = function (s) {
    this.l.push(s === "" ? "" : "    ".repeat(this.d) + s);
  };
  Out.prototype.open = function (h) {
    this.add(this.py ? h : h + " {");
    this.d++;
    this.marks.push(this.l.length);
  };
  Out.prototype.close = function (tail) {
    const m = this.marks.pop();
    if (this.py && this.l.length === m) this.add("pass");
    this.d--;
    if (!this.py) this.add("}" + (tail || ""));
  };
  Out.prototype.text = function () {
    return this.l.join("\n");
  };

  function names(project) {
    const used = new Set();
    const map = new Map();
    const take = (base) => {
      let v = GM.ident(base);
      const bad = (x) => used.has(x) || C_RESERVED.has(x) || CS_RESERVED.has(camel(x)) || GM.RESERVED.has(camel(x));
      if (bad(v)) {
        const stem = v.replace(/_?\d+$/, "") || "v";
        let i = 2;
        while (bad(stem + i)) i++;
        v = stem + i;
      }
      used.add(v);
      for (const sfx of ["_items", "_names", "_cells", "_rows", "_x", "_y", "_w", "_h", "_open", "_frac"]) used.add(v + sfx);
      return v;
    };
    const vnm = new Map();
    for (const v of project.vars || []) vnm.set(v.id, take(v.name));
    for (const f of ["app", "fmt", "on_hotkey"]) used.add(f);
    GM.walk(project.root, (n) => {
      if (n.p && n.p.var && !n.p.bind) map.set(n.id, take(n.p.var));
      else if (["window", "scroll", "split", "tabs", "collapsing", "tree", "modal", "table", "plot_lines", "plot_bars", "combo", "selectable", "radio", "checkbox", "toggle", "slider", "slider_int", "input", "text_edit", "color", "el"].includes(n.type)) map.set(n.id, take(n.type));
      else if (n.type === "menu_item" && n.p.check) map.set(n.id, take(n.p.label || "item"));
    });
    for (const d of project.elements || []) {
      used.add(d.name + "_state");
      used.add(d.name + "_draw");
      used.add(d.name + "_ui");
    }
    map.vnm = vnm;
    map.take = take;
    return map;
  }

  const WFLAGS = [["move", "GOOME_WIN_MOVE", "WindowFlags.Move", "goome.WIN_MOVE"], ["resize", "GOOME_WIN_RESIZE", "WindowFlags.Resize", "goome.WIN_RESIZE"],
    ["collapse", "GOOME_WIN_COLLAPSE", "WindowFlags.Collapse", "goome.WIN_COLLAPSE"], ["notitle", "GOOME_WIN_NO_TITLE", "WindowFlags.NoTitle", "goome.WIN_NO_TITLE"],
    ["close", "GOOME_WIN_CLOSE", "WindowFlags.Close", "goome.WIN_CLOSE"]];
  const EFLAGS = [["readonly", "GOOME_EDIT_READONLY", "EditFlags.ReadOnly", "goome.EDIT_READONLY"], ["numbers", "GOOME_EDIT_LINE_NUMBERS", "EditFlags.LineNumbers", "goome.EDIT_LINE_NUMBERS"],
    ["wrap", "GOOME_EDIT_WRAP", "EditFlags.Wrap", "goome.EDIT_WRAP"], ["mono", "GOOME_EDIT_MONO", "EditFlags.Mono", "goome.EDIT_MONO"]];
  const TFLAGS = [["sortable", "GOOME_TABLE_SORTABLE", "TableFlags.Sortable", "goome.TABLE_SORTABLE"], ["resizable", "GOOME_TABLE_RESIZABLE", "TableFlags.Resizable", "goome.TABLE_RESIZABLE"],
    ["stripes", "GOOME_TABLE_STRIPES", "TableFlags.Stripes", "goome.TABLE_STRIPES"], ["borders", "GOOME_TABLE_BORDERS", "TableFlags.Borders", "goome.TABLE_BORDERS"]];
  const AFLAGS = [["titlebar", "GOOME_APP_TITLEBAR", "AppFlags.TitleBar", "goome.APP_TITLEBAR"], ["menubar", "GOOME_APP_MENUBAR", "AppFlags.MenuBar", "goome.APP_MENUBAR"],
    ["statusbar", "GOOME_APP_STATUSBAR", "AppFlags.StatusBar", "goome.APP_STATUSBAR"], ["nopad", "GOOME_APP_NO_PAD", "AppFlags.NoPad", "goome.APP_NO_PAD"]];
  const IFLAGS = [["password", "GOOME_INPUT_PASSWORD", "InputFlags.Password", "goome.INPUT_PASSWORD"], ["readonly", "GOOME_INPUT_READONLY", "InputFlags.ReadOnly", "goome.INPUT_READONLY"],
    ["number", "GOOME_INPUT_NUMBER", "InputFlags.Number", "goome.INPUT_NUMBER"], ["noselect", "GOOME_INPUT_NO_SELECT_ON_FOCUS", "InputFlags.NoSelectOnFocus", "goome.INPUT_NO_SELECT_ON_FOCUS"],
    ["enter", "GOOME_INPUT_ENTER_RETURNS", "InputFlags.EnterReturns", "goome.INPUT_ENTER_RETURNS"]];
  const LI = { c: 1, cs: 2, py: 3, java: 3, gd: 3 };
  const flags = (table, p, lang) => {
    const on = table.filter((f) => p[f[0]]).map((f) => (lang === "java" ? f[3].replace("goome.", "Ui.") : lang === "gd" ? f[3].replace("goome.", "GoomeUI.") : f[LI[lang]]));
    if (!on.length) return lang === "cs" ? table[0][2].split(".")[0] + ".None" : "0";
    return on.join(" | ");
  };

  const THC = { bg: "Bg", panel: "Panel", border: "Border", text: "Text", text_dim: "TextDim", accent: "Accent", accent_text: "AccentText", hover: "Hover", active: "Active", input_bg: "InputBg", shadow: "Shadow", radius: "Radius", pad: "Pad", gap: "Gap", border_width: "BorderWidth", font_size: "FontSize", shadow_blur: "ShadowBlur", anim_ms: "AnimMs" };

  function Ctx(project, lang, warn) {
    this.project = project;
    this.lang = lang;
    this.warn = warn;
    this.nm = names(project);
    this.vnm = this.nm.vnm;
    this.uniq = (b) => this.nm.take(b);
    this.top = [];
    this.consts = [];
    this.inits = [];
    this.need = { placeholder: false, math: false };
    this.files = new Set();
    this.scope = null;
    this.defs = new Map((project.elements || []).map((d) => [d.id, d]));
    this.used = new Map();
    this.insts = [];
  }
  Ctx.prototype.id = function (name) {
    return cam(this.lang) ? camel(name) : name;
  };
  Ctx.prototype.v = function (name) {
    const id = this.id(name);
    if (this.scope) return this.scope.alias[name] || id;
    if (this.lang === "py" || this.lang === "gd") return "s." + id;
    return id;
  };
  Ctx.prototype.local = function (type, name, e) {
    const lang = this.lang;
    if (lang === "py") return name + " = " + e;
    if (lang === "gd") return "var " + name + " = " + e;
    if (lang === "c") return (type === "bool" ? "int" : type === "var" ? "double" : type) + " " + name + " = " + e + ";";
    if (lang === "java") return (type === "bool" ? "boolean" : type) + " " + name + " = " + e + ";";
    return type + " " + name + " = " + e + ";";
  };
  Ctx.prototype.addr = function (name) {
    return this.lang === "c" ? "&" + this.v(name) : this.lang === "cs" ? "ref " + this.v(name) : this.v(name);
  };
  Ctx.prototype.decl = function (kind, name, val, extra) {
    const lang = this.lang;
    const id = this.id(name);
    const sc = this.scope;
    if (sc) {
      if (kind === "floats") {
        const top = sc.prefix + "_" + name;
        sc.alias[name] = cam(lang) ? camel(top) : lang === "py" || lang === "gd" ? top.toUpperCase() : top;
        if (lang === "c") this.consts.push("static float " + top + "[] = {" + (val.length ? val.map(num).join(", ") : "0") + "};");
        else if (lang === "cs") this.consts.push("float[] " + camel(top) + " = { " + val.map((x) => num(x) + "f").join(", ") + " };");
        else if (lang === "java") this.consts.push("static final float[] " + camel(top) + " = {" + val.map((x) => num(x) + "f").join(", ") + "};");
        else if (lang === "gd") this.consts.push("const " + top.toUpperCase() + ": PackedFloat32Array = [" + val.map(num).join(", ") + "]");
        else this.consts.push(top.toUpperCase() + " = [" + val.map(num).join(", ") + "]");
        return;
      }
      sc.slots.push({ kind, name, val: kind === "color" ? val >>> 0 : kind === "bool" || kind === "flag" ? (val ? 1 : 0) : +val || 0 });
      return;
    }
    let line;
    if (lang === "c") {
      const T = { int: "int", bool: "int", flag: "int", double: "double", color: "uint32_t" }[kind];
      if (kind === "str") {
        const cap = Math.max(2, extra | 0);
        line = sc ? ["char " + id + "[" + cap + "];", strq(cut(val, cap - 1), "c")] : "static char " + id + "[" + cap + "] = " + strq(cut(val, cap - 1), "c") + ";";
      } else if (kind === "floats") {
        const v = val.length ? val.map(num).join(", ") : "0";
        line = sc ? ["float " + id + "[" + Math.max(1, val.length) + "];", "{" + v + "}"] : "static float " + id + "[] = {" + v + "};";
      } else {
        const lit = kind === "color" ? hex(val, lang) : kind === "double" ? num(val) : kind === "int" ? String(val | 0) : val ? "1" : "0";
        line = sc ? [T + " " + id + ";", lit] : "static " + T + " " + id + " = " + lit + ";";
      }
    } else if (lang === "cs") {
      const T = { int: "int", bool: "bool", flag: "bool", double: "double", color: "uint", str: "string", floats: "float[]" }[kind];
      const lit = kind === "color" ? hex(val, lang) : kind === "double" ? num(val) : kind === "int" ? String(val | 0) : kind === "str" ? strq(cut(val, Math.max(2, extra | 0) - 1), "cs") : kind === "floats" ? "{ " + val.map((x) => num(x) + "f").join(", ") + " }" : bool(val, lang);
      line = (sc ? "public " : "") + T + " " + id + " = " + (kind === "floats" && sc ? "new float[] " + lit : lit) + ";";
    } else if (lang === "java") {
      const T = { int: "int", bool: "boolean", flag: "boolean", double: "double", color: "int", str: "String", floats: "float[]" }[kind];
      const lit = kind === "color" ? hex(val, lang) : kind === "double" ? num(val) : kind === "int" ? String(val | 0) : kind === "str" ? strq(cut(val, Math.max(2, extra | 0) - 1), "cs") : kind === "floats" ? "{" + val.map((x) => num(x) + "f").join(", ") + "}" : bool(val, lang);
      line = "static " + T + " " + id + " = " + lit + ";";
    } else if (lang === "gd") {
      const T = { int: "int", bool: "bool", flag: "bool", double: "float", color: "Color", str: "String", floats: "PackedFloat32Array" }[kind];
      const lit = kind === "color" ? hex(val, lang) : kind === "double" ? (Number.isInteger(+val) ? num(val) + ".0" : num(val)) : kind === "int" ? String(val | 0) : kind === "str" ? strq(cut(val, Math.max(2, extra | 0) - 1), "cs") : kind === "floats" ? "[" + val.map(num).join(", ") + "]" : bool(val, lang);
      line = "var " + id + ": " + T + " = " + lit;
    } else {
      const lit = kind === "color" ? hex(val, lang) : kind === "double" ? (Number.isInteger(+val) ? num(val) + ".0" : num(val)) : kind === "int" ? String(val | 0) : kind === "str" ? strq(cut(val, Math.max(2, extra | 0) - 1), "py") : kind === "floats" ? "[" + val.map(num).join(", ") + "]" : kind === "flag" ? "goome.Flag(" + bool(val, lang) + ")" : bool(val, lang);
      line = sc ? "self." + id + " = " + lit : id + " = " + lit;
    }
    (sc ? sc.fields : this.top).push(line);
  };
  Ctx.prototype.constArr = function (name, items) {
    const lang = this.lang;
    if (this.scope) name = this.scope.prefix + "_" + name;
    const id = cam(lang) ? camel(name) : lang === "py" || lang === "gd" ? name.toUpperCase() : name;
    if (lang === "c") this.consts.push("static const char *const " + id + "[] = {" + items.map((x) => strq(x, "c")).join(", ") + "};");
    else if (lang === "cs") this.consts.push("string[] " + id + " = { " + items.map((x) => strq(x, "cs")).join(", ") + " };");
    else if (lang === "java") this.consts.push("static final String[] " + id + " = {" + items.map((x) => strq(x, "cs")).join(", ") + "};");
    else if (lang === "gd") this.consts.push("const " + id + ": PackedStringArray = [" + items.map((x) => strq(x, "cs")).join(", ") + "]");
    else this.consts.push(id + " = [" + items.map((x) => strq(x, "py")).join(", ") + "]");
    return id;
  };

  const isRoot = (pt) => pt === "overlay" || pt === "app";
  const wrapped = (e) => {
    if (e[0] !== "(" || e[e.length - 1] !== ")") return false;
    let d = 0;
    for (let i = 0; i < e.length; i++) {
      if (e[i] === "(") d++;
      else if (e[i] === ")") d--;
      if (d === 0 && i < e.length - 1) return false;
    }
    return true;
  };
  const par = (e) => (/^-?[\w.]+(->\w+)?(\[\d+\])?$/.test(e) || wrapped(e) ? e : "(" + e + ")");
  const plus = (a, b) => (a === "0" ? b : b === "0" ? a : a + " + " + b);
  const minus = (a, b) => (b === "0" ? a : a + " - " + par(b));
  const neg = (e) => (e === "0" ? "0" : "-" + par(e));

  function emitList(list, ctx, out, ptype) {
    for (const n of list) emitNode(n, ctx, out, ptype);
  }

  const SFIELDS = GM.THEME_COLORS.concat(GM.THEME_SIZES);
  function styleArgs(ctx, st) {
    const lang = ctx.lang;
    const f = {};
    const th = st.theme ? GM.findTheme(ctx.project, st.theme) : null;
    if (st.theme && !th) ctx.warn("", "a style uses a theme that is gone: " + st.theme);
    if (th) {
      const t = GM.normTheme(th);
      SFIELDS.forEach((k) => {
        if (!NEWF.has(k) || +t[k] !== +GM.THEME_REST[k]) f[k] = t[k];
      });
    }
    for (const k of GM.THEME_COLORS) if (st.c && st.c[k] != null) f[k] = st.c[k];
    for (const k of GM.THEME_SIZES) if (st.n && st.n[k] != null) f[k] = st.n[k];
    const out = [];
    for (const k of SFIELDS) {
      if (!(k in f)) continue;
      const v = fieldLit(k, f[k], lang);
      out.push(lang === "cs" ? camel(k) + ": " + v : lang === "java" ? "." + camel(k) + "(" + v + ")" : lang === "gd" ? strq(k, "gd") + ": " + (GM.THEME_COLORS.includes(k) || GM.THEME_ENUMS[k] || /\./.test(v) ? v : v + ".0") : k + "=" + v);
    }
    if (Array.isArray(st.radii) && st.radii.length === 4) {
      const r = st.radii.map(num).join(", ");
      out.push(lang === "cs" ? "radii: new Radii(" + r + ")" : lang === "java" ? ".radii(" + r + ")" : lang === "gd" ? '"radii": Vector4(' + r + ")" : "radii=(" + r + ")");
    }
    return out;
  }
  function themeVar(ctx, id) {
    ctx.themeVars = ctx.themeVars || new Map();
    if (!ctx.themeVars.has(id)) {
      const t = GM.findTheme(ctx.project, id);
      let base = "theme_" + GM.ident(t ? t.name : id, "t");
      const used = new Set([...ctx.themeVars.values()]);
      let v = base, i = 2;
      while (used.has(v)) v = base + i++;
      ctx.themeVars.set(id, v);
    }
    return ctx.themeVars.get(id);
  }
  function styled(ctx, out, st, body) {
    const k = GM.styleCount(st);
    if (!k) return body();
    const lang = ctx.lang;
    if (lang === "c") {
      const th = st.theme ? GM.findTheme(ctx.project, st.theme) : null;
      let pushed = 0;
      if (st.theme && th) out.add("goome_ui_push_theme(u, &" + themeVar(ctx, st.theme) + ");"), pushed++;
      else if (st.theme) ctx.warn("", "a style uses a theme that is gone: " + st.theme);
      for (const f of GM.THEME_COLORS) if (st.c && st.c[f] != null) out.add("goome_ui_push_color(u, GOOME_S_" + f.toUpperCase() + ", " + hex(st.c[f], "c") + ");"), pushed++;
      for (const f of GM.THEME_SIZES) if (st.n && st.n[f] != null) out.add("goome_ui_push_num(u, GOOME_S_" + f.toUpperCase() + ", " + fieldLit(f, st.n[f], "c") + ");"), pushed++;
      if (Array.isArray(st.radii) && st.radii.length === 4) out.add("goome_ui_push_radii(u, (goome_radii){" + st.radii.map(num).join(", ") + "});"), pushed++;
      body();
      if (pushed) out.add("goome_ui_pop(u, " + pushed + ");");
      return;
    }
    const args = styleArgs(ctx, st);
    if (!args.length) return body();
    if (lang === "gd") {
      const p = "pushed" + ++ctx.k;
      out.add("var " + p + " = ui.push_style({" + args.join(", ") + "})");
      body();
      out.add("ui.pop(" + p + ")");
      return;
    }
    if (lang === "cs") out.open("using (ui.Style(" + args.join(", ") + "))");
    else if (lang === "java") out.open("try (Styled style" + ++ctx.k + " = ui.style()" + args.join("") + ".push())");
    else out.open("with ui.style(" + args.join(", ") + "):");
    body();
    out.close();
  }

  function emitSlot(n, s, ctx, out, ptype) {
    const st = n.slotStyle && n.slotStyle[String(s)];
    styled(ctx, out, st, () => emitList(n.kids[s] || [], ctx, out, ptype));
  }

  const OWN_T = { checkbox: "bool", toggle: "bool", collapsing: "bool", tree: "bool", modal: "bool", slider: "float", slider_int: "int", combo: "int", radio: "int", selectable: "int", tabs: "int", color: "color", input: "string", text_edit: "string" };
  const FLAGGY = { tree: 1, modal: 1, menu_item: 1 };

  function prepass(ctx) {
    const pj = ctx.project, lang = ctx.lang, py = lang === "py";
    ctx.refs = new Map();
    ctx.vars = new Map();
    ctx.targets = new Set();
    ctx.fns = [];
    ctx.k = 0;
    const flagVars = new Set();
    GM.walk(pj.root, (n) => {
      if (n.p && n.p.bind && FLAGGY[n.type]) flagVars.add(n.p.bind);
      const on = n.on || {};
      for (const e in on) for (const a of on[e] || []) note(a);
    });
    for (const hk of pj.hotkeys || []) for (const a of hk.actions || []) note(a);
    function note(a) {
      if (!a) return;
      if ((a.do === "open" || a.do === "close" || a.do === "tab") && a.target) ctx.targets.add(a.target);
      if (a.do === "call" && a.fn) {
        const f = GM.ident(a.fn, "on_click");
        if (!ctx.fns.includes(f)) ctx.fns.push(f);
      }
    }
    const caps = {};
    GM.walk(pj.root, (n) => {
      if (n.p && n.p.bind && (n.type === "input" || n.type === "text_edit")) caps[n.p.bind] = Math.max(caps[n.p.bind] || 0, +n.p.cap || 0);
    });
    for (const v of pj.vars || []) {
      const name = ctx.vnm.get(v.id);
      const id = cam(lang) ? camel(name) : name;
      const flag = py && v.type === "bool" && flagVars.has(v.id);
      const code = py ? "s." + id + (flag ? ".value" : "") : lang === "gd" ? "s." + id : id;
      const r = { name, code, obj: py ? "s." + id : id, type: v.type, flag, v, cap: Math.max(256, caps[v.id] || 0) };
      ctx.vars.set(v.id, r);
      ctx.refs.set(v.name, r);
      declVar(ctx, r);
    }
    GM.walk(pj.root, (n) => {
      if (!n.p || !n.p.var || n.p.bind || !OWN_T[n.type] || ctx.refs.has(n.p.var)) return;
      const nm = ctx.nm.get(n.id);
      if (!nm) return;
      const id = cam(lang) ? camel(nm) : nm;
      const flag = py && FLAGGY[n.type];
      ctx.refs.set(n.p.var, { name: nm, code: py ? "s." + id + (flag ? ".value" : "") : lang === "gd" ? "s." + id : id, type: OWN_T[n.type] });
    });
  }

  function declVar(ctx, r) {
    const lang = ctx.lang, v = r.v, id = cam(lang) ? camel(r.name) : r.name;
    const d = v.def;
    if (v.type === "list") {
      const items = GM.lines(d);
      if (lang === "c") ctx.consts.push("static const char *const " + id + "[] = {" + (items.length ? items : [""]).map((x) => strq(x, "c")).join(", ") + "};");
      else if (lang === "cs") ctx.consts.push("string[] " + id + " = { " + items.map((x) => strq(x, "cs")).join(", ") + " };");
      else if (lang === "java") ctx.consts.push("static final String[] " + id + " = {" + items.map((x) => strq(x, "cs")).join(", ") + "};");
      else if (lang === "gd") ctx.top.push("var " + id + ": PackedStringArray = [" + items.map((x) => strq(x, "cs")).join(", ") + "]");
      else ctx.top.push(id + " = [" + items.map((x) => strq(x, "py")).join(", ") + "]");
      return;
    }
    const kind = { bool: r.flag ? "flag" : "bool", int: "int", float: "double", color: "color", string: "str" }[v.type];
    const val = v.type === "string" ? String(d == null ? "" : d) : v.type === "color" ? (+d >>> 0) : v.type === "bool" ? !!d : +d || 0;
    const save = ctx.scope;
    ctx.scope = null;
    ctx.decl(kind, r.name, val, r.cap);
    ctx.scope = save;
  }

  function listInfo(ctx, n) {
    const p = n.p, lang = ctx.lang;
    if (p.itemsVar) {
      const r = ctx.vars.get(p.itemsVar);
      if (r && r.type === "list") {
        const len = lang === "c" ? "(int)(sizeof(" + r.code + ") / sizeof(*" + r.code + "))" : lang === "cs" ? r.code + ".Length" : lang === "java" ? r.code + ".length" : lang === "gd" ? r.code + ".size()" : "len(" + r.code + ")";
        return { arr: r.code, len, items: GM.lines(r.v.def), dyn: true };
      }
      ctx.warn(n.id, "the items list var is gone or isnt a list, using the typed items");
    }
    return null;
  }

  function exprCode(ctx, src, want, where, id) {
    const types = GM.layoutIdents(ctx.project);
    const r = GM.expr.check(src, types, want);
    if (!r.ok) {
      ctx.warn(id || "", where + ": " + r.err);
      return null;
    }
    const map = {
      id: (name) => {
        const ref = ctx.refs.get(name);
        return ref ? ref.code : name;
      },
      th: (f) => thCode(ctx.lang, f, "ui"),
    };
    let s = GM.expr.code(r.ast, ctx.lang, map, types);
    if (want === "b" && ctx.lang !== "c" && ctx.lang !== "py" && r.type !== "b") s = par(s) + " != 0";
    if (want === "n" && r.type === "b") s = ctx.lang === "py" || ctx.lang === "gd" ? "int(" + s + ")" : cam(ctx.lang) ? "(" + s + " ? 1 : 0)" : s;
    return s;
  }
  function thCode(lang, f, ui) {
    if (lang === "c") return "goome_ui_theme(u)->" + f;
    if (lang === "cs") return ui + ".Theme." + THC[f];
    if (lang === "java") return ui + ".theme()." + camel(f) + "()";
    if (lang === "gd") return ui + ".theme_get(" + strq(f, "gd") + ")";
    return ui + ".theme." + f;
  }

  function textCode(ctx, text, opts) {
    const lang = ctx.lang;
    const parts = GM.interp(text);
    const vars = parts.filter((x) => x.v && ctx.refs.has(x.v));
    for (const x of parts) if (x.v && !ctx.refs.has(x.v)) ctx.warn((opts && opts.id) || "", "theres no var called " + x.v + " for {" + x.v + "}");
    if (!vars.length) return { code: strq(text, lang), dyn: false };
    if (lang === "c") {
      let f = "";
      const args = [];
      for (const x of parts) {
        const r = x.v && ctx.refs.get(x.v);
        if (!r) f += (x.t != null ? x.t : "{" + x.v + "}").replace(/%/g, "%%");
        else if (r.type === "float") f += "%g", args.push(r.code);
        else if (r.type === "string") f += "%s", args.push(r.code);
        else if (r.type === "color") f += "#%08X", args.push("(unsigned)" + r.code);
        else if (r.type === "list") f += "%s", args.push(r.code + "[0]");
        else f += "%d", args.push(r.code);
      }
      if (opts && opts.printf) return { code: strq(f, "c") + ", " + args.join(", "), dyn: true, printf: true };
      ctx.need.fmt = true;
      return { code: "fmt(" + strq(f, "c") + ", " + args.join(", ") + ")", dyn: true, fmt: f, args };
    }
    if (lang === "gd") {
      let f = "";
      const args = [];
      for (const x of parts) {
        const r = x.v && ctx.refs.get(x.v);
        if (!r) f += (x.t != null ? x.t : "{" + x.v + "}").replace(/%/g, "%%");
        else if (r.type === "color") f += "#%s", args.push(r.code + ".to_html()");
        else if (r.type === "list") f += "%s", args.push(r.code + "[0]");
        else f += "%s", args.push(r.code);
      }
      return { code: strq(f, "gd") + " % [" + args.join(", ") + "]", dyn: true };
    }
    if (lang === "java") {
      const bits = [];
      for (const x of parts) {
        const r = x.v && ctx.refs.get(x.v);
        if (!r) bits.push(strq(x.t != null ? x.t : "{" + x.v + "}", "cs"));
        else if (r.type === "color") bits.push('"#"', 'String.format("%08X", ' + r.code + ")");
        else if (r.type === "list") bits.push(r.code + "[0]");
        else bits.push(r.code);
      }
      if (!/^"/.test(bits[0])) bits.unshift('""');
      return { code: bits.join(" + "), dyn: true };
    }
    let s = "";
    for (const x of parts) {
      const r = x.v && ctx.refs.get(x.v);
      if (!r) s += strq(x.t != null ? x.t : "{" + x.v + "}", lang).slice(1, -1).replace(/\{/g, "{{").replace(/\}/g, "}}");
      else if (r.type === "color") s += lang === "cs" ? "#{" + r.code + ":X8}" : "#{" + r.code + ":08X}";
      else if (r.type === "list") s += "{" + r.code + "[0]}";
      else s += "{" + r.code + "}";
    }
    return { code: (lang === "cs" ? "$" : "f") + '"' + s + '"', dyn: true };
  }

  function emitActions(ctx, out, list, where) {
    const lang = ctx.lang, c = lang === "c", cs = lang === "cs", py = lang === "py", jv = lang === "java", gd = lang === "gd";
    const ind = py || gd;
    const St = (s) => out.add(s + (ind ? "" : ";"));
    const U = (cf, csf, pyf, args) => (c ? "goome_ui_" + cf + "(" + ["u"].concat(args).join(", ") + ")" : cs ? "ui." + csf + "(" + args.join(", ") + ")" : jv ? "ui." + camel(pyf) + "(" + args.join(", ") + ")" : "ui." + pyf + "(" + args.join(", ") + ")");
    const idx = GM.index(ctx.project);
    let any = false;
    for (const a of list || []) {
      if (!a || !a.do) continue;
      any = true;
      const refOf = (name) => {
        const r = ctx.refs.get(name);
        if (!r) ctx.warn("", where + ": theres no var called " + (name || "(none)"));
        return r;
      };
      switch (a.do) {
        case "set": {
          const r = refOf(a.var);
          if (!r) break;
          if (r.type === "string") {
            const t = textCode(ctx, a.value || "", {});
            if (c) {
              if (t.dyn) St("snprintf(" + r.code + ", sizeof(" + r.code + "), " + strq(t.fmt, "c") + ", " + t.args.join(", ") + ")");
              else St("snprintf(" + r.code + ", sizeof(" + r.code + "), \"%s\", " + t.code + ")");
            } else St(r.code + " = " + t.code);
            break;
          }
          if (r.type === "list") {
            ctx.warn("", where + ": cant set a list var, its fixed");
            break;
          }
          const want = r.type === "bool" ? "b" : r.type === "color" ? "c" : "n";
          let e = exprCode(ctx, a.value === "" || a.value == null ? (r.type === "bool" ? "false" : "0") : a.value, want, where);
          if (e == null) break;
          if (r.type === "int") e = c || cs || jv ? "(int)" + par(e) : "int(" + e + ")";
          if (r.type === "color" && cs) e = "(uint)" + par(e);
          St(r.code + " = " + e);
          break;
        }
        case "toggle": {
          const r = refOf(a.var);
          if (!r) break;
          if (r.type !== "bool") {
            ctx.warn("", where + ": toggle needs a yes/no var, " + r.name + " isnt one");
            break;
          }
          St(r.code + " = " + (ind ? "not " : "!") + r.code);
          break;
        }
        case "add":
        case "sub": {
          const r = refOf(a.var);
          if (!r) break;
          if (r.type !== "int" && r.type !== "float") {
            ctx.warn("", where + ": add/sub needs a number var");
            break;
          }
          const e = exprCode(ctx, a.value === "" || a.value == null ? "1" : a.value, "n", where);
          if (e == null) break;
          const op = a.do === "add" ? " + " : " - ";
          let v = r.code + op + par(e);
          if (r.v && +r.v.max > +r.v.min) {
            ctx.need.math = true;
            const lo = num(r.v.min), hi = num(r.v.max);
            v = c ? "gm_clamp(" + v + ", " + lo + ", " + hi + ")" : cs ? "Math.Max(" + lo + ", Math.Min(" + hi + ", " + v + "))" : jv ? "Math.max(" + lo + ", Math.min(" + hi + ", " + v + "))" : gd ? "clamp(" + v + ", " + lo + ", " + hi + ")" : "max(" + lo + ", min(" + hi + ", " + v + "))";
          }
          if (r.type === "int") v = c || cs || jv ? "(int)" + (/^\w/.test(v) && !/[ ]/.test(v) ? v : par(v)) : "int(" + v + ")";
          St(r.code + " = " + v);
          break;
        }
        case "open":
        case "close": {
          const t = idx.get(a.target);
          if (!t) {
            ctx.warn("", where + ": the " + a.do + " target is gone");
            break;
          }
          const on = a.do === "open";
          const tn = t.n;
          if (tn.type === "popup") {
            if (on) St(U("popup_open", "PopupOpen", "popup_open", [strq(tn.p.label || "popup", lang)]));
            else St(U("popup_close", "PopupClose", "popup_close", []));
          } else if (tn.type === "window" || tn.type === "modal") {
            if (gd && tn.type === "modal" && !on) ctx.warn(tn.id, where + ": godot-goome cant close a modal from code, esc or its X closes it");
            St(openSet(ctx, tn, on));
          } else ctx.warn("", where + ": can only open or close a window, modal or popup");
          break;
        }
        case "toast": {
          const t = textCode(ctx, a.text || "", {});
          St(U("toast", "Toast", "toast", [t.code, String(+a.ms > 0 ? a.ms | 0 : 2500)]));
          break;
        }
        case "tab": {
          const t = idx.get(a.target);
          if (!t || t.n.type !== "tabs") {
            ctx.warn("", where + ": the tab target has to be a tabs node");
            break;
          }
          const r = t.n.p.bind ? ctx.vars.get(t.n.p.bind) : ctx.refs.get(t.n.p.var);
          if (!r) break;
          St(r.code + " = " + (a.tab | 0));
          break;
        }
        case "copy": {
          const t = textCode(ctx, a.text || "", {});
          if (c) St("goome_clipboard_set(app, " + t.code + ")"), (ctx.need.app = true);
          else if (cs) St("ui.Goome.SetClipboard(" + t.code + ")");
          else if (jv) St("ui.goome().clipboard(" + t.code + ")");
          else if (gd) St("DisplayServer.clipboard_set(" + t.code + ")");
          else St("G.clipboard = " + t.code), (ctx.need.g = true);
          break;
        }
        case "quit":
          if (c) {
            ctx.need.app = true;
            out.add("{");
            out.add("    goome_event e = {0};");
            out.add("    e.type = GOOME_CLOSE;");
            out.add("    goome_push(app, &e);");
            out.add("}");
          } else if (cs) St("ui.Goome.Push(new Event(EventType.Close))");
          else if (jv) St("ui.goome().push(Event.of(Goome.CLOSE))");
          else if (gd) St("get_tree().quit()");
          else St("G.push(goome.CLOSE)"), (ctx.need.g = true);
          break;
        case "call": {
          const f = GM.ident(a.fn, "on_click");
          St((cs ? pascal(f) : jv ? camel(f) : gd ? gdFn(f) : f) + "()");
          break;
        }
        default:
          ctx.warn("", where + ": dont know the action " + a.do);
      }
    }
    if (!any && ind) out.add("pass");
  }

  function openRef(ctx, n) {
    const lang = ctx.lang;
    if (n.p.bind) {
      const r = ctx.vars.get(n.p.bind);
      if (r) return r.code;
    }
    const nm = ctx.nm.get(n.id) || GM.ident(n.p.var || n.type);
    if (n.type === "window") return lang === "c" ? nm + "_open" : lang === "cs" ? camel(nm) + "Open" : lang === "java" ? camel(nm) + ".open()" : lang === "gd" ? "ui.is_window_open(" + winTitle(ctx, n) + ")" : "s." + nm + ".open";
    return lang === "py" ? "s." + nm + ".value" : lang === "gd" ? "s." + nm : cam(lang) ? camel(nm) : nm;
  }
  function openSet(ctx, n, on) {
    const lang = ctx.lang, b = bool(on, lang);
    if (!n.p.bind || !ctx.vars.get(n.p.bind)) {
      if (n.type === "window" && lang === "java") return camel(ctx.nm.get(n.id) || GM.ident(n.p.var || n.type)) + ".open(" + b + ")";
      if (n.type === "window" && lang === "gd") return "ui.set_window_open(" + winTitle(ctx, n) + ", " + b + ")";
    }
    return openRef(ctx, n) + " = " + b;
  }
  function winTitle(ctx, n) {
    const t = textCode(ctx, n.p.label == null ? "" : n.p.label, { id: n.id });
    if (t.dyn) ctx.warn(n.id, "godot-goome keeps a window's spot by its title, a title with {vars} in it starts over each time the text changes");
    return t.code;
  }

  function emitNode(n, ctx, out, ptype) {
    const lang = ctx.lang, py = lang === "py" || lang === "gd";
    const go = () => styled(ctx, out, n.style, () => emitEnabled(n, ctx, out, ptype));
    if (n.p && n.p.showIf && String(n.p.showIf).trim()) {
      const e = exprCode(ctx, n.p.showIf, "b", "show if", n.id);
      if (e != null) {
        out.open(py ? "if " + e + ":" : "if (" + e + ")");
        go();
        out.close();
        return;
      }
    }
    go();
  }

  const VALUE_T = { checkbox: 1, toggle: 1, radio: 1, slider: 1, slider_int: 1, input: 1, text_edit: 1, combo: 1, selectable: 1, color: 1, tabs: 1, collapsing: 1, tree: 1 };
  function emitEnabled(n, ctx, out, ptype) {
    const lang = ctx.lang, c = lang === "c", cs = lang === "cs", jv = lang === "java", gd = lang === "gd", py = lang === "py" || gd;
    const src = n.p && n.p.enableIf && String(n.p.enableIf).trim();
    if (!src) return emitBare(n, ctx, out, ptype, null);
    const e = exprCode(ctx, src, "b", "enable if", n.id);
    if (e == null) return emitBare(n, ctx, out, ptype, null);
    const en = "en" + ++ctx.k;
    out.add(ctx.local("bool", en, e));
    const dim = c ? ["goome_ui_push_color(u, GOOME_S_TEXT, goome_ui_theme(u)->text_dim);", "goome_ui_push_color(u, GOOME_S_ACCENT, (goome_ui_theme(u)->accent & 0xFFFFFF) | (goome_ui_theme(u)->accent >> 25) << 24);"]
      : cs ? ["ui.PushColor(Style.Text, ui.Theme.TextDim);", "ui.PushColor(Style.Accent, (ui.Theme.Accent & 0xFFFFFFu) | (ui.Theme.Accent >> 25) << 24);"]
      : jv ? ["ui.pushColor(Style.TEXT, ui.theme().textDim());", "ui.pushColor(Style.ACCENT, (ui.theme().accent() & 0xFFFFFF) | (ui.theme().accent() >>> 25) << 24);"]
      : gd ? ['ui.push_color(GoomeUI.S_TEXT, ui.theme_get("text_dim"))', 'ui.push_color(GoomeUI.S_ACCENT, Color(ui.theme_get("accent"), ui.theme_get("accent").a * 0.5))']
      : ["ui.push_color(goome.S_TEXT, ui.theme.text_dim)", "ui.push_color(goome.S_ACCENT, (ui.theme.accent & 0xFFFFFF) | (ui.theme.accent >> 25) << 24)"];
    out.open(py ? "if not " + en + ":" : "if (!" + en + ")");
    dim.forEach((l) => out.add(l));
    out.close();
    let saved = null;
    if (VALUE_T[n.type]) {
      const r = bareRef(ctx, n);
      if (r) {
        const w = "was" + ctx.k;
        saved = { r, w };
        if (c && r.type === "string") out.add("char " + w + "[sizeof(" + r.code + ")];"), out.add("memcpy(" + w + ", " + r.code + ", sizeof(" + w + "));");
        else if (c) out.add((r.type === "float" ? "double " : r.type === "color" ? "uint32_t " : "int ") + w + " = " + r.code + ";");
        else if (cs || jv) out.add("var " + w + " = " + r.code + ";");
        else out.add(ctx.local("var", w, r.code));
      }
    }
    emitBare(n, ctx, out, ptype, en);
    out.open(py ? "if not " + en + ":" : "if (!" + en + ")");
    if (saved) {
      if (c && saved.r.type === "string") out.add("memcpy(" + saved.r.code + ", " + saved.w + ", sizeof(" + saved.w + "));");
      else out.add(saved.r.code + " = " + saved.w + (py ? "" : ";"));
    }
    out.add(c ? "goome_ui_pop(u, 2);" : cs ? "ui.Pop(2);" : jv ? "ui.pop(2);" : "ui.pop(2)");
    out.close();
  }

  function bareRef(ctx, n) {
    if (n.p.bind) return ctx.vars.get(n.p.bind) || null;
    if (!OWN_T[n.type]) return null;
    const nm = ctx.nm.get(n.id);
    if (!nm) return null;
    const lang = ctx.lang, id = cam(lang) ? camel(nm) : nm;
    if (ctx.scope) return { name: nm, code: ctx.v(nm), type: OWN_T[n.type] };
    return { name: nm, code: lang === "py" ? "s." + id + (FLAGGY[n.type] ? ".value" : "") : lang === "gd" ? "s." + id : id, type: OWN_T[n.type] };
  }

  function emitBare(n, ctx, out, ptype, en) {
    const lang = ctx.lang, p = n.p || {}, c = lang === "c", cs = lang === "cs", py = lang === "py", jv = lang === "java", gd = lang === "gd";
    const ind = py || gd, ret = py || jv || gd;
    const q = (s) => strq(s, lang);
    const call = (cfn, csfn, pyfn, args) => (c ? "goome_ui_" + cfn + "(" + ["u"].concat(args).join(", ") + ")" : cs ? "ui." + csfn + "(" + args.join(", ") + ")" : jv ? "ui." + camel(cfn || pyfn) + "(" + args.join(", ") + ")" : gd ? "ui." + (cfn || pyfn) + "(" + args.join(", ") + ")" : "ui." + pyfn + "(" + args.join(", ") + ")");
    const st = (s) => out.add(s + (ind ? "" : ";"));
    const nil = c ? "NULL" : cs || jv ? "null" : gd ? '""' : "None";
    const T_ = bool(true, lang), F_ = bool(false, lang);
    const NOT = ind ? "not " : "!";
    const CHANGED = py ? "ui.changed" : "ui.changed()";
    const nm = ctx.nm.get(n.id) || GM.ident(p.var || n.type);
    if (ptype === "overlay" && n.type !== "window" && n.type !== "el") {
      ctx.warn(n.id, "only windows and custom elements can sit on the overlay canvas, skipped");
      return;
    }
    const leaf = !GM.isContainer(n.type) && !["same_line", "space", "separator", "menu_item", "menu_sep", "el"].includes(n.type);
    if (leaf && +p.width > 0) st(call("width", "Width", "width", [num(p.width)]));
    if (n.abs && !isRoot(ptype)) {
      st(call("pos", "Pos", "pos", [num(n.abs.x), num(n.abs.y)]));
      if (+n.abs.w > 0 || +n.abs.h > 0) st(call("size", "Size", "size", [num(+n.abs.w > 0 ? n.abs.w : 0), num(+n.abs.h > 0 ? n.abs.h : 0)]));
    }
    const on = n.on || {};
    const has = (e) => Array.isArray(on[e]) && on[e].length > 0;
    const where = (e) => (p.label || n.type) + " " + e;
    const printLine = (txt) => (c ? "puts(" + q(txt) + ");" : cs ? "Console.WriteLine(" + q(txt) + ");" : jv ? "System.out.println(" + q(txt) + ");" : "print(" + q(txt) + ")");
    const ifActs = (cond, fill) => {
      out.open(ind ? "if " + cond + ":" : "if (" + cond + ")");
      fill();
      out.close();
    };
    const andEn = (cond) => (en ? cond + (ind ? " and " : " && ") + en : cond);
    const bound = (types) => {
      if (!p.bind) return null;
      const r = ctx.vars.get(p.bind);
      if (!r) {
        ctx.warn(n.id, "the bound var is gone, using its own var");
        return null;
      }
      if (ctx.scope) {
        ctx.warn(n.id, "widget parts inside a custom element cant bind a project var yet, using its own");
        return null;
      }
      if (types && !types.includes(r.type)) {
        ctx.warn(n.id, r.name + " is a " + r.type + " var, " + n.type + " cant use it, using its own var");
        return null;
      }
      return r;
    };
    const own = (kind, val, extra) => {
      ctx.decl(kind, nm, val, extra);
      return { name: nm, code: ctx.v(nm) + (py && kind === "flag" && !ctx.scope ? ".value" : ""), obj: ctx.v(nm), addr: ctx.addr(nm), type: kind };
    };
    const addrOf = (r) => (c ? "&" + r.code : cs ? "ref " + r.code : r.code);
    const holder = (type, suffix, init) => {
      const id = camel(ctx.uniq(nm + "_" + suffix));
      ctx.top.push("static final " + type + " " + id + " = new " + type + "(" + init + ");");
      return id;
    };
    const synced = (r, init, fill) => {
      const f = holder("Flag", "flag", init);
      st(f + ".set(" + r.code + ")");
      fill(f);
      return f;
    };
    const changeEvents = () => has("change") || has("on") || has("off");
    const fireChange = (ref) => {
      if (has("change")) emitActions(ctx, out, on.change, where("change"));
      if ((has("on") || has("off")) && ref) {
        if (has("on")) ifActs(ref.code, () => emitActions(ctx, out, on.on, where("on")));
        if (has("off")) ifActs(NOT + ref.code, () => emitActions(ctx, out, on.off, where("off")));
      }
      if (!has("change") && !has("on") && !has("off") && ind) out.add("pass");
    };
    const afterChange = (ref, cond) => {
      if (changeEvents()) ifActs(andEn(cond || CHANGED), () => fireChange(ref));
    };
    const valueWidget = (stmt, changedExpr, ref) => {
      if (ret) {
        out.add(stmt + (jv ? ";" : ""));
        afterChange(ref);
      } else if (changeEvents()) ifActs(andEn(changedExpr), () => fireChange(ref));
      else st(changedExpr);
    };
    const hover = () => {
      if (!has("hover")) return;
      const hv = ctx.uniq(nm + "_hot");
      if (c) ctx.top.push("static int " + hv + ";");
      else if (cs) ctx.top.push("bool " + camel(hv) + " = false;");
      else if (jv) ctx.top.push("static boolean " + camel(hv) + ";");
      else if (gd) ctx.top.push("var " + hv + ": bool = false");
      else ctx.top.push(hv + " = False");
      const hvc = c ? hv : cam(lang) ? camel(hv) : "s." + hv;
      const h = "h" + ++ctx.k;
      out.add(c ? "int " + h + " = goome_ui_hovered(u);" : cs ? "bool " + h + " = ui.Hovered;" : py ? h + " = ui.hovered" : ctx.local("bool", h, "ui.hovered()"));
      ifActs(h + (ind ? " and not " : " && !") + hvc, () => emitActions(ctx, out, on.hover, where("hover")));
      out.add(hvc + " = " + h + (ind ? "" : ";"));
    };
    const tooltip = () => {
      if (leaf && p.tooltip) st(call("tooltip", "Tooltip", "tooltip", [q(p.tooltip)]));
    };
    const label = (txt) => textCode(ctx, txt == null ? "" : txt, { id: n.id }).code;
    const elseIf = (cond, first) => {
      if (ind) out.open((first ? "if " : "elif ") + cond + ":");
      else if (first) out.open("if (" + cond + ")");
      else {
        out.l[out.l.length - 1] = out.l[out.l.length - 1] + " else if (" + cond + ") {";
        out.d++;
        out.marks.push(out.l.length);
      }
    };
    const loop = (len, body) => {
      if (gd) out.open("for i in range(" + len + "):");
      else out.open("for (int i = 0; i < " + len + "; i++)");
      body();
      out.close();
    };

    switch (n.type) {
      case "window": {
        if (ctx.scope) return ctx.warn(n.id, "windows cant go inside a custom element");
        const fl = flags(WFLAGS, p, lang);
        const b = bound(["bool"]);
        const needOpen = !!p.close || ctx.targets.has(n.id) || !!b;
        const title = label(p.label);
        if (c) {
          ctx.top.push("static double " + nm + "_x = " + num(p.x) + ", " + nm + "_y = " + num(p.y) + ", " + nm + "_w = " + num(p.w) + ", " + nm + "_h = " + num(p.h) + ";");
          if (needOpen && !b) ctx.top.push("static int " + nm + "_open = 1;");
          out.open("if (goome_ui_window(u, " + title + ", &" + nm + "_x, &" + nm + "_y, &" + nm + "_w, &" + nm + "_h, " + fl + ", " + (needOpen ? "&" + (b ? b.code : nm + "_open") : "NULL") + "))");
          emitList(n.kids[0], ctx, out, "window");
          out.close();
          st("goome_ui_window_end(u)");
        } else if (cs) {
          const id = camel(nm);
          ctx.top.push("double " + id + "X = " + num(p.x) + ", " + id + "Y = " + num(p.y) + ", " + id + "W = " + num(p.w) + ", " + id + "H = " + num(p.h) + ";");
          if (needOpen && !b) ctx.top.push("bool " + id + "Open = true;");
          out.open("if (ui.Window(" + title + ", ref " + id + "X, ref " + id + "Y, ref " + id + "W, ref " + id + "H, " + fl + (needOpen ? ", ref " + (b ? b.code : id + "Open") : "") + "))");
          emitList(n.kids[0], ctx, out, "window");
          out.close();
          st("ui.WindowEnd()");
        } else if (jv) {
          const id = camel(nm);
          ctx.top.push("static final Window " + id + " = new Window(" + [p.x, p.y, p.w, p.h].map(num).join(", ") + ");");
          if (b) st(id + ".open(" + b.code + ")");
          out.open("if (ui.window(" + title + ", " + id + ", " + fl + "))");
          emitList(n.kids[0], ctx, out, "window");
          out.close();
          st("ui.windowEnd()");
          if (b) st(b.code + " = " + id + ".open()");
        } else if (gd) {
          const key = needOpen ? winTitle(ctx, n) : title;
          const wrap = needOpen && !p.close;
          if (b) st("ui.set_window_open(" + key + ", " + b.code + ")");
          if (wrap) out.open("if ui.is_window_open(" + key + "):");
          out.open("if ui.window(" + title + ", Rect2(" + [p.x, p.y, p.w, p.h].map(num).join(", ") + "), " + fl + "):");
          emitList(n.kids[0], ctx, out, "window");
          out.close();
          st("ui.window_end()");
          if (wrap) out.close();
          if (b) st(b.code + " = ui.is_window_open(" + key + ")");
        } else {
          ctx.top.push(nm + " = goome.Window(" + [p.x, p.y, p.w, p.h].map(num).join(", ") + ")");
          if (b) out.add("s." + nm + ".open = " + b.code);
          out.open("with ui.window(" + title + ", s." + nm + ", " + fl + ") as shown:");
          out.open("if shown:");
          emitList(n.kids[0], ctx, out, "window");
          out.close();
          out.close();
          if (b) out.add(b.code + " = s." + nm + ".open");
        }
        return;
      }
      case "row": {
        const k = +p.cols > 0 ? +p.cols : n.kids[0].length;
        if (k >= 2) st(call("row", "Row", "row", [String(k)]));
        emitList(n.kids[0], ctx, out, "row");
        return;
      }
      case "same_line": return st(call("same_line", "SameLine", "same_line", []));
      case "space": return st(call("space", "Space", "space", [num(p.px)]));
      case "separator": return st(call("separator", "Separator", "separator", []));
      case "scroll": {
        const args = [q(nm), num(p.h)];
        if (py) {
          out.open("with ui.scroll_begin(" + args.join(", ") + "):");
          emitList(n.kids[0], ctx, out, "scroll");
          out.close();
        } else {
          st(call("scroll_begin", "ScrollBegin", "", args));
          emitList(n.kids[0], ctx, out, "scroll");
          st(call("scroll_end", "ScrollEnd", "", []));
        }
        return;
      }
      case "split": {
        if (py) {
          ctx.top.push(nm + " = goome.Split(" + num(p.frac) + ", " + bool(p.vertical, "py") + ")");
          out.open("with ui.split(" + q(nm) + ", s." + nm + ") as panes:");
          emitSlot(n, 0, ctx, out, "split");
          out.add("panes.next()");
          emitSlot(n, 1, ctx, out, "split");
          out.close();
        } else {
          if (jv) {
            const id = holder("Split", "split", num(+p.frac || 0.3) + ", " + bool(p.vertical, lang));
            st("ui.splitBegin(" + q(nm) + ", " + id + ")");
          } else if (gd) st("ui.split_begin(" + q(nm) + ", " + bool(p.vertical, lang) + ", " + num(+p.frac || 0.3) + ")");
          else {
            const fr = nm + "_frac";
            ctx.decl("double", fr, +p.frac || 0.3);
            st(call("split_begin", "SplitBegin", "", [q(nm), c ? (p.vertical ? "1" : "0") : bool(p.vertical, "cs"), ctx.addr(fr)]));
          }
          emitSlot(n, 0, ctx, out, "split");
          st(call("split_next", "SplitNext", "", []));
          emitSlot(n, 1, ctx, out, "split");
          st(call("split_end", "SplitEnd", "", []));
        }
        return;
      }
      case "tabs": {
        const li = listInfo(ctx, n);
        const items = li ? li.items : GM.lines(p.items);
        if (!items.length) items.push("Tab");
        const r = bound(["int"]) || own("int", Math.min(items.length - 1, Math.max(0, p.sel | 0)));
        const arr = li ? li.arr : ctx.constArr(nm + "_names", items);
        const len = li ? li.len : String(items.length);
        const tcall = c ? "goome_ui_tabs(u, " + q(nm) + ", " + arr + ", " + len + ", &" + r.code + ")" : cs ? "ui.Tabs(" + q(nm) + ", " + arr + ", ref " + r.code + ")" : null;
        const rs = py ? r.code + " = ui.tabs(" + q(nm) + ", " + arr + ", " + r.code + ")" : jv ? r.code + " = ui.tabs(" + q(nm) + ", " + r.code + ", " + arr + ")" : gd ? r.code + " = ui.tabs(" + q(nm) + ", " + arr + ", " + r.code + ")" : tcall;
        valueWidget(rs, tcall, r);
        let first = true;
        const k = Math.max(items.length, n.kids.length);
        for (let i = 0; i < k; i++) {
          const kids = n.kids[i] || [];
          if (!kids.length) continue;
          elseIf(r.code + " == " + i, first);
          emitSlot(n, i, ctx, out, "tabs");
          out.close();
          first = false;
        }
        return;
      }
      case "collapsing": {
        const r = bound(["bool"]) || own("bool", !!p.open);
        const ev = has("change");
        const w = ev ? "was" + ++ctx.k : null;
        if (ev) out.add(c ? "int " + w + " = " + r.code + ";" : ctx.local("bool", w, r.code));
        if (jv) {
          const sh = "open" + ++ctx.k;
          synced(r, bool(!!p.open, lang), (f) => {
            out.add(ctx.local("bool", sh, "ui.collapsing(" + label(p.label) + ", " + f + ")"));
            st(r.code + " = " + f + ".get()");
          });
          if (ev) ifActs(andEn(r.code + " != " + w), () => emitActions(ctx, out, on.change, where("change")));
          out.open("if (" + sh + ")");
        } else if (ind) {
          if (gd && p.bind) ctx.warn(n.id, "in godot the var only follows the section, setting it from code wont open or close it");
          out.add(r.code + " = ui.collapsing(" + label(p.label) + ", " + r.code + ")");
          if (ev) ifActs(andEn(r.code + " != " + w), () => emitActions(ctx, out, on.change, where("change")));
          out.open("if " + r.code + ":");
        } else {
          if (ev) {
            st(call("collapsing", "Collapsing", "", [label(p.label), addrOf(r)]));
            ifActs(andEn(r.code + " != " + w), () => emitActions(ctx, out, on.change, where("change")));
            out.open("if (" + r.code + ")");
          } else out.open("if (" + call("collapsing", "Collapsing", "", [label(p.label), addrOf(r)]) + ")");
        }
        emitList(n.kids[0], ctx, out, "collapsing");
        out.close();
        return;
      }
      case "tree": {
        const r = bound(["bool"]) || own(py ? "flag" : "bool", !!p.open);
        const obj = py ? (r.obj || r.code.replace(/\.value$/, "")) : null;
        const ev = has("change");
        const w = ev ? "was" + ++ctx.k : null;
        if (ev) out.add(c ? "int " + w + " = " + r.code + ";" : ctx.local("bool", w, r.code));
        if (py) {
          out.open("with ui.tree(" + label(p.label) + ", " + obj + ") as shown:");
          if (ev) ifActs(andEn(r.code + " != " + w), () => emitActions(ctx, out, on.change, where("change")));
          out.open("if shown:");
          emitList(n.kids[0], ctx, out, "tree");
          out.close();
          out.close();
        } else if (gd) {
          if (p.bind) ctx.warn(n.id, "in godot the var only follows the tree node, setting it from code wont open or close it");
          out.add(r.code + " = ui.tree(" + label(p.label) + ", " + r.code + ")");
          if (ev) ifActs(andEn(r.code + " != " + w), () => emitActions(ctx, out, on.change, where("change")));
          out.open("if " + r.code + ":");
          emitList(n.kids[0], ctx, out, "tree");
          st("ui.tree_end()");
          out.close();
        } else {
          const sh = "open" + (jv ? ++ctx.k : ctx.k);
          if (jv) {
            synced(r, bool(!!p.open, lang), (f) => {
              out.add(ctx.local("bool", sh, "ui.tree(" + label(p.label) + ", " + f + ")"));
              st(r.code + " = " + f + ".get()");
            });
            if (ev) ifActs(andEn(r.code + " != " + w), () => emitActions(ctx, out, on.change, where("change")));
            out.open("if (" + sh + ")");
          } else {
            const tc = call("tree", "Tree", "", [label(p.label), addrOf(r)]);
            if (ev) {
              out.add(c ? "int " + sh + " = " + tc + ";" : "bool " + sh + " = " + tc + ";");
              ifActs(andEn(r.code + " != " + w), () => emitActions(ctx, out, on.change, where("change")));
              out.open("if (" + sh + ")");
            } else out.open("if (" + tc + ")");
          }
          emitList(n.kids[0], ctx, out, "tree");
          st(call("tree_end", "TreeEnd", "", []));
          out.close();
        }
        return;
      }
      case "modal": {
        const b = bound(["bool"]);
        const r = b || own(py ? "flag" : "bool", false);
        const obj = py ? (b ? b.obj : r.obj) : null;
        if (py && b && !b.flag) ctx.warn(n.id, "python needs a goome.Flag for the modal, bind a var that only flags use");
        if (p.button) ifActs(call("button", "Button", "button", [label(p.button)]), () => out.add(r.code + " = " + T_ + (ind ? "" : ";")));
        if (py) {
          out.open("with ui.modal(" + label(p.label) + ", " + obj + ") as shown:");
          out.open("if shown:");
          emitList(n.kids[0], ctx, out, "modal");
          out.close();
          out.close();
        } else if (gd) {
          const t = label(p.label), m = "shown" + ++ctx.k;
          ifActs(r.code + " and not ui.is_modal_open(" + t + ")", () => st("ui.modal_open(" + t + ")"));
          out.add(ctx.local("bool", m, "ui.modal_begin(" + t + ")"));
          st(r.code + " = ui.is_modal_open(" + t + ")");
          out.open("if " + m + ":");
          emitList(n.kids[0], ctx, out, "modal");
          st("ui.modal_end()");
          out.close();
        } else if (jv) {
          const m = "shown" + ++ctx.k;
          synced(r, F_, (f) => {
            out.add(ctx.local("bool", m, "ui.modalBegin(" + label(p.label) + ", " + f + ")"));
            st(r.code + " = " + f + ".get()");
          });
          out.open("if (" + m + ")");
          emitList(n.kids[0], ctx, out, "modal");
          st("ui.modalEnd()");
          out.close();
        } else {
          out.open("if (" + call("modal_begin", "ModalBegin", "", [label(p.label), addrOf(r)]) + ")");
          emitList(n.kids[0], ctx, out, "modal");
          st(call("modal_end", "ModalEnd", "", []));
          out.close();
        }
        return;
      }
      case "popup": {
        const id = q(p.label || "popup");
        const b = bound(["bool"]);
        if (b) ifActs(b.code, () => {
          st(call("popup_open", "PopupOpen", "popup_open", [id]));
          out.add(b.code + " = " + F_ + (ind ? "" : ";"));
        });
        if (py) {
          out.open("with ui.popup(" + id + ") as shown:");
          out.open("if shown:");
          emitList(n.kids[0], ctx, out, "popup");
          out.close();
          out.close();
        } else {
          out.open(ind ? "if " + call("popup_begin", "", "", [id]) + ":" : "if (" + call("popup_begin", "PopupBegin", "", [id]) + ")");
          emitList(n.kids[0], ctx, out, "popup");
          st(call("popup_end", "PopupEnd", "", []));
          out.close();
        }
        return;
      }
      case "menubar":
      case "menu": {
        const mb = n.type === "menubar";
        if (py) {
          out.open("with " + (mb ? "ui.menubar()" : "ui.menu(" + label(p.label) + ")") + " as shown:");
          out.open("if shown:");
          emitList(n.kids[0], ctx, out, n.type);
          out.close();
          out.close();
        } else {
          const b = mb ? call("menubar_begin", "MenuBarBegin", "", []) : call("menu_begin", "MenuBegin", "", [label(p.label)]);
          out.open(ind ? "if " + b + ":" : "if (" + b + ")");
          emitList(n.kids[0], ctx, out, n.type);
          st(mb ? call("menubar_end", "MenuBarEnd", "", []) : call("menu_end", "MenuEnd", "", []));
          out.close();
        }
        return;
      }
      case "menu_item": {
        const sc = p.shortcut ? q(p.shortcut) : nil;
        const b = p.check || p.bind ? bound(["bool"]) : null;
        if (p.check || b) {
          const r = b || own(py ? "flag" : "bool", !!p.on);
          const obj = py ? (b ? b.obj : r.obj) : null;
          if (py && b && !b.flag) ctx.warn(n.id, "python needs a goome.Flag for a checked menu item");
          if (jv) {
            const k = "picked" + ++ctx.k;
            synced(r, bool(!!p.on, lang), (f) => {
              out.add(ctx.local("bool", k, "ui.menuItem(" + label(p.label) + ", " + sc + ", " + f + ")"));
              st(r.code + " = " + f + ".get()");
            });
            if (has("click")) ifActs(andEn(k), () => emitActions(ctx, out, on.click, where("click")));
          } else if (gd) {
            out.add(r.code + " = ui.menu_check(" + label(p.label) + ", " + r.code + ", " + sc + ")");
            if (has("click")) ifActs(andEn(CHANGED), () => emitActions(ctx, out, on.click, where("click")));
          } else {
            const cl = c ? "goome_ui_menu_item(u, " + label(p.label) + ", " + sc + ", &" + r.code + ")" : cs ? "ui.MenuItem(" + label(p.label) + ", " + sc + ", ref " + r.code + ")" : "ui.menu_item(" + label(p.label) + ", " + sc + ", " + obj + ")";
            if (has("click")) ifActs(andEn(cl), () => emitActions(ctx, out, on.click, where("click")));
            else st(cl);
          }
        } else {
          const args = [label(p.label)].concat(c ? [sc, "NULL"] : p.shortcut ? [sc] : []);
          ifActs(andEn(call("menu_item", "MenuItem", "menu_item", args)), () => {
            if (has("click")) emitActions(ctx, out, on.click, where("click"));
            else out.add(printLine(p.label + " clicked"));
          });
        }
        return;
      }
      case "menu_sep": return st(call("menu_separator", "MenuSeparator", "menu_separator", []));
      case "label": {
        if (c) {
          const t = textCode(ctx, p.label, { printf: true, id: n.id });
          st("goome_ui_label(u, " + (t.printf ? t.code : strq(String(p.label).replace(/%/g, "%%"), "c")) + ")");
        } else st(call("", "Label", "label", [label(p.label)]));
        hover();
        break;
      }
      case "heading": st(call("heading", "Heading", "heading", [label(p.label)])); hover(); break;
      case "wrapped": st(call("wrapped", "Wrapped", "wrapped", [label(p.label)])); break;
      case "button": {
        ifActs(andEn(call("button", "Button", "button", [label(p.label)])), () => {
          if (has("click")) return emitActions(ctx, out, on.click, where("click"));
          if (p.action === "toast") st(call("toast", "Toast", "toast", [label(p.toast), String(p.ms | 0)]));
          else if (p.action === "close") st(call("popup_close", "PopupClose", "popup_close", []));
          else out.add(printLine(p.label + " clicked"));
        });
        hover();
        break;
      }
      case "checkbox":
      case "toggle": {
        const r = bound(["bool"]) || own("bool", !!p.on);
        const f = n.type, F = f === "checkbox" ? "Checkbox" : "Toggle";
        const cl = c ? "goome_ui_" + f + "(u, " + label(p.label) + ", &" + r.code + ")" : cs ? "ui." + F + "(" + label(p.label) + ", ref " + r.code + ")" : null;
        valueWidget(ret ? r.code + " = ui." + f + "(" + label(p.label) + ", " + r.code + ")" : cl, cl, r);
        hover();
        break;
      }
      case "radio": {
        const li = listInfo(ctx, n);
        const items = li ? li.items : GM.lines(p.items);
        const r = bound(["int"]) || own("int", p.sel | 0);
        const ev = changeEvents();
        const ch = ev ? "ch" + ++ctx.k : null;
        if (ev) out.add(c ? "int " + ch + " = 0;" : py ? ch + " = False" : ctx.local("bool", ch, F_));
        const one = (lab, i) => {
          if (ret) {
            out.add(r.code + " = ui.radio(" + lab + ", " + r.code + ", " + i + ")" + (jv ? ";" : ""));
            if (ev) out.add(jv ? ch + " |= ui.changed();" : ch + " = " + ch + " or " + CHANGED);
          } else {
            const cl = call("radio", "Radio", "", [lab, addrOf(r), String(i)]);
            st(ev ? ch + " |= " + cl : cl);
          }
        };
        if (li) {
          if (py) out.open("for i, item in enumerate(" + li.arr + "):");
          else if (gd) out.open("for i in range(" + li.len + "):");
          else out.open("for (int i = 0; i < " + li.len + "; i++)");
          if (p.inline) ifActs(cs || jv ? "i > 0" : "i", () => st(call("same_line", "SameLine", "same_line", [])));
          one(py ? "item" : li.arr + "[i]", "i");
          out.close();
        } else
          items.forEach((it, i) => {
            if (i && p.inline) st(call("same_line", "SameLine", "same_line", []));
            one(q(it), i);
          });
        if (ev) ifActs(andEn(ch), () => fireChange(r));
        break;
      }
      case "slider": {
        const b = bound(["float", "int"]);
        const fmt = p.fmt ? q(p.fmt) : nil;
        if (b && b.type === "int") {
          const cl = c ? "goome_ui_slider_int(u, " + [label(p.label), "&" + b.code, Math.round(p.min), Math.round(p.max)].join(", ") + ")" : cs ? "ui.SliderInt(" + [label(p.label), "ref " + b.code, Math.round(p.min), Math.round(p.max)].join(", ") + ")" : null;
          valueWidget(ret ? b.code + " = " + call("slider_int", "", "slider_int", [label(p.label), b.code, Math.round(p.min), Math.round(p.max)]) : cl, cl, b);
        } else {
          const r = b || own("double", +p.value || 0);
          const fl = (v) => (Number.isInteger(+v) ? num(v) + ".0" : num(v));
          const cl = c || cs ? call("slider", "Slider", "", [label(p.label), addrOf(r), num(p.min), num(p.max), fmt]) : null;
          valueWidget(ret ? r.code + " = ui.slider(" + [label(p.label), r.code, fl(p.min), fl(p.max), fmt].join(", ") + ")" : cl, cl, r);
        }
        hover();
        break;
      }
      case "slider_int": {
        const r = bound(["int"]) || own("int", Math.round(+p.value || 0));
        const args = [String(Math.round(p.min)), String(Math.round(p.max))];
        const cl = c || cs ? call("slider_int", "SliderInt", "", [label(p.label), addrOf(r)].concat(args)) : null;
        valueWidget(ret ? r.code + " = " + call("slider_int", "", "slider_int", [label(p.label), r.code].concat(args)) : cl, cl, r);
        hover();
        break;
      }
      case "input": {
        const cap = Math.max(2, p.cap | 0 || 64);
        const b = bound(["string"]);
        if (ctx.scope && !b) return ctx.warn(n.id, "text boxes cant keep their text in goome_ui_store, skipped");
        const r = b || own("str", p.text || "", cap);
        const fp = Object.assign({}, p, { enter: !!p.enter || has("enter") });
        const capS = String(b ? b.cap : cap);
        if (!IFLAGS.some((f) => fp[f[0]]) && !p.hint) {
          const cl = c ? "goome_ui_input(u, " + label(p.label) + ", " + r.code + ", sizeof(" + r.code + "))" : cs ? "ui.Input(" + label(p.label) + ", ref " + r.code + ", " + capS + ")" : null;
          valueWidget(ret ? r.code + " = ui.input(" + label(p.label) + ", " + r.code + ", " + capS + ")" : cl, cl, r);
          hover();
          break;
        }
        const fl = flags(IFLAGS, fp, lang), hint = p.hint ? q(p.hint) : nil;
        const cl = c ? "goome_ui_input_ex(u, " + label(p.label) + ", " + r.code + ", sizeof(" + r.code + "), " + fl + ", " + hint + ")" : cs ? "ui.InputEx(" + label(p.label) + ", ref " + r.code + ", " + fl + ", " + hint + ", " + capS + ")" : null;
        const pyS = py ? r.code + " = ui.input_ex(" + label(p.label) + ", " + r.code + ", " + fl + ", " + hint + ", " + capS + ")"
          : r.code + " = " + call("input_ex", "", "", [label(p.label), r.code, capS, fl, hint]);
        if (ret) {
          out.add(pyS + (jv ? ";" : ""));
          afterChange(r, fp.enter && !py ? CHANGED + (ind ? " and not " : " && !") + "ui.entered()" : null);
          if (has("enter")) ifActs(andEn(py ? "ui.entered" : "ui.entered()"), () => emitActions(ctx, out, on.enter, where("enter")));
          hover();
          break;
        }
        if (!has("enter")) {
          valueWidget(fp.enter ? "(" + cl + ") == 1" : cl, fp.enter ? "(" + cl + ") == 1" : cl, r);
          hover();
          break;
        }
        const k = "k" + ++ctx.k;
        out.add("int " + k + " = " + cl + ";");
        if (changeEvents()) ifActs(andEn(k + " == 1"), () => fireChange(r));
        ifActs(andEn(k + " == 2"), () => emitActions(ctx, out, on.enter, where("enter")));
        hover();
        break;
      }
      case "text_edit": {
        const cap = Math.max(2, p.cap | 0 || 4096);
        const b = bound(["string"]);
        if (ctx.scope && !b) return ctx.warn(n.id, "text boxes cant keep their text in goome_ui_store, skipped");
        const r = b || own("str", p.text || "", cap);
        const fl2 = flags(EFLAGS, p, lang);
        const capN = b ? b.cap : cap;
        if (jv) {
          const buf = holder("TextBuffer", "buf", capN);
          out.add("if (!" + buf + ".text().equals(" + r.code + ")) " + buf + ".text(" + r.code + ");");
          out.add("if (ui.textEdit(" + q(nm) + ", " + buf + ", " + num(p.h) + ", " + fl2 + ")) " + r.code + " = " + buf + ".text();");
          afterChange(r);
          break;
        }
        const cl = c ? "goome_ui_text_edit(u, " + q(nm) + ", " + r.code + ", sizeof(" + r.code + "), " + num(p.h) + ", " + fl2 + ")" : cs ? "ui.TextEdit(" + q(nm) + ", ref " + r.code + ", " + num(p.h) + ", " + fl2 + ", " + capN + ")" : null;
        valueWidget(py ? r.code + " = ui.text_edit(" + q(nm) + ", " + r.code + ", " + num(p.h) + ", " + fl2 + ", cap=" + capN + ")" : gd ? r.code + " = ui.text_edit(" + q(nm) + ", " + r.code + ", " + num(p.h) + ", " + fl2 + ")" : cl, cl, r);
        break;
      }
      case "combo": {
        const li = listInfo(ctx, n);
        const items = li ? li.items : GM.lines(p.items);
        const r = bound(["int"]) || own("int", p.sel | 0);
        const arr = li ? li.arr : ctx.constArr(nm + "_items", items.length ? items : [""]);
        const len = li ? li.len : String(Math.max(1, items.length));
        const cl = c ? "goome_ui_combo(u, " + label(p.label) + ", &" + r.code + ", " + arr + ", " + len + ")" : cs ? "ui.Combo(" + label(p.label) + ", ref " + r.code + ", " + arr + ")" : null;
        valueWidget(ret ? r.code + " = ui.combo(" + label(p.label) + ", " + r.code + ", " + arr + ")" : cl, cl, r);
        hover();
        break;
      }
      case "selectable": {
        const li = listInfo(ctx, n);
        const items = li ? li.items : GM.lines(p.items);
        const r = bound(["int"]) || own("int", p.sel | 0);
        const arr = li ? li.arr : ctx.constArr(nm + "_items", items.length ? items : ["Item"]);
        const len = li ? li.len : c ? String(Math.max(1, items.length)) : jv ? arr + ".length" : gd ? arr + ".size()" : arr + ".Length";
        const v = r.code;
        const ev = changeEvents();
        const pick = () => {
          out.add(v + " = i" + (ind ? "" : ";"));
          if (ev && en) ifActs(en, () => fireChange(r));
          else if (ev) fireChange(r);
        };
        if (py) {
          out.open("for i, item in enumerate(" + arr + "):");
          ifActs("ui.selectable(item, " + v + " == i)", pick);
          out.close();
        } else loop(len, () => ifActs(call("selectable", "Selectable", "", [arr + "[i]", v + " == i"]), pick));
        break;
      }
      case "color": {
        const r = bound(["color"]) || own("color", p.color >>> 0);
        const cl = c || cs ? call("color", "Color", "", [label(p.label), addrOf(r)]) : null;
        valueWidget(ret ? r.code + " = ui.color(" + label(p.label) + ", " + r.code + ")" : cl, cl, r);
        hover();
        break;
      }
      case "progress": {
        const b = bound(["float", "int"]);
        let val = num(p.value);
        if (b) {
          const lo = +b.v.min, hi = +b.v.max;
          val = hi > lo && !(lo === 0 && hi === 1) ? (lo ? par(minus(b.code, num(lo))) : b.code) + " / " + num(hi - lo) : b.code;
          if (b.type === "int" && !py) {
            const top = hi > lo ? par(lo ? minus(b.code, num(lo)) : b.code) : b.code;
            val = (gd ? "float(" + top.replace(/^\((.*)\)$/, "$1") + ")" : "(double)" + top) + (hi > lo ? " / " + num(hi - lo) : "");
          }
        }
        st(call("progress", "Progress", "progress", [val, p.label ? label(p.label) : nil]));
        hover();
        break;
      }
      case "table":
      case "plot_lines":
      case "plot_bars":
      case "image": {
        emitData(n, ctx, out, nm);
        if (n.type === "image") hover();
        break;
      }
      case "el": {
        emitInstance(n, ctx, out, ptype);
        return;
      }
      default:
        ctx.warn(n.id, "dont know how to export " + n.type);
        return;
    }
    tooltip();
  }

  function emitData(n, ctx, out, nm) {
    const lang = ctx.lang, p = n.p || {}, c = lang === "c", cs = lang === "cs", py = lang === "py", jv = lang === "java", gd = lang === "gd";
    const q = (s) => strq(s, lang);
    const st = (s) => out.add(s + (py || gd ? "" : ";"));
    switch (n.type) {
      case "table": {
        const cols = GM.lines(p.cols).map((x) => {
          const m = /^(.*?)(?::\s*(\d+(?:\.\d+)?))?$/.exec(x);
          return [m[1].trim(), m[2] ? +m[2] : 0];
        });
        if (!cols.length) cols.push(["Column", 0]);
        const rows = GM.lines(p.rows).map((r) => {
          const cells = r.split(",").map((x) => x.trim());
          while (cells.length < cols.length) cells.push("");
          return cells.slice(0, cols.length);
        });
        const fl3 = flags(TFLAGS, p, lang);
        const k = cols.length;
        if (py) {
          const id = nm.toUpperCase() + "_ROWS";
          ctx.consts.push(id + " = [" + rows.map((r) => "[" + r.map((x) => strq(x, "py")).join(", ") + "]").join(", ") + "]");
          out.open("with ui.table(" + [q(nm), k, num(p.h), fl3].join(", ") + ") as t:");
          out.open("if t:");
          cols.forEach((cl) => out.add("t.column(" + q(cl[0]) + ", " + num(cl[1]) + ")"));
          out.open("for row in " + id + ":");
          out.add("t.row()");
          out.open("for j, cell in enumerate(row):");
          out.add("if j:");
          out.add("    t.next()");
          out.add("ui.label(cell)");
          out.close();
          out.close();
          out.close();
          out.close();
        } else if (gd) {
          const id = nm.toUpperCase() + "_ROWS";
          ctx.consts.push("const " + id + " = [" + rows.map((r) => "[" + r.map((x) => strq(x, "gd")).join(", ") + "]").join(", ") + "]");
          out.open("if ui.table_begin(" + [q(nm), k, num(p.h), fl3].join(", ") + "):");
          cols.forEach((cl) => out.add("ui.table_column(" + q(cl[0]) + ", " + num(cl[1]) + ")"));
          out.open("for row in " + id + ":");
          out.add("ui.table_row()");
          out.open("for j in range(row.size()):");
          out.add("if j > 0:");
          out.add("    ui.table_next()");
          out.add("ui.label(row[j])");
          out.close();
          out.close();
          out.close();
          out.add("ui.table_end()");
        } else if (c) {
          const id = nm + "_cells";
          ctx.consts.push("static const char *const " + id + "[] = {" + (rows.length ? [].concat(...rows).map((x) => strq(x, "c")).join(", ") : '""') + "};");
          out.open("if (goome_ui_table_begin(u, " + [q(nm), k, num(p.h), fl3].join(", ") + "))");
          cols.forEach((cl) => out.add("goome_ui_table_column(u, " + q(cl[0]) + ", " + num(cl[1]) + ");"));
          if (rows.length) {
            out.open("for (int i = 0; i < " + rows.length + "; i++)");
            out.add("goome_ui_table_row(u);");
            out.open("for (int j = 0; j < " + k + "; j++)");
            out.add("if (j) goome_ui_table_next(u);");
            out.add('goome_ui_label(u, "%s", ' + id + "[i * " + k + " + j]);");
            out.close();
            out.close();
          }
          out.close();
          out.add("goome_ui_table_end(u);");
        } else {
          const id = camel(nm) + "Rows";
          if (jv) ctx.consts.push("static final String[][] " + id + " = {" + rows.map((r) => "{" + r.map((x) => strq(x, "cs")).join(", ") + "}").join(", ") + "};");
          else ctx.consts.push("string[][] " + id + " = { " + rows.map((r) => "new[] { " + r.map((x) => strq(x, "cs")).join(", ") + " }").join(", ") + " };");
          const U = (f) => "ui." + (jv ? f.replace(/^./, (x) => x.toLowerCase()) : f);
          out.open("if (" + U("TableBegin") + "(" + [q(nm), k, num(p.h), fl3].join(", ") + "))");
          cols.forEach((cl) => out.add(U("TableColumn") + "(" + q(cl[0]) + ", " + num(cl[1]) + ");"));
          out.open(jv ? "for (String[] row : " + id + ")" : "foreach (var row in " + id + ")");
          out.add(U("TableRow") + "();");
          out.open("for (int j = 0; j < row." + (jv ? "length" : "Length") + "; j++)");
          out.add("if (j > 0) " + U("TableNext") + "();");
          out.add(U("Label") + "(row[j]);");
          out.close();
          out.close();
          out.close();
          out.add(U("TableEnd") + "();");
        }
        break;
      }
      case "plot_lines":
      case "plot_bars": {
        const vals = floats(p.values);
        ctx.decl("floats", nm, vals);
        const f = n.type;
        if (c) st("goome_ui_" + f + "(u, " + [q(p.label), ctx.v(nm), Math.max(1, vals.length), num(p.min), num(p.max), num(p.h)].join(", ") + ")");
        else if (cs) st("ui." + (f === "plot_lines" ? "PlotLines" : "PlotBars") + "(" + [q(p.label), ctx.v(nm), num(p.min), num(p.max), num(p.h)].join(", ") + ")");
        else st("ui." + (jv ? camel(f) : f) + "(" + [q(p.label), ctx.v(nm), num(p.min), num(p.max), num(p.h)].join(", ") + ")");
        break;
      }
      case "image": {
        if (gd) {
          ctx.warn(n.id, "godot-goome has no image widget, a grey box takes its place");
          const it = "pic" + ++ctx.k;
          out.add(ctx.local("var", it, "ui.custom(" + q(nm) + ", " + num(p.w) + ", " + num(p.h) + ", GoomeUI.ITEM_NO_HIT)"));
          out.add("ui.draw_rect(" + it + ".rect, " + hex(0xFF3A3F48, "gd") + ", " + num(p.radius) + ")");
          break;
        }
        ctx.need.placeholder = true;
        if (c) st("goome_ui_image(u, &placeholder, " + [num(p.w), num(p.h), num(p.radius)].join(", ") + ")");
        else if (cs) st("ui.Image(placeholder, " + [num(p.w), num(p.h), num(p.radius)].join(", ") + ")");
        else if (jv) st("ui.image(placeholder, " + [num(p.w), num(p.h), num(p.radius)].join(", ") + ")");
        else out.add("ui.image(PLACEHOLDER, " + [num(p.w), num(p.h), num(p.radius)].join(", ") + ")");
        break;
      }
    }
  }

  function elInfo(ctx, def) {
    let e = ctx.used.get(def.id);
    if (!e) {
      e = { def };
      ctx.used.set(def.id, e);
    }
    return e;
  }

  function litOf(type, v, lang) {
    if (type === "color") return hex(v, lang);
    if (type === "bool") return bool(!!v, lang);
    if (type === "text") return strq(v == null ? "" : v, lang);
    return num(v);
  }

  const hasValue = (def) => !!(def.value && def.value.src && def.value.src !== "none");

  function emitInstance(n, ctx, out, ptype) {
    const lang = ctx.lang, p = n.p, c = lang === "c", cs = lang === "cs", py = lang === "py", jv = lang === "java", gd = lang === "gd";
    const ind = py || gd;
    const def = ctx.defs.get(p.el);
    if (!def) return ctx.warn(n.id, "this custom element is gone from the library, skipped");
    if (ctx.scope) return ctx.warn(n.id, "custom elements cant go inside custom elements yet");
    const nm = ctx.nm.get(n.id) || GM.ident(p.var || def.name);
    elInfo(ctx, def);
    if (ptype === "overlay") out.add(c ? "goome_ui_pos(u, " + num(p.x) + ", " + num(p.y) + ");" : cs ? "ui.Pos(" + num(p.x) + ", " + num(p.y) + ");" : jv ? "ui.pos(" + num(p.x) + ", " + num(p.y) + ");" : "ui.pos(" + num(p.x) + ", " + num(p.y) + ")");
    const args = def.params.map((pr) => litOf(pr.type, p.params && pr.name in p.params ? p.params[pr.name] : pr.def, lang));
    const w = +p.w || def.w, h = +p.h || def.h;
    let own = w !== def.w || h !== def.h;
    const sv = def.state.map((s) => {
      const v = p.init && s.name in p.init ? p.init[s.name] : s.def;
      if (v !== s.def) own = true;
      return s.type === "bool" ? (v ? 1 : 0) : +v || 0;
    });
    let init = c ? "NULL" : cs || jv ? "null" : "";
    if (own) {
      const vals = [w, h].concat(sv).map(num);
      if (c) {
        ctx.consts.push("static const double " + nm + "_init[] = {" + vals.join(", ") + "};");
        init = nm + "_init";
      } else if (cs) {
        ctx.consts.push("double[] " + camel(nm) + "Init = { " + vals.join(", ") + " };");
        init = camel(nm) + "Init";
      } else if (jv) {
        ctx.consts.push("static final double[] " + camel(nm) + "Init = {" + vals.join(", ") + "};");
        init = camel(nm) + "Init";
      } else if (gd) init = "[" + vals.join(", ") + "]";
      else init = "init=(" + vals.join(", ") + ")";
    }
    const fn = c ? def.name + "_el" : cs ? pascal(def.name) : jv ? camel(def.name) + "El" : def.name + "_el";
    const val = hasValue(def);
    const on = n.on || {};
    const evk = ["click", "change", "dragend", "hover"].filter((e) => Array.isArray(on[e]) && on[e].length);
    const info = ctx.used.get(def.id);
    if (evk.length) info.mask = true;
    const m = evk.length ? "m" + ++ctx.k : null;
    let callS;
    if (c) {
      const a = ["u", strq(nm, "c")].concat(args, [init]);
      if (val) {
        ctx.top.push("static double " + nm + "_value;");
        a.push("&" + nm + "_value");
      }
      callS = fn + "(" + a.join(", ") + ")";
      out.add((m ? "int " + m + " = " : "") + callS + ";");
    } else if (cs) {
      const a = ["ui", strq(nm, "cs")].concat(args, [own ? init : "null"]);
      if (val) {
        ctx.top.push("double " + camel(nm) + "Value = 0;");
        a.push("out " + camel(nm) + "Value");
      }
      callS = fn + "(" + a.join(", ") + ")";
      out.add((m ? "int " + m + " = " : "") + callS + ";");
    } else if (jv) {
      const a = ["ui", strq(nm, "cs")].concat(args, [own ? init : "null"]);
      if (val) {
        ctx.top.push("static final double[] " + camel(nm) + "Value = new double[1];");
        a.push(camel(nm) + "Value");
      }
      callS = fn + "(" + a.join(", ") + ")";
      out.add((m ? "int " + m + " = " : "") + callS + ";");
    } else if (gd) {
      const a = ["ui", strq(nm, "gd")].concat(args, [own ? init : "null"]);
      callS = fn + "(" + a.join(", ") + ")";
      if (val) {
        ctx.top.push("var " + nm + "_value: float = 0.0");
        const r = "got" + ++ctx.k;
        out.add("var " + r + ": Array = " + callS);
        if (m) out.add("var " + m + ": int = " + r + "[0]");
        out.add("s." + nm + "_value = " + r + "[1]");
      } else out.add((m ? "var " + m + ": int = " : "") + callS);
    } else {
      const a = ["ui", strq(nm, "py")].concat(args);
      if (own) a.push(init);
      callS = fn + "(" + a.join(", ") + ")";
      if (val) {
        ctx.top.push(nm + "_value = 0.0");
        out.add((m ? m : "_") + ", s." + nm + "_value = " + callS);
      } else out.add((m ? m + " = " : "") + callS);
    }
    if (m) {
      const bit = { change: 1, click: 2, dragend: 4 };
      for (const e of ["change", "click", "dragend"]) {
        if (!evk.includes(e)) continue;
        out.open(ind ? "if " + m + " & " + bit[e] + ":" : cs || jv ? "if ((" + m + " & " + bit[e] + ") != 0)" : "if (" + m + " & " + bit[e] + ")");
        emitActions(ctx, out, on[e], def.name + " " + e);
        out.close();
      }
      if (evk.includes("hover")) {
        const hv = ctx.uniq(nm + "_hot");
        if (c) ctx.top.push("static int " + hv + ";");
        else if (cs) ctx.top.push("bool " + camel(hv) + " = false;");
        else if (jv) ctx.top.push("static boolean " + camel(hv) + ";");
        else if (gd) ctx.top.push("var " + hv + ": bool = false");
        else ctx.top.push(hv + " = False");
        const hvc = c ? hv : cam(lang) ? camel(hv) : "s." + hv;
        const hb = py ? "bool(" + m + " & 8)" : gd ? "(" + m + " & 8) != 0" : "(" + m + " & 8) != 0";
        out.open(ind ? "if " + m + " & 8 and not " + hvc + ":" : cs || jv ? "if ((" + m + " & 8) != 0 && !" + hvc + ")" : "if ((" + m + " & 8) && !" + hvc + ")");
        emitActions(ctx, out, on.hover, def.name + " hover");
        out.close();
        out.add(hvc + " = " + hb + (ind ? "" : ";"));
      }
    }
  }

  function elementCode(ctx, info) {
    const lang = ctx.lang, def = info.def, c = lang === "c", cs = lang === "cs", py = lang === "py", jv = lang === "java", gd = lang === "gd";
    const ind = py || gd, brace = cs || jv;
    const warn = (msg, id) => ctx.warn(id || def.id, def.name + ": " + msg);
    const types = GM.elementIdents(def);
    const groups = GM.dragGroups(def);
    const rs = !!(def.resizable && def.resizable.on);
    const builtin = new Set(["w", "h", "value", "hovered", "pressed", "dragging"]);
    const prNames = new Set(def.params.map((x) => x.name));
    for (const s of def.state) if (builtin.has(s.name)) warn("state " + s.name + " clashes with a built in name");
    for (const s of def.params) if (builtin.has(s.name) || def.state.some((x) => x.name === s.name)) warn("param " + s.name + " clashes with another name");

    const scope = { slots: [], alias: {}, prefix: def.name };
    const wout = new Out(ind);
    {
      const local = new Map();
      const used = new Set(["s", "c", "o", "el", "box", "rs", "ox", "oy", "th", "u", "ui", "id", "sid", "sb", "init", "value", "changed", "hovered", "pressed", "dragging", "clicked", "released", "pressed_now", "nx", "ny"].concat([...prNames]));
      GM.walkParts(def.parts, (pt) => {
        if (pt.kind !== "widget" || !pt.w) return;
        const b = GM.ident(pt.w.p && pt.w.p.var ? pt.w.p.var : pt.w.type);
        let k = b, i = 2;
        while (used.has(k)) k = b + i++;
        used.add(k);
        local.set(pt.w.id, k);
      });
      const saveNm = ctx.nm;
      ctx.nm = local;
      ctx.scope = scope;
      GM.walkParts(def.parts, (pt) => {
        if (pt.kind !== "widget" || !pt.w) return;
        const t = pt.w.type;
        if (GM.isContainer(t) || t === "window" || t === "el") warn("widget parts can only be simple widgets, skipped a " + t, pt.id);
        else if (t === "input" || t === "text_edit") warn("text boxes cant keep their text in goome_ui_store, skipped " + t, pt.id);
        else emitNode(pt.w, ctx, wout, "element");
      });
      ctx.scope = null;
      ctx.nm = saveNm;
    }

    const idx = {};
    let N = 0;
    const slot = (k) => (idx[k] = N++);
    ["init", "w", "h", "value", "hot"].forEach(slot);
    def.state.forEach((st) => slot("s:" + st.name));
    groups.forEach((g) => {
      const gv = GM.partVar(g);
      [gv + "_dx", gv + "_dy", gv + "_sx", gv + "_sy"].forEach(slot);
    });
    if (rs) slot("rw"), slot("rh");
    scope.slots.forEach((w) => slot("w:" + w.name));
    const S = (k) => "s[" + idx[k] + "]";
    const idc = (name) => (cam(lang) ? camel(name) : name);
    const map = {
      id: (name) => {
        if (prNames.has(name)) return idc(name);
        if (name === "w" || name === "h" || name === "value") return S(name);
        if (name === "hovered" || name === "pressed" || name === "dragging") return name;
        const st = def.state.find((x) => x.name === name);
        if (st) return brace && st.type === "bool" ? "(" + S("s:" + name) + " != 0)" : S("s:" + name);
        if (idx[name] != null) return S(name);
        return name;
      },
      th: (f) => (c ? "th->" + f : cs ? "th." + THC[f] : jv ? "th." + camel(f) + "()" : gd ? thCode("gd", f, "ui") : "th." + f),
    };
    const ex = (src, want, where) => {
      if (src === "" || src == null) return want === "c" ? hex(0, lang) : "0";
      let r;
      if (typeof src === "number" && want === "c") r = { ok: true, ast: { t: "hex", v: src >>> 0 } };
      else r = GM.expr.check(src, types, want);
      if (!r.ok) {
        warn(where + ": " + r.err);
        return want === "c" ? hex(0, lang) : "0";
      }
      return GM.expr.code(r.ast, lang, map, types);
    };
    const exb = (src, where) => {
      const r = GM.expr.check(src, types, "b");
      if (!r.ok) {
        warn(where + ": " + r.err);
        return null;
      }
      let s = GM.expr.code(r.ast, lang, map, types);
      if ((brace || gd) && r.type !== "b") s = par(s) + " != 0";
      return s;
    };

    const blob = JSON.stringify(def.parts);
    const evs = (on) => (def.events || []).filter((e) => e.on === on);
    const reads = {
      hovered: /\bhovered\b/.test(blob) || evs("enter").length + evs("leave").length > 0,
      pressed: /\bpressed\b/.test(blob),
      dragging: /\bdragging\b/.test(blob) || evs("drag").length > 0,
      pressed_now: evs("press").length > 0,
      clicked: evs("click").length > 0,
      released: evs("release").length > 0,
    };
    const mask = !!info.mask;
    if (mask) reads.hovered = reads.clicked = reads.dragend = true;
    const fo = reads.clicked || reads.pressed_now;
    const deco = !(def.events || []).length && !hasValue(def) && !groups.length && !rs && !mask;
    const CHG = c ? "changed = 1" : py ? "changed = True" : "changed = true";
    const YES = c ? "1" : py ? "True" : "true";

    const T = { num: "double", color: c ? "uint32_t" : jv ? "int" : "uint", bool: c ? "int" : jv ? "boolean" : "bool", text: c ? "const char *" : jv ? "String" : "string" };
    const pargs = def.params.map((pr) => (ind ? pr.name + (gd ? " = " : "=") + litOf(pr.type, pr.def, lang) : T[pr.type] + (c && pr.type === "text" ? "" : " ") + idc(pr.name)));
    const val = hasValue(def);
    const o = new Out(ind);
    const sem = ind ? "" : ";";
    const A = (s) => o.add(s);
    const St = (s) => o.add(s + sem);
    const open = (h) => {
      if (ind) A(h + ":");
      else if (cs) A(h), A("{");
      else A(h + " {");
      o.d++;
    };
    const close = () => {
      o.d--;
      if (!ind) A("}");
    };
    const iff = (cond) => open(ind ? "if " + cond : "if (" + cond + ")");
    const two = (a, b) => {
      if (ind) A(a), A(b);
      else St(a + (c ? ", " : "; ") + b);
    };
    const dbl = (n, e) => St((c || brace ? "double " : gd ? "var " : "") + n + " = " + e);
    const fn = c ? def.name + "_el" : cs ? pascal(def.name) : jv ? camel(def.name) + "El" : def.name + "_el";
    if (c) A("static int " + fn + "(" + ["goome_ui *u", "const char *id"].concat(pargs, ["const double *init"], val ? ["double *value"] : []).join(", ") + ")");
    else if (cs) A("int " + fn + "(" + ["Ui ui", "string id"].concat(pargs, ["double[]? init"], val ? ["out double value"] : []).join(", ") + ")");
    else if (jv) A("static int " + fn + "(" + ["Ui ui", "String id"].concat(pargs, ["double[] init"], val ? ["double[] value"] : []).join(", ") + ") {");
    else if (gd) A("func " + fn + "(" + ["ui: GoomeUI", "sid: String"].concat(pargs, ["init = null"]).join(", ") + ")" + (val ? " -> Array" : " -> int") + ":");
    else A("def " + fn + "(" + ["ui", "sid"].concat(pargs, ["init=None"]).join(", ") + "):");
    if (c || cs) A("{");
    o.d++;
    if (c) St("double *s = goome_ui_store(u, id, " + N + ")"), St("if (!s) return 0");
    else if (cs) {
      St("var s = ui.Store(id, " + N + ")");
      if (val) {
        A("if (s.Length < " + N + ")");
        A("{");
        A("    value = 0;");
        A("    return 0;");
        A("}");
      } else St("if (s.Length < " + N + ") return 0");
    } else if (jv) {
      St("DoubleBuffer sb = ui.store(id, " + N + ")");
      St("double[] s = new double[" + N + "]");
      St("sb.get(0, s)");
      ctx.need.doubleBuffer = true;
    } else if (gd) {
      A("var s: PackedFloat64Array = ui.store(sid, " + N + ")");
      A("if s.size() < " + N + ":");
      A(val ? "    return [0, 0.0]" : "    return 0");
    } else {
      A("s = ui.store(sid, " + N + ")");
      A("if s is None:");
      A(val ? "    return 0, 0.0" : "    return 0");
    }
    iff(py ? "not s[0]" : c ? "!s[0]" : "s[0] == 0");
    const fromInit = (i, d) => (c ? "init ? init[" + i + "] : " + d : brace ? "init != null ? init[" + i + "] : " + d : "init[" + i + "] if init else " + d);
    St(S("init") + " = 1");
    St(S("w") + " = " + fromInit(0, num(def.w)));
    St(S("h") + " = " + fromInit(1, num(def.h)));
    def.state.forEach((st, i) => St(S("s:" + st.name) + " = " + fromInit(i + 2, st.type === "bool" ? (st.def ? "1" : "0") : num(st.def))));
    scope.slots.forEach((w) => St(S("w:" + w.name) + " = " + (w.kind === "color" ? hex(w.val, c || gd ? "c" : lang).replace(/u$/, "") : num(w.val))));
    const clampE = (v, lo, hi) => (c ? "gm_clamp(" + v + ", " + lo + ", " + hi + ")" : cs ? "Math.Max(" + lo + ", Math.Min(" + hi + ", " + v + "))" : jv ? "Math.max(" + lo + ", Math.min(" + hi + ", " + v + "))" : gd ? "clamp(" + v + ", " + lo + ", " + hi + ")" : "max(" + lo + ", min(" + hi + ", " + v + "))");
    const vd = def.value || {};
    const vst = vd.state ? def.state.find((x) => x.name === vd.state && x.type !== "bool") : null;
    if (val && vd.src === "drag") St(S("value") + " = " + (vst ? S("s:" + vst.name) : num(+vd.min || 0)));

    const groupBase = new Map();
    const baseWalk = (parts, bx, by) => {
      for (const pt of parts) {
        if (pt.kind !== "group") continue;
        const gx = par(ex(pt.f.x, "n", pt.name + " x")), gy = par(ex(pt.f.y, "n", pt.name + " y"));
        const dg = pt.drag && pt.drag.on;
        const sx = plus(bx, gx), sy = plus(by, gy);
        const ax = dg ? plus(sx, S(GM.partVar(pt) + "_dx")) : sx, ay = dg ? plus(sy, S(GM.partVar(pt) + "_dy")) : sy;
        groupBase.set(pt.id, { sx, sy, ax, ay });
        baseWalk(pt.kids || [], ax, ay);
      }
    };
    baseWalk(def.parts, "0", "0");
    const bounds = (g) => {
      const b = groupBase.get(g.id), d = g.drag;
      const gw = par(ex(g.f.w, "n", g.name + " w")), gh = par(ex(g.f.h, "n", g.name + " h"));
      if (d.bounds === "element") return { x: [neg(b.sx), minus(minus(S("w"), gw), b.sx)], y: [neg(b.sy), minus(minus(S("h"), gh), b.sy)] };
      if (d.bounds === "rect") {
        const R = d.rect || {};
        return {
          x: [minus(num(+R.x || 0), b.sx), minus(minus(num((+R.x || 0) + (+R.w || 0)), gw), b.sx)],
          y: [minus(num(+R.y || 0), b.sy), minus(minus(num((+R.y || 0) + (+R.h || 0)), gh), b.sy)],
        };
      }
      return null;
    };
    const tOf = (o2, r) => {
      const lo = par(r[0]), hi = par(r[1]);
      return ind ? "(" + par(minus(o2, lo)) + " / " + par(minus(hi, lo)) + " if " + hi + " > " + lo + " else 0)" : "(" + hi + " > " + lo + " ? " + par(minus(o2, lo)) + " / " + par(minus(hi, lo)) + " : 0)";
    };
    if (val && vd.src === "drag") {
      const g = groups.find((x) => x.id === vd.part);
      const r = g && bounds(g);
      if (!g) warn("the value comes from a drag but no drag group is picked");
      else if (!r) warn("a value from a drag needs bounds on " + g.name, g.id);
      else {
        const ax = vd.axis === "y" ? "y" : "x";
        const span = (+vd.max || 0) - (+vd.min || 0);
        const t = span ? clampE(par(minus(S("value"), num(+vd.min || 0))) + (span === 1 ? "" : " / " + num(span)), "0", "1") : "0";
        St(S(GM.partVar(g) + (ax === "y" ? "_dy" : "_dx")) + " = " + plus(r[ax][0], t + " * " + par(minus(r[ax][1], r[ax][0]))));
      }
    }
    close();

    scope.slots.forEach((w) => {
      const v = S("w:" + w.name), id = idc(w.name);
      if (c) St((w.kind === "color" ? "uint32_t " : w.kind === "double" ? "double " : "int ") + id + " = " + (w.kind === "double" ? v : "(" + (w.kind === "color" ? "uint32_t" : "int") + ")" + v));
      else if (cs) St((w.kind === "color" ? "uint " : w.kind === "double" ? "double " : w.kind === "int" ? "int " : "bool ") + id + " = " + (w.kind === "double" ? v : w.kind === "color" ? "(uint)" + v : w.kind === "int" ? "(int)" + v : v + " != 0"));
      else if (jv) St((w.kind === "color" ? "int " : w.kind === "double" ? "double " : w.kind === "int" ? "int " : "boolean ") + id + " = " + (w.kind === "double" ? v : w.kind === "color" || w.kind === "int" ? "(int) " + v : v + " != 0"));
      else if (gd) {
        if (w.kind === "color") ctx.need.argb = true;
        A("var " + id + " = " + (w.kind === "double" ? v : w.kind === "color" ? "_argb(int(" + v + "))" : w.kind === "int" ? "int(" + v + ")" : v + " != 0.0"));
      } else A(id + " = " + (w.kind === "double" ? v : w.kind === "color" || w.kind === "int" ? "int(" + v + ")" : "bool(" + v + ")"));
    });

    const flagsDecl = ["changed", "hovered", "pressed", "dragging", "pressed_now", "clicked", "released", "dragend"].filter((k) => k === "changed" || reads[k]);
    if (c) St("int " + flagsDecl.map((k) => k + " = 0").join(", "));
    else if (cs) St("bool " + flagsDecl.map((k) => idc(k) + " = false").join(", "));
    else if (jv) St("boolean " + flagsDecl.map((k) => idc(k) + " = false").join(", "));
    else if (gd) flagsDecl.forEach((k) => A("var " + k + " = false"));
    else A(flagsDecl.join(" = ") + " = False");
    St(c ? "goome_ui_push_id(u, id)" : cs ? "ui.PushId(id)" : jv ? "ui.pushId(id)" : "ui.push_id(sid)");
    const items = ["el", "o"];
    const IF = (k) => (c ? { 0: "0", x: "GOOME_ITEM_DRAG_X", y: "GOOME_ITEM_DRAG_Y", xy: "GOOME_ITEM_DRAG_X | GOOME_ITEM_DRAG_Y", nohit: "GOOME_ITEM_NO_HIT", fo: "GOOME_ITEM_FOCUSABLE" }
      : cs ? { 0: "ItemFlags.None", x: "ItemFlags.DragX", y: "ItemFlags.DragY", xy: "ItemFlags.DragX | ItemFlags.DragY", nohit: "ItemFlags.NoHit", fo: "ItemFlags.Focusable" }
      : jv ? { 0: "", x: "ItemFlag.DRAG_X", y: "ItemFlag.DRAG_Y", xy: "ItemFlag.DRAG_X, ItemFlag.DRAG_Y", nohit: "ItemFlag.NO_HIT", fo: "ItemFlag.FOCUSABLE" }
      : gd ? { 0: "0", x: "GoomeUI.ITEM_DRAG_X", y: "GoomeUI.ITEM_DRAG_Y", xy: "GoomeUI.ITEM_DRAG_X | GoomeUI.ITEM_DRAG_Y", nohit: "GoomeUI.ITEM_NO_HIT", fo: "GoomeUI.ITEM_FOCUSABLE" }
      : { 0: "0", x: "goome.ITEM_DRAG_X", y: "goome.ITEM_DRAG_Y", xy: "goome.ITEM_DRAG_X | goome.ITEM_DRAG_Y", nohit: "goome.ITEM_NO_HIT", fo: "goome.ITEM_FOCUSABLE" })[k];
    const F = (it, f) => it + "." + (cs ? pascal(f) : jv ? camel(f) + "()" : f);
    const custom = (name, sid, w, h, fl) => {
      if (c) St("goome_ui_custom(u, " + strq(sid, "c") + ", " + w + ", " + h + ", " + fl + ", &" + name + ")");
      else if (cs) St("ui.Custom(" + strq(sid, "cs") + ", " + w + ", " + h + ", " + fl + ", out var " + name + ")");
      else if (jv) St("Item " + name + " = ui.custom(" + [strq(sid, "cs"), w, h].concat(fl ? [fl] : []).join(", ") + ")");
      else if (gd) A("var " + name + " = ui.custom(" + strq(sid, "gd") + ", " + w + ", " + h + ", " + fl + ")");
      else A(name + " = ui.custom(" + strq(sid, "py") + ", " + w + ", " + h + ", " + fl + ")");
    };
    const pos = (x, y) => St(c ? "goome_ui_pos(u, " + x + ", " + y + ")" : cs ? "ui.Pos(" + x + ", " + y + ")" : "ui.pos(" + x + ", " + y + ")");
    const declAt = o.l.length;
    custom("el", "##el", S("w"), S("h"), IF("nohit"));
    pos("0", "0");
    custom("o", "##o", "1", "1", IF("nohit"));
    if (ind) {
      A((gd ? "var " : "") + "ox = " + F("el", "x") + " - " + F("o", "x"));
      A((gd ? "var " : "") + "oy = " + F("el", "y") + " - " + F("o", "y"));
    } else St("double ox = " + F("el", "x") + " - " + F("o", "x") + ", oy = " + F("el", "y") + " - " + F("o", "y"));
    const OR = ind ? " or " : " || ";
    const acc = (it, click) => {
      const L = [];
      const set = (k, e) => {
        if (!reads[k]) return;
        if (ind) L.push(k + " = " + k + " or " + e);
        else if (brace) L.push(idc(k) + " |= " + e + ";");
        else L.push(k + " |= " + e + ";");
      };
      set("hovered", F(it, "hovered") + OR + F(it, "held"));
      set("pressed", F(it, "held"));
      set("pressed_now", F(it, "pressed"));
      if (click) set("clicked", F(it, "clicked"));
      set("released", F(it, "released"));
      if (!click) set("dragend", F(it, "released"));
      L.forEach(A);
    };
    if (rs) {
      const R = def.resizable;
      pos(plus("ox", minus(S("w"), "14")), plus("oy", minus(S("h"), "14")));
      items.push("rs");
      custom("rs", "##rs", "14", "14", IF("xy"));
      iff(F("rs", "pressed"));
      two(S("rw") + " = " + S("w"), S("rh") + " = " + S("h"));
      close();
      iff(F("rs", "held"));
      St(S("w") + " = " + clampE(S("rw") + " + " + F("rs", "drag_x"), num(R.minW), num(R.maxW)));
      St(S("h") + " = " + clampE(S("rh") + " + " + F("rs", "drag_y"), num(R.minH), num(R.maxH)));
      St(CHG);
      if (reads.dragging) St(idc("dragging") + " = " + YES);
      close();
      acc("rs", false);
    }
    const bboxOf = (pt, bx, by) => {
      const f = pt.f, wh = (k) => (pt.name || pt.kind) + " " + k;
      const e = (k) => par(ex(f[k], "n", wh(k)));
      switch (pt.kind) {
        case "rect": case "rrect": case "frame": case "grad": case "shadow": case "bitmap": case "hit": case "group":
          return [plus(bx, e("x")), plus(by, e("y")), e("w"), e("h")];
        case "circle": case "ring": case "arc":
          return [plus(bx, minus(e("cx"), e("r"))), plus(by, minus(e("cy"), e("r"))), "2 * " + e("r"), "2 * " + e("r")];
        case "line": {
          const mn = c ? "gm_min" : cs ? "Math.Min" : jv ? "Math.min" : "min", mx = c ? "gm_max" : cs ? "Math.Max" : jv ? "Math.max" : "max", ab = c ? "gm_abs" : cs ? "Math.Abs" : jv ? "Math.abs" : "abs";
          return [plus(bx, mn + "(" + e("x0") + ", " + e("x1") + ")"), plus(by, mn + "(" + e("y0") + ", " + e("y1") + ")"), mx + "(1, " + ab + "(" + minus(e("x1"), e("x0")) + "))", mx + "(1, " + ab + "(" + minus(e("y1"), e("y0")) + "))"];
        }
        case "text": {
          const m = /^\{(\w+)\}$/.exec(String(f.text || ""));
          const pr = m && def.params.find((x) => x.name === m[1] && x.type === "text");
          const len = pr ? (c ? "(double)strlen(" + pr.name + ")" : cs ? idc(pr.name) + ".Length" : jv || gd ? idc(pr.name) + ".length()" : "len(" + pr.name + ")") : String(Array.from(String(f.text || "")).length);
          return [plus(bx, e("x")), plus(by, e("y")), len + " * " + e("size") + " * 0.55", e("size") + " * 1.25"];
        }
      }
      warn((pt.name || pt.kind) + " cant be a hit area, use a hit part", pt.id);
      return null;
    };
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i], gv = GM.partVar(g), d = g.drag, b = groupBase.get(g.id);
      let r = null;
      if (d.handle) {
        let hp = null;
        GM.walkParts(g.kids || [], (pt) => {
          if (pt.id === d.handle) hp = pt;
        });
        if (hp && hp.kind !== "group" && hp.kind !== "widget") r = bboxOf(hp, b.ax, b.ay);
        else warn("drag handle part not found in " + g.name + ", using the group box", g.id);
      }
      if (!r) r = [b.ax, b.ay, par(ex(g.f.w, "n", g.name + " w")), par(ex(g.f.h, "n", g.name + " h"))];
      const it = c || ind ? "h_" + gv : "h" + pascal(gv);
      items.push(it);
      pos(plus("ox", r[0]), plus("oy", r[1]));
      custom(it, "##" + gv, r[2], r[3], IF(d.axis === "x" ? "x" : d.axis === "y" ? "y" : "xy"));
      const dx = S(gv + "_dx"), dy = S(gv + "_dy"), sx = S(gv + "_sx"), sy = S(gv + "_sy");
      iff(F(it, "pressed"));
      if (py) A(sx + ", " + sy + " = " + dx + ", " + dy);
      else two(sx + " = " + dx, sy + " = " + dy);
      close();
      iff(F(it, "held"));
      const axes = d.axis === "x" ? ["x"] : d.axis === "y" ? ["y"] : ["x", "y"];
      const bd = bounds(g);
      const snap = +d.snap || 0;
      for (const a of axes) {
        const n2 = "n" + a;
        dbl(n2, (a === "x" ? sx : sy) + " + " + F(it, a === "x" ? "drag_x" : "drag_y"));
        if (snap > 0) St(n2 + " = " + (c ? "gm_floor" : cs ? "Math.Floor" : jv ? "Math.floor" : gd ? "floor" : "math.floor") + "(" + n2 + " / " + num(snap) + " + 0.5) * " + num(snap));
        if (bd) St(n2 + " = " + clampE(n2, bd[a][0], bd[a][1]));
      }
      if (snap > 0 && py) ctx.need.math = true;
      iff(axes.map((a) => "n" + a + " != " + (a === "x" ? dx : dy)).join(OR));
      for (const a of axes) St((a === "x" ? dx : dy) + " = n" + a);
      St(CHG);
      if (val && vd.src === "drag" && vd.part === g.id) {
        const a = vd.axis === "y" ? "y" : "x";
        if (bd) {
          const span = (+vd.max || 0) - (+vd.min || 0);
          const t = tOf(a === "x" ? dx : dy, bd[a]);
          St(S("value") + " = " + plus(num(+vd.min || 0), span === 1 ? t : t + " * " + num(span)));
          if (vst) St(S("s:" + vst.name) + " = " + S("value"));
        }
      }
      close();
      if (reads.dragging) St(idc("dragging") + " = " + YES);
      close();
      acc(it, false);
    }
    if (def.hit === "parts") {
      let k = 0;
      const walkHit = (parts, bx, by) => {
        for (const pt of parts) {
          if (pt.kind === "group") {
            const b = groupBase.get(pt.id);
            if (pt.hit && !(pt.drag && pt.drag.on)) hitOne(pt, bx, by);
            walkHit(pt.kids || [], b.ax, b.ay);
          } else if (pt.kind === "hit" || pt.hit) hitOne(pt, bx, by);
        }
      };
      const hitOne = (pt, bx, by) => {
        const r = bboxOf(pt, bx, by);
        if (!r) return;
        const it = "hit" + k;
        items.push(it);
        pos(plus("ox", r[0]), plus("oy", r[1]));
        custom(it, "##hit" + k++, r[2], r[3], fo ? IF("fo") : IF(0));
        acc(it, true);
      };
      walkHit(def.parts, "0", "0");
      if (!k && !groups.length && !rs && !deco) warn("hit mode is parts but no part is a hit area, nothing can be clicked");
    } else {
      items.push("box");
      pos("ox", "oy");
      custom("box", "##box", S("w"), S("h"), deco ? IF("nohit") : fo ? IF("fo") : IF(0));
      acc("box", true);
    }
    const oLines = ind ? 4 : 3;
    if (!o.l.slice(declAt + oLines + 1).some((l) => /\b(ox|oy)\b/.test(l))) {
      o.l.splice(declAt + 1, oLines);
      items.splice(items.indexOf("o"), 1);
    }
    if (c) o.l.splice(declAt, 0, "    ".repeat(o.d) + "goome_ui_item " + items.join(", ") + ";");

    const actLines = (on) => {
      for (const e of evs(on)) {
        if (e.act === "print") {
          A(c ? "puts(" + strq(e.text || "", "c") + ");" : cs ? "Console.WriteLine(" + strq(e.text || "", "cs") + ");" : jv ? "System.out.println(" + strq(e.text || "", "cs") + ");" : "print(" + strq(e.text || "", "py") + ")");
          continue;
        }
        const tg = def.state.find((s) => s.name === e.target);
        if (!tg) {
          warn(on + " event needs a state to change, skipped");
          continue;
        }
        const t = S("s:" + tg.name);
        if (e.act === "toggle") A(c ? t + " = !" + t + ";" : brace ? t + " = " + t + " != 0 ? 0 : 1;" : t + " = 0.0 if " + t + " else 1.0");
        else if (e.act === "add") {
          if (tg.type === "bool") {
            warn("cant add to a yes/no state");
            continue;
          }
          St(t + " += " + ex(e.expr || "0", "n", on + " event"));
        } else if (e.act === "set") {
          if (tg.type === "bool") {
            const b = exb(e.expr || "false", on + " event");
            if (b == null) continue;
            St(c ? t + " = " + par(b) + " != 0" : brace ? t + " = " + par(b) + " ? 1 : 0" : t + " = 1.0 if " + b + " else 0.0");
          } else St(t + " = " + ex(e.expr || "0", "n", on + " event"));
        }
        St(CHG);
      }
    };
    const evBlock = (cond, on) => {
      if (!evs(on).length) return;
      iff(cond);
      actLines(on);
      close();
    };
    const NOT = ind ? "not " : "!";
    const AND = ind ? " and " : " && ";
    if (evs("enter").length || evs("leave").length) {
      const hot = brace ? "(" + S("hot") + " != 0)" : S("hot");
      evBlock("hovered" + AND + NOT + hot, "enter");
      evBlock(NOT + "hovered" + AND + hot, "leave");
      St(S("hot") + " = " + (c ? "hovered" : brace ? "hovered ? 1 : 0" : "1.0 if hovered else 0.0"));
    }
    evBlock(idc("pressed_now"), "press");
    evBlock("dragging", "drag");
    evBlock("clicked", "click");
    evBlock("released", "release");
    if (val && vd.src === "state") {
      const vs = def.state.find((s) => s.name === vd.state);
      if (vs) St(S("value") + " = " + S("s:" + vs.name));
      else warn("value state " + (vd.state || "(none)") + " is missing");
    }

    const D = new Out(ind);
    const ELX = F("el", "x"), ELY = F("el", "y");
    const drawParts = (parts, bx, by) => {
      for (const pt of parts) {
        if (pt.kind === "widget" || pt.kind === "hit") continue;
        const where = (k) => (pt.name || pt.kind) + " " + k;
        const N2 = (k) => ex(pt.f[k], "n", where(k));
        const Cc = (k) => ex(pt.f[k], "c", where(k));
        const X0 = (k) => plus(bx, par(N2(k)));
        const Y0 = (k) => plus(by, par(N2(k)));
        const lines = [];
        const call = (cn, csn, pyn, args) => lines.push(c ? cn + "(c, " + args.join(", ") + ");" : cs ? "c." + csn + "(" + args.join(", ") + ");" : jv ? "c." + camel(pyn) + "(" + args.join(", ") + ");" : "c." + pyn + "(" + args.join(", ") + ")");
        const G = (f, args) => lines.push("ui." + f + "(" + args.join(", ") + ")");
        const R2 = (x, y, w, h) => "Rect2(" + [x, y, w, h].join(", ") + ")";
        const V2 = (x, y) => "Vector2(" + x + ", " + y + ")";
        switch (pt.kind) {
          case "rect":
            if (gd) G("draw_rect", [R2(X0("x"), Y0("y"), N2("w"), N2("h")), Cc("color")]);
            else call("goome_draw_rect", "DrawRect", "rect", [X0("x"), Y0("y"), N2("w"), N2("h"), Cc("color")]);
            break;
          case "rrect": {
            const r = [N2("tl"), N2("tr"), N2("br"), N2("bl")];
            if (gd) G("draw_rect", [R2(X0("x"), Y0("y"), N2("w"), N2("h")), Cc("color"), "Vector4(" + r.join(", ") + ")"]);
            else call("goome_draw_rrect", "DrawRRect", "rrect", [X0("x"), Y0("y"), N2("w"), N2("h"), c ? "(goome_radii){" + r.join(", ") + "}" : cs || jv ? "new Radii(" + r.join(", ") + ")" : "(" + r.join(", ") + ")", Cc("color")]);
            break;
          }
          case "frame":
            if (gd) G("draw_outline", [R2(X0("x"), Y0("y"), N2("w"), N2("h")), Cc("color"), N2("width")]);
            else call("goome_draw_frame", "DrawFrame", "frame", [X0("x"), Y0("y"), N2("w"), N2("h"), N2("width"), Cc("color")]);
            break;
          case "line":
            if (gd) G("draw_line", [V2(X0("x0"), Y0("y0")), V2(X0("x1"), Y0("y1")), Cc("color"), N2("width")]);
            else call("goome_draw_line", "DrawLine", "line", [X0("x0"), Y0("y0"), X0("x1"), Y0("y1"), N2("width"), Cc("color")]);
            break;
          case "circle":
            if (gd) G("draw_circle", [V2(X0("cx"), Y0("cy")), N2("r"), Cc("color")]);
            else call("goome_draw_circle", "DrawCircle", "circle", [X0("cx"), Y0("cy"), N2("r"), Cc("color")]);
            break;
          case "ring":
            if (gd) G("draw_ring", [V2(X0("cx"), Y0("cy")), N2("r"), Cc("color"), N2("width")]);
            else call("goome_draw_ring", "DrawRing", "ring", [X0("cx"), Y0("cy"), N2("r"), N2("width"), Cc("color")]);
            break;
          case "arc":
            if (gd) G("draw_arc", [V2(X0("cx"), Y0("cy")), N2("r"), N2("a0"), N2("a1"), Cc("color"), N2("width")]);
            else call("goome_draw_arc", "DrawArc", "arc", [X0("cx"), Y0("cy"), N2("r"), N2("width"), N2("a0"), N2("a1"), Cc("color")]);
            break;
          case "poly": {
            const pts = String(pt.f.points || "").trim().split(/\s+/).filter(Boolean).map((pair) => pair.split(","));
            if (pts.length < 3 || pts.some((x) => x.length !== 2)) {
              warn(where("points") + ": needs 3 or more x,y pairs", pt.id);
              break;
            }
            const flat = [];
            pts.forEach((xy) => flat.push(plus(bx, par(ex(xy[0], "n", where("points")))), plus(by, par(ex(xy[1], "n", where("points"))))));
            const id = "pts_" + GM.partVar(pt);
            if (c) {
              lines.push("double " + id + "[] = {" + flat.join(", ") + "};");
              lines.push("goome_draw_poly(c, " + id + ", " + pts.length + ", " + Cc("color") + ");");
            } else if (cs) lines.push("c.DrawPoly(new double[] { " + flat.join(", ") + " }, " + Cc("color") + ");");
            else if (jv) lines.push("c.poly(new double[] {" + flat.join(", ") + "}, " + Cc("color") + ");");
            else if (gd) {
              const vs = [];
              for (let k = 0; k < flat.length; k += 2) vs.push(V2(flat[k], flat[k + 1]));
              G("draw_polygon", ["PackedVector2Array([" + vs.join(", ") + "])", Cc("color")]);
            } else lines.push("c.poly([" + flat.join(", ") + "], " + Cc("color") + ")");
            break;
          }
          case "grad":
            if (gd) G("draw_gradient", [R2(X0("x"), Y0("y"), N2("w"), N2("h")), Cc("from"), Cc("to"), N2("radius"), bool(!!pt.f.sideways, lang)]);
            else call("goome_draw_rrect_grad", "DrawRRectGrad", "rrect_grad", [X0("x"), Y0("y"), N2("w"), N2("h"), c ? "goome_radius(" + N2("radius") + ")" : jv ? "Radii.of(" + N2("radius") + ")" : N2("radius"), Cc("from"), Cc("to"), bool(!!pt.f.sideways, lang)]);
            break;
          case "shadow":
            if (gd) G("draw_shadow", [R2(X0("x"), Y0("y"), N2("w"), N2("h")), Cc("color"), N2("radius"), N2("blur")]);
            else call("goome_draw_shadow", "DrawShadow", "shadow", [X0("x"), Y0("y"), N2("w"), N2("h"), N2("radius"), N2("blur"), Cc("color")]);
            break;
          case "text": {
            const m = /^\{(\w+)\}$/.exec(String(pt.f.text || ""));
            let tx;
            if (m) {
              const pr = def.params.find((x) => x.name === m[1] && x.type === "text");
              if (!pr) {
                warn(where("text") + ": no text param called " + m[1], pt.id);
                tx = strq("", lang);
              } else tx = idc(pr.name);
            } else tx = strq(pt.f.text || "", lang);
            if (c) lines.push("goome_text(c, NULL, " + [N2("size"), X0("x"), Y0("y"), tx, Cc("color")].join(", ") + ");");
            else if (cs) lines.push("c.DrawText(null, " + [N2("size"), X0("x"), Y0("y"), tx, Cc("color")].join(", ") + ");");
            else if (jv) lines.push("c.text(null, " + [N2("size"), X0("x"), Y0("y"), tx, Cc("color")].join(", ") + ");");
            else if (gd) G("draw_text", [V2(X0("x"), Y0("y")), tx, Cc("color"), N2("size")]);
            else lines.push("c.font_text(None, " + [N2("size"), X0("x"), Y0("y"), tx, Cc("color")].join(", ") + ")");
            break;
          }
          case "bitmap": {
            if (gd) {
              warn("godot-goome cant draw a picture inside a custom element yet, skipped " + (pt.name || "the bitmap"), pt.id);
              break;
            }
            const file = String(pt.f.file || "picture.png");
            const bid = addBitmap(ctx, "bm_" + def.name + "_" + GM.partVar(pt), file, pt.f.img);
            const tint = pt.f.tint === "" || pt.f.tint == null ? hex(0xFFFFFFFF, lang) : Cc("tint");
            const a = [X0("x"), Y0("y"), N2("w"), N2("h")];
            if (c) lines.push("if (" + bid + "_ok) goome_draw_bitmap(c, &" + bid + ", " + a.concat(["goome_radius(" + N2("radius") + ")", tint]).join(", ") + ");");
            else if (cs) lines.push("if (" + camel(bid) + " != null) c.DrawBitmap(" + camel(bid) + ", " + a.concat([N2("radius"), tint]).join(", ") + ");");
            else if (jv) lines.push("if (" + camel(bid) + " != null) c.bitmap(" + camel(bid) + ", " + a.concat([N2("radius"), tint]).join(", ") + ");");
            else lines.push("if " + bid.toUpperCase() + " is not None:", "    c.bitmap(" + bid.toUpperCase() + ", " + a.concat([N2("radius"), tint]).join(", ") + ")");
            break;
          }
          case "group": {
            const b = groupBase.get(pt.id);
            const ax = plus(ELX, b.ax), ay = plus(ELY, b.ay);
            if (pt.f.clip) {
              const a = [ax, ay, N2("w"), N2("h")];
              lines.push(c ? "goome_clip_push(c, " + a.join(", ") + ");" : cs ? "c.ClipPush(" + a.join(", ") + ");" : jv ? "c.clipPush(" + a.join(", ") + ");" : gd ? "ui.push_clip(" + R2(...a) + ")" : "c.clip_push(" + a.join(", ") + ")");
            }
            const keep = D.l.length, sd = D.d;
            D.d = 0;
            drawParts(pt.kids || [], ax, ay);
            const kid = D.l.splice(keep);
            D.d = sd;
            kid.forEach((l) => lines.push(l));
            if (pt.f.clip) lines.push(c ? "goome_clip_pop(c);" : cs ? "c.ClipPop();" : jv ? "c.clipPop();" : gd ? "ui.pop_clip()" : "c.clip_pop()");
            break;
          }
        }
        if (!lines.length) continue;
        if (pt.show) {
          const b = exb(pt.show, (pt.name || pt.kind) + " show");
          if (b == null) continue;
          if (ind) D.add("if " + b + ":");
          else if (cs) D.add("if (" + b + ")"), D.add("{");
          else D.add("if (" + b + ") {");
          lines.forEach((l) => D.add("    " + l));
          if (!ind) D.add("}");
        } else lines.forEach((l) => D.add(l));
      }
    };
    drawParts(def.parts, ELX, ELY);
    if (D.l.length) {
      const usesTh = D.l.some((l) => /\bth(->|\.)/.test(l));
      if (c) {
        St("goome_canvas *c = goome_ui_canvas(u)");
        open("if (c)");
        if (usesTh) St("goome_theme *th = goome_ui_theme(u)");
      } else if (cs) {
        St("var c = ui.Canvas()");
        open("if (c != null)");
        if (usesTh) St("var th = ui.Theme");
      } else if (jv) {
        St("Canvas c = ui.canvas()");
        open("if (c != null)");
        if (usesTh) St("Theme th = ui.theme()");
      } else if (py) {
        A("c = ui.canvas");
        open("if c is not None");
        if (usesTh) A("th = ui.theme");
      }
      D.l.forEach((l) => o.add(l));
      if (!gd) close();
    }
    wout.l.forEach((l) => o.add(l));
    scope.slots.forEach((w) => {
      const v = S("w:" + w.name), id = idc(w.name);
      if (c) St(v + " = " + id);
      else if (brace) St(v + " = " + (w.kind === "bool" ? id + " ? 1 : 0" : id));
      else if (gd) A(v + " = " + (w.kind === "bool" ? "1.0 if " + id + " else 0.0" : w.kind === "color" ? id + ".to_argb32()" : id));
      else A(v + " = " + (w.kind === "bool" ? "1.0 if " + id + " else 0.0" : id));
    });
    St(c ? "goome_ui_pop_id(u)" : cs ? "ui.PopId()" : jv ? "ui.popId()" : "ui.pop_id()");
    const bits = [["changed", 1], ["clicked", 2], ["dragend", 4], ["hovered", 8]].filter((b) => b[0] === "changed" || (mask && reads[b[0]]));
    if (c) {
      if (val) A("if (value) *value = " + S("value") + ";");
      A("return " + bits.map((b) => (b[1] === 1 ? b[0] : b[0] + " << " + Math.log2(b[1]))).join(" | ") + ";");
    } else if (cs) {
      if (val) St("value = " + S("value"));
      St("return " + bits.map((b) => "(" + idc(b[0]) + " ? " + b[1] + " : 0)").join(" | "));
    } else if (jv) {
      if (val) St("if (value != null) value[0] = " + S("value"));
      St("sb.put(0, s)");
      St("return " + bits.map((b) => "(" + idc(b[0]) + " ? " + b[1] + " : 0)").join(" | "));
    } else if (gd) {
      A("ui.store_set(sid, s)");
      const m = bits.map((b) => "(" + b[1] + " if " + b[0] + " else 0)").join(" | ");
      A("return " + (val ? "[" + m + ", " + S("value") + "]" : m));
    } else {
      const m = bits.map((b) => "(" + b[1] + " if " + b[0] + " else 0)").join(" | ");
      A("return " + (val ? m + ", " + S("value") : m));
    }
    o.d--;
    if (!ind) A("}");
    if (c || py) ctx.need.math = ctx.need.math || c;
    return o.text();
  }

  const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const b64bytes = (s) => {
    const out = [];
    let buf = 0, bits = 0;
    for (const ch of s) {
      const v = B64.indexOf(ch);
      if (v < 0) continue;
      buf = (buf << 6) | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        out.push((buf >> bits) & 255);
      }
    }
    return out;
  };
  const dataB64 = (img) => {
    const m = /^data:[\w/+.-]+;base64,([A-Za-z0-9+/=\s]+)$/.exec(String(img || ""));
    return m ? m[1].replace(/\s+/g, "") : null;
  };

  function addBitmap(ctx, id, file, img) {
    ctx.bitmaps = ctx.bitmaps || new Map();
    if (ctx.bitmaps.has(id)) return id;
    const set = Object.assign({}, GM.SETTINGS_DEFAULT, ctx.project.settings || {});
    let b64 = set.iconSource === "embed" ? dataB64(img) : null;
    if (set.iconSource === "embed" && !b64) ctx.warn("", file + " has no image data to embed, the code loads the file instead");
    if (!b64) ctx.files.add(file);
    ctx.bitmaps.set(id, { file, b64 });
    return id;
  }
  function bmRef(ctx, id) {
    const lang = ctx.lang, b = ctx.bitmaps.get(id);
    if (lang === "gd") return { ref: b.b64 ? "s." + id : strq("res://" + b.file, "gd"), ok: null };
    if (lang === "c") return { ref: "&" + id, ok: id + "_ok" };
    if (lang === "py") return { ref: id.toUpperCase(), ok: id.toUpperCase() + " is not None" };
    return { ref: camel(id), ok: camel(id) + " != null" };
  }
  const javaStr = (s) => {
    if (s.length <= 60000) return strq(s, "cs");
    const parts = [];
    for (let i = 0; i < s.length; i += 60000) parts.push(strq(s.slice(i, i + 60000), "cs"));
    return "String.join(\"\", " + parts.join(", ") + ")";
  };

  function bitmapLoads(ctx) {
    const lang = ctx.lang, L = { decl: [], load: [], free: [], helpers: [] };
    if (!ctx.bitmaps) return L;
    let files = false, data = false;
    for (const [id, b] of ctx.bitmaps) {
      if (lang === "c") {
        L.decl.push("static goome_bitmap " + id + ";", "static int " + id + "_ok;");
        if (b.b64) {
          const bytes = b64bytes(b.b64);
          const rows = [];
          for (let i = 0; i < bytes.length; i += 16) rows.push("    " + bytes.slice(i, i + 16).map((x) => "0x" + x.toString(16).padStart(2, "0")).join(", ") + ",");
          L.decl.push("static const unsigned char " + id + "_png[] = {", ...rows, "};");
          L.load.push(id + "_ok = goome_bitmap_load_mem(" + id + "_png, sizeof(" + id + "_png), &" + id + ") == GOOME_OK;");
        } else L.load.push(id + "_ok = goome_bitmap_load(" + strq(b.file, "c") + ", &" + id + ") == GOOME_OK;");
        L.free.push("goome_bitmap_free(&" + id + ");");
      } else if (lang === "cs") {
        if (b.b64) data = true, L.decl.push("var " + camel(id) + " = TryLoadData(" + strq(b.b64, "cs") + ");");
        else files = true, L.decl.push("var " + camel(id) + " = TryLoad(" + strq(b.file, "cs") + ");");
      } else if (lang === "java") {
        L.decl.push("static Bitmap " + camel(id) + ";");
        if (b.b64) data = true, L.load.push(camel(id) + " = tryLoadData(" + javaStr(b.b64) + ");");
        else files = true, L.load.push(camel(id) + " = tryLoad(" + strq(b.file, "cs") + ");");
      } else if (lang === "gd") {
        if (!b.b64) continue;
        data = true;
        L.decl.push("var " + id + ": Image");
        L.load.push("s." + id + " = _img(" + strq(b.b64, "gd") + ")");
      } else {
        if (b.b64) data = true, L.decl.push(id.toUpperCase() + " = load_bitmap_data(" + strq(b.b64, "py") + ")");
        else files = true, L.decl.push(id.toUpperCase() + " = load_bitmap(" + strq(b.file, "py") + ")");
      }
    }
    if (lang === "cs") {
      if (files) L.helpers.push("Bitmap? TryLoad(string path)", "{", "    try", "    {", "        return Bitmap.Load(path);", "    }", "    catch (GoomeException)", "    {", "        return null;", "    }", "}", "");
      if (data) L.helpers.push("Bitmap? TryLoadData(string b64)", "{", "    try", "    {", "        return Bitmap.Load(Convert.FromBase64String(b64));", "    }", "    catch (GoomeException)", "    {", "        return null;", "    }", "}", "");
    } else if (lang === "java") {
      if (files) L.helpers.push("static Bitmap tryLoad(String path) {", "    try {", "        return Bitmap.load(path);", "    } catch (GoomeException e) {", "        return null;", "    }", "}", "");
      if (data) {
        ctx.need.base64 = true;
        L.helpers.push("static Bitmap tryLoadData(String b64) {", "    try {", "        return Bitmap.fromBytes(Base64.getDecoder().decode(b64));", "    } catch (GoomeException e) {", "        return null;", "    }", "}", "");
      }
    } else if (lang === "gd") {
      if (data) L.helpers.push("func _img(b64: String) -> Image:", "    var img := Image.new()", "    var raw := Marshalls.base64_to_raw(b64)", "    if img.load_png_from_buffer(raw) != OK and img.load_jpg_from_buffer(raw) != OK and img.load_webp_from_buffer(raw) != OK:", "        return null", "    return img", "");
    } else if (lang === "py") {
      if (files) L.helpers.push("", "def load_bitmap(path):", "    try:", "        return goome.Bitmap.load(path)", "    except goome.GoomeError:", "        return None", "");
      if (data) {
        ctx.need.base64 = true;
        L.helpers.push("", "def load_bitmap_data(b64):", "    try:", "        return goome.Bitmap.from_bytes(base64.b64decode(b64))", "    except goome.GoomeError:", "        return None", "");
      }
    }
    return L;
  }

  const thName = (k) => THC[k] || pascal(k);
  const NEWF = new Set(GM.THEME_AUTO_COLORS.concat(GM.THEME_NEW_SIZES, GM.THEME_FONTS));
  const CS_PRESET = { DARK: "Dark", LIGHT: "Light", MIDNIGHT: "Midnight", PAPER: "Paper", MINT: "Mint", HIGH_CONTRAST: "HighContrast", ROSE: "Rose" };
  function enumLit(k, v, lang) {
    const names = GM.THEME_ENUMS[k];
    const nm = names && names[v | 0];
    if (!nm || lang === "cs") return num(v);
    const pre = k === "align" ? "ALIGN_" : "EASE_";
    return lang === "c" ? "GOOME_" + pre + nm.toUpperCase() : lang === "java" ? "Theme." + pre + nm.toUpperCase() : lang === "gd" ? "GoomeUI." + pre + nm.toUpperCase() : "goome." + pre + nm.toUpperCase();
  }
  function fieldLit(k, v, lang) {
    if (GM.THEME_COLORS.includes(k)) return hex(v, lang);
    if (GM.THEME_ENUMS[k]) return enumLit(k, v, lang);
    return num(v);
  }
  function fontLit(name, lang) {
    return lang === "c" ? "goome_font_system(" + strq(name, "c") + ")" : lang === "cs" ? "Font.System(" + strq(name, "cs") + ")" : lang === "java" ? "Font.system(" + strq(name, "cs") + ")" : lang === "gd" ? strq(name, "gd") : "goome.Font.system(" + strq(name, "py") + ")";
  }
  function themeDiff(ctx, t, base, set) {
    const lang = ctx.lang, L = [];
    for (const k of GM.THEME_COLORS.concat(GM.THEME_SIZES)) {
      const differs = GM.THEME_COLORS.includes(k) ? (t[k] >>> 0) !== (base[k] >>> 0) : +t[k] !== +base[k];
      if (!differs) continue;
      L.push(set(k, fieldLit(k, t[k], lang)));
    }
    for (const k of GM.THEME_FONTS) {
      if (!t[k]) continue;
      L.push(set(k, fontLit(t[k], lang)));
    }
    return L;
  }
  function themeLines(ctx) {
    const lang = ctx.lang, t = GM.applyQuick(GM.normTheme(ctx.project.theme));
    const jv = lang === "java", gd = lang === "gd";
    const L = [];
    const set = (k, v) => (lang === "c" ? "t->" + k + " = " + v + ";" : lang === "cs" ? "t." + thName(k) + " = " + v + ";" : jv ? "t." + camel(k) + "(" + v + ");" : gd ? "ui.theme_set(" + strq(k, "gd") + ", " + v + ")" : "t." + k + " = " + v);
    if (t.quick) {
      const q = t.quick;
      L.push(lang === "c" ? "goome_ui_theme_make(t, " + hex(q.accent, "c") + ", " + (q.dark ? 1 : 0) + ", " + num(q.radius) + ");" : lang === "cs" ? "t.Make(" + hex(q.accent, "cs") + ", " + bool(q.dark, "cs") + ", " + num(q.radius) + ");"
        : jv ? "t.set(Theme.make(t, " + hex(q.accent, lang) + ", " + bool(q.dark, lang) + ", " + num(q.radius) + "));" : gd ? "ui.theme_make(" + hex(q.accent, lang) + ", " + bool(q.dark, lang) + ", " + num(q.radius) + ")"
        : "t.make(" + hex(q.accent, "py") + ", " + bool(q.dark, "py") + ", " + num(q.radius) + ")");
      for (const k of GM.THEME_FONTS) if (t[k]) L.push(set(k, fontLit(t[k], lang)));
    } else {
      const pr = GM.presetOf(t);
      if (pr && pr.id !== "dark") {
        const e = GM.PRESET_ENUM[pr.id];
        L.push(lang === "c" ? "goome_ui_theme_preset(t, GOOME_PRESET_" + e + ");" : lang === "cs" ? "t.Preset(Preset." + CS_PRESET[e] + ");" : jv ? "t.set(Theme.preset(t, Theme.PRESET_" + e + "));" : gd ? "ui.theme_preset(GoomeUI.PRESET_" + e + ")" : "t.preset(goome.PRESET_" + e + ")");
        L.push(...themeDiff(ctx, t, pr, set));
      } else {
        if (t.base === "light") L.push(lang === "c" ? "goome_ui_theme_light(t);" : lang === "cs" ? "t.Light();" : jv ? "t.light();" : gd ? "ui.theme_light()" : "t.light()");
        L.push(...themeDiff(ctx, t, GM.themeBase(t), set));
      }
    }
    const SK = { skin_button: "ButtonSkin", skin_panel: "PanelSkin", skin_input: "InputSkin" };
    const icons = Object.keys(t.icons || {}).filter((k) => GM.ICON_NAMES.includes(k));
    const extra = GM.EXTRA_SKINS.filter((k) => t[k]);
    if (jv || gd) {
      for (const k of GM.THEME_SKINS.concat(extra)) {
        const s = t[k];
        if (!s) continue;
        const b = bmRef(ctx, addBitmap(ctx, k, s.file, s.img));
        const e = [s.l, s.t, s.r, s.b].map(num).join(", ");
        const kind = k.replace(/^skin_/, "").toUpperCase();
        if (jv) L.push("if (" + b.ok + ") t.skin(Ui.SKIN_" + kind + ", new Skin(" + b.ref + ", " + e + "));");
        else L.push("ui.theme_set_skin(GoomeUI.SKIN_" + kind + ", " + b.ref + ", " + e + ")");
      }
      for (const k of icons) {
        const b = bmRef(ctx, addBitmap(ctx, "icon_" + k, t.icons[k].file || "icon_" + k + ".png", t.icons[k].img));
        if (jv) L.push("if (" + b.ok + ") t.icon(Icon." + k.toUpperCase() + ", " + b.ref + ");");
        else L.push("ui.theme_set_icon(GoomeUI.ICON_" + k.toUpperCase() + ", " + b.ref + ")");
      }
      if (t.icon_tint) L.push(jv ? "t.iconTint(1);" : 'ui.theme_set("icon_tint", 1)');
      return L;
    }
    for (const k of GM.THEME_SKINS) {
      const s = t[k];
      if (!s) continue;
      const id = addBitmap(ctx, k, s.file, s.img);
      const e = [s.l, s.t, s.r, s.b].map(num).join(", ");
      if (lang === "c") L.push("if (" + id + "_ok) t->" + k + " = (goome_skin){&" + id + ", " + e + "};");
      else if (lang === "cs") L.push("if (" + camel(id) + " != null) t." + SK[k] + " = new Skin(" + camel(id) + ", " + e + ");");
      else L.push("if " + id.toUpperCase() + " is not None:", "    t." + k + " = (" + id.toUpperCase() + ", " + e + ")");
    }
    if (lang !== "c") {
      const cs = lang === "cs";
      for (const k of icons) {
        const id = addBitmap(ctx, "icon_" + k, t.icons[k].file || "icon_" + k + ".png", t.icons[k].img);
        if (cs) L.push("if (" + camel(id) + " != null) t.Icons[Icon." + pascal(k) + "] = " + camel(id) + ";");
        else L.push("if " + id.toUpperCase() + " is not None:", "    t.icon[goome.ICON_" + k.toUpperCase() + "] = " + id.toUpperCase());
      }
      for (const k of extra) {
        const s = t[k];
        const id = addBitmap(ctx, k, s.file, s.img);
        const e = [s.l, s.t, s.r, s.b].map(num).join(", ");
        if (cs) L.push("if (" + camel(id) + " != null) t.Skins[SkinKind." + pascal(k.replace(/^skin_/, "")) + "] = new Skin(" + camel(id) + ", " + e + ");");
        else L.push("if " + id.toUpperCase() + " is not None:", "    t." + (k === "skin_slider_track" ? "skin_slider" : k) + " = (" + id.toUpperCase() + ", " + e + ")");
      }
      if (t.icon_tint) L.push(cs ? "t.IconTint = 1;" : "t.icon_tint = 1");
    }
    if (lang === "c") {
      for (const k of icons) {
        const id = addBitmap(ctx, "icon_" + k, t.icons[k].file || "icon_" + k + ".png", t.icons[k].img);
        L.push("if (" + id + "_ok) t->icon[GOOME_ICON_" + k.toUpperCase() + "] = &" + id + ";");
      }
      if (t.icon_tint) L.push("t->icon_tint = 1;");
      ctx.extraSkins = extra.map((k) => {
        const s = t[k];
        const id = addBitmap(ctx, k, s.file, s.img);
        return { k, id, e: [s.l, s.t, s.r, s.b].map(num).join(", ") };
      });
    }
    return L;
  }

  const CS_CUR = { ARROW: "Arrow", IBEAM: "IBeam", HAND: "Hand", MOVE: "Move", RESIZE_EW: "ResizeEW", RESIZE_NS: "ResizeNS", RESIZE_NWSE: "ResizeNWSE", RESIZE_NESW: "ResizeNESW", WAIT: "Wait", NO: "No", HIDDEN: "Hidden" };
  const CS_CFG = { dbl_click_ms: "DoubleClickMs", dbl_click_px: "DoubleClickPx" };
  const CS_CURK = { custom_xy: "CustomXY" };
  const CS_ACT = { del_word_left: "DeleteWordLeft", del_word_right: "DeleteWordRight" };
  function configLines(ctx) {
    const lang = ctx.lang, c = lang === "c", cs = lang === "cs", jv = lang === "java", gd = lang === "gd";
    const cfg = GM.normConfig(ctx.project.config), def = GM.normConfig({});
    const t = GM.normTheme(ctx.project.theme);
    const L = [], C = [];
    const set = (k, v) => C.push(c ? "cfg->" + k + " = " + v + ";" : cs ? "cfg." + (CS_CFG[k] || pascal(k)) + " = " + v + ";" : jv ? "cfg." + camel(k) + "(" + v + ");" : gd ? "ui.config_set(" + strq(k, "gd") + ", " + v + ")" : "cfg." + k + " = " + v);
    for (const [k] of GM.CFG_NUMS) if (cfg[k] !== def[k]) set(k, jv && k !== "scroll_lines" ? String(Math.round(cfg[k])) : num(cfg[k]));
    for (const [k] of GM.CFG_TOGGLES) if (cfg[k] !== def[k]) set(k, c ? String(cfg[k]) : bool(cfg[k], lang));
    for (const [k] of GM.CFG_CURSORS) {
      if (cfg.cursor[k] === def.cursor[k]) continue;
      const sh = cfg.cursor[k];
      C.push(c ? "cfg->cursor[GOOME_CUR_" + k.toUpperCase() + "] = GOOME_CURSOR_" + sh + ";" : cs ? "cfg[CursorKind." + (CS_CURK[k] || pascal(k)) + "] = CursorShape." + CS_CUR[sh] + ";"
        : jv ? "cfg.cursor(Config.CUR_" + k.toUpperCase() + ", Goome.CURSOR_" + sh + ");" : gd ? 'ui.config_set("cursor_' + k + '", GoomeUI.CURSOR_' + sh + ")" : "cfg.cursor[goome.CUR_" + k.toUpperCase() + "] = goome.CURSOR_" + sh);
    }
    if (cfg.mask !== def.mask) set("mask", strq(cfg.mask, lang));
    if (C.length) {
      if (c) L.push("goome_ui_config *cfg = goome_ui_cfg(u);");
      else if (cs) L.push("var cfg = ui.Config;");
      else if (jv) L.push("Config cfg = ui.config();");
      else if (!gd) L.push("cfg = ui.config");
      L.push(...C);
    }
    for (const [k] of GM.CFG_KEYS) {
      if (cfg.keys[k] === def.keys[k]) continue;
      const v = cfg.keys[k].trim() ? strq(cfg.keys[k].trim(), lang) : c ? "NULL" : cs || jv ? "null" : gd ? '""' : "None";
      L.push(c ? "goome_ui_bind(u, GOOME_ACT_" + k.toUpperCase() + ", " + v + ");" : cs ? "ui.Config.Bind(KeyAction." + (CS_ACT[k] || pascal(k)) + ", " + v + ");" : jv ? "ui.config().bind(Config.ACT_" + k.toUpperCase() + ", " + v + ");" : gd ? "ui.bind(GoomeUI.ACT_" + k.toUpperCase() + ", " + v + ")" : "ui.config.bind(goome.ACT_" + k.toUpperCase() + ", " + v + ")");
    }
    if (t.quick && t.quick.scale !== 1) {
      L.push(c ? "goome_ui_scale(u, " + num(t.quick.scale) + ");" : cs ? "ui.Scale(" + num(t.quick.scale) + ");" : jv ? "ui.scale(" + num(t.quick.scale) + ");" : "ui.scale(" + num(t.quick.scale) + ")");
    }
    return L;
  }

  function sectionThemes(ctx) {
    const lang = ctx.lang, L = [];
    for (const [id, v] of ctx.themeVars || []) {
      const t = GM.normTheme(GM.findTheme(ctx.project, id));
      const base = GM.themeBase(t);
      if (lang === "c") {
        L.push(v + " = *goome_ui_theme(u);");
        L.push((t.base === "light" ? "goome_ui_theme_light(&" : "goome_ui_theme_dark(&") + v + ");");
        L.push(...themeDiff(ctx, t, base, (k, x) => v + "." + k + " = " + x + ";"));
      }
    }
    return L;
  }

  const C_HELPERS = [
    "static inline double gm_min(double a, double b) { return a < b ? a : b; }",
    "static inline double gm_max(double a, double b) { return a > b ? a : b; }",
    "static inline double gm_abs(double a) { return a < 0 ? -a : a; }",
    "static inline double gm_floor(double a) { double t = (double)(long long)a; return t > a ? t - 1 : t; }",
    "static inline double gm_clamp(double v, double lo, double hi) { return v < lo ? lo : v > hi ? hi : v; }",
  ];
  const C_FMT = ["static const char *fmt(const char *f, ...)", "{", "    static char buf[8][256];", "    static int k;", "    char *b = buf[k++ & 7];", "    va_list ap;",
    "    va_start(ap, f);", "    vsnprintf(b, 256, f, ap);", "    va_end(ap);", "    return b;", "}", ""];

  function hotkeyBody(ctx, out) {
    const hk = (ctx.project.hotkeys || []).filter((k) => k && k.combo);
    const lang = ctx.lang;
    hk.forEach((k, i) => {
      const where = "hotkey " + k.combo;
      if (lang === "c") {
        out.add("case " + (i + 1) + ":");
        out.d++;
        emitActions(ctx, out, k.actions, where);
        out.add("break;");
        out.d--;
      } else if (lang === "cs" || lang === "java") {
        out.open((i ? "else if" : "if") + " (id == " + (i + 1) + ")");
        emitActions(ctx, out, k.actions, where);
        out.close();
      } else {
        out.open((i ? "elif" : "if") + " n == " + (i + 1) + ":");
        emitActions(ctx, out, k.actions, where);
        out.close();
      }
    });
    return hk;
  }

  function settingsOf(project) {
    return Object.assign({}, GM.SETTINGS_DEFAULT, project.settings || {});
  }
  function finish(code, lang, project) {
    const set = settingsOf(project);
    let L = code.split("\n");
    if (lang === "c" && set.braces === "allman") {
      const out = [];
      for (const l of L) {
        const ind = /^\s*/.exec(l)[0];
        let m;
        if ((m = /^(\s*)\} else(.*) \{$/.exec(l))) out.push(ind + "}", ind + "else" + m[2], ind + "{");
        else if (/\S \{$/.test(l) && !/= \{$/.test(l) && !/^\s*(typedef |static )?struct \{$/.test(l)) out.push(l.slice(0, -2), ind + "{");
        else out.push(l);
      }
      L = out;
    }
    if (lang === "gd") return L.map((l) => l.replace(/^( {4})+/, (m) => "\t".repeat(m.length / 4))).join("\n");
    const ind = Math.max(1, Math.min(8, set.indent | 0 || 4));
    if (ind !== 4) L = L.map((l) => l.replace(/^( {4})+/, (m) => " ".repeat((m.length / 4) * ind)));
    return L.join("\n");
  }

  function genC(project, warn) {
    const ctx = new Ctx(project, "c", warn);
    prepass(ctx);
    const app = project.mode === "app";
    const out = new Out(false);
    out.d = 1;
    if (app) {
      out.add("goome_ui_app(u, " + strq(project.title, "c") + ", " + flags(AFLAGS, project.app, "c") + ");");
      emitList(project.root, ctx, out, "app");
      if (project.app.statusbar) out.add("goome_ui_statusbar(u, " + textCode(ctx, project.app.status || "", {}).code + ");");
      out.add("goome_ui_app_end(u);");
    } else emitList(project.root, ctx, out, "overlay");
    const hout = new Out(false);
    hout.d = 2;
    const hks = hotkeyBody(ctx, hout);
    const els = [];
    for (const info of ctx.used.values()) els.push(elementCode(ctx, info));
    const th = themeLines(ctx);
    const cl = configLines(ctx);
    const sec = sectionThemes(ctx);
    const bl = bitmapLoads(ctx);
    const all = [out.text(), hout.text()].concat(els).join("\n");
    const usesMath = /\bgm_(min|max|abs|floor|clamp)\(/.test(all);
    const L = ["#define GOOME_IMPLEMENTATION", '#include "goome.h"', ""];
    if (ctx.need.fmt) L.push("#include <stdarg.h>");
    L.push("#include <stdio.h>", "#include <string.h>", "");
    if (usesMath) L.push(...C_HELPERS, "");
    if (ctx.need.fmt) L.push(...C_FMT);
    const statics = [];
    if (ctx.need.app) statics.push("static goome *app;");
    if (ctx.need.placeholder) statics.push("static goome_bitmap placeholder;");
    statics.push(...bl.decl);
    for (const x of ctx.extraSkins || []) statics.push("static goome_skin " + x.id + "_k;");
    for (const [, v] of ctx.themeVars || []) statics.push("static goome_theme " + v + ";");
    if (statics.length) L.push(...statics, "");
    const consts = ctx.consts.concat(ctx.top);
    if (consts.length) L.push(...consts, "");
    for (const f of ctx.fns) L.push("static void " + f + "(void)", "{", "}", "");
    for (const b of els) L.push(b, "");
    if (th.length) {
      L.push("static void set_theme(goome_ui *u)", "{", "    goome_theme *t = goome_ui_theme(u);");
      th.forEach((l) => L.push("    " + l));
      L.push("}", "");
    }
    if (cl.length) L.push("static void set_config(goome_ui *u)", "{", ...cl.map((l) => "    " + l), "}", "");
    L.push("static void draw(goome_ui *u)", "{", ...out.l, "}", "");
    if (hks.length) L.push("static void on_hotkey(goome_ui *u, int id)", "{", "    (void)u;", "    switch (id) {", ...hout.l, "    }", "}", "");
    L.push("int main(void)", "{", "    int err;");
    if (app) {
      if (project.app.titlebar) {
        L.push("    goome *g = goome_open(&(goome_opts){.title = " + strq(project.title, "c") + ", .mode = GOOME_MODE_WINDOW, .width = " + (project.app.w | 0) + ", .height = " + (project.app.h | 0) + ",");
        L.push("                                        .window_flags = GOOME_WINDOW_RESIZABLE | GOOME_WINDOW_BORDERLESS | GOOME_WINDOW_TRANSPARENT | GOOME_WINDOW_CENTER},");
        L.push("                          &err);");
      } else L.push("    goome *g = goome_open_app(" + strq(project.title, "c") + ", " + (project.app.w | 0) + ", " + (project.app.h | 0) + ", &err);");
      L.push("    if (!g) {", '        fprintf(stderr, "cant open a window: %s\\n", goome_strerror(err));', "        return 1;", "    }");
    } else {
      L.push("    goome *g = goome_open(&(goome_opts){.title = " + strq(project.title, "c") + ", .no_capture = 1}, &err);");
      L.push("    if (!g) {", '        fprintf(stderr, "cant open an overlay: %s\\n", goome_strerror(err));', "        return 1;", "    }");
    }
    if (ctx.need.app) L.push("    app = g;");
    L.push("    goome_ui *u = goome_ui_new(g);", "    if (!u) {", '        fprintf(stderr, "no memory for the ui\\n");', "        goome_close(g);", "        return 1;", "    }");
    bl.load.forEach((l) => L.push("    " + l));
    for (const x of ctx.extraSkins || []) L.push("    " + x.id + "_k = (goome_skin){&" + x.id + ", " + x.e + "};");
    if (th.length) L.push("    set_theme(u);");
    if (cl.length) L.push("    set_config(u);");
    sec.forEach((l) => L.push("    " + l));
    if (ctx.need.placeholder) L.push("    uint32_t ph[4] = {0xFF3A3F48, 0xFF3A3F48, 0xFF3A3F48, 0xFF3A3F48};", "    goome_bitmap_from_argb(ph, 2, 2, &placeholder);");
    hks.forEach((k, i) => L.push("    goome_hotkey(g, " + strq(k.combo, "c") + ", " + (i + 1) + ");"));
    L.push("    int running = 1, dirty = 1, test = !strncmp(goome_backend_name(g), \"test\", 4);", "    goome_pacer pace = {0};", "    while (running) {", "        goome_event ev;");
    L.push("        int wait = dirty || test || goome_ui_animating(u) ? goome_pace(&pace, 60) : 500;");
    L.push("        while (goome_poll(g, &ev, wait) > 0) {", "            if (ev.type == GOOME_QUIT || ev.type == GOOME_CLOSE) running = 0;");
    if (hks.length) L.push("            if (ev.type == GOOME_HOTKEY) on_hotkey(u, ev.id);");
    L.push("            goome_ui_feed(u, &ev);", "            dirty = 1, wait = 0;", "        }", "        if (!running) break;");
    L.push("        if (!dirty && !test && !goome_ui_animating(u)) continue;", "        dirty = 0;");
    L.push("        if (!goome_ui_begin(u, 0)) continue;");
    const xs = ctx.extraSkins || [];
    for (const x of xs) L.push("        goome_ui_push_skin(u, GOOME_SKIN_" + x.k.replace(/^skin_/, "").toUpperCase() + ", " + x.id + "_ok ? &" + x.id + "_k : NULL);");
    L.push("        draw(u);");
    if (xs.length) L.push("        goome_ui_pop(u, " + xs.length + ");");
    L.push("        goome_ui_end(u);", "    }", "    goome_ui_free(u);");
    if (ctx.need.placeholder) L.push("    goome_bitmap_free(&placeholder);");
    bl.free.forEach((l) => L.push("    " + l));
    L.push("    goome_close(g);", "    return 0;", "}", "");
    return { code: finish(L.join("\n"), "c", project), files: [...ctx.files] };
  }

  function genCS(project, warn) {
    const ctx = new Ctx(project, "cs", warn);
    prepass(ctx);
    const app = project.mode === "app";
    const out = new Out(false);
    out.d = 1;
    emitList(project.root, ctx, out, app ? "app" : "overlay");
    if (app && project.app.statusbar) out.add("ui.StatusBar(" + textCode(ctx, project.app.status || "", {}).code + ");");
    const hout = new Out(false);
    hout.d = 1;
    const hks = hotkeyBody(ctx, hout);
    const els = [];
    for (const info of ctx.used.values()) els.push(elementCode(ctx, info));
    const th = themeLines(ctx);
    const cl = configLines(ctx);
    const bl = bitmapLoads(ctx);
    const L = ["using System;", "using GoomeSharp;", ""];
    const tops = ctx.consts.concat(ctx.top);
    if (ctx.need.placeholder) tops.push("var placeholder = Bitmap.FromArgb(new uint[] { 0xFF3A3F48, 0xFF3A3F48, 0xFF3A3F48, 0xFF3A3F48 }, 2, 2);");
    tops.push(...bl.decl);
    if (tops.length) L.push(...tops, "");
    const reg = (gv) => hks.map((k, i) => gv + ".Hotkey(" + strq(k.combo, "cs") + ", " + (i + 1) + ");");
    if (app) {
      const fl = flags(AFLAGS, project.app, "cs");
      L.push("GoomeApp app;", "try", "{");
      if (project.app.titlebar) {
        L.push("    app = new GoomeApp(new GoomeOptions", "    {");
        L.push("        Title = " + strq(project.title, "cs") + ",", "        Mode = Mode.Window,", "        Width = " + (project.app.w | 0) + ",", "        Height = " + (project.app.h | 0) + ",");
        L.push("        WindowStyle = WindowStyle.Resizable | WindowStyle.Borderless | WindowStyle.Transparent | WindowStyle.Center,");
        L.push("    }) { Flags = " + fl + " };");
      } else L.push("    app = new GoomeApp(" + strq(project.title, "cs") + ", " + (project.app.w | 0) + ", " + (project.app.h | 0) + ") { Flags = " + fl + " };");
      L.push("}", "catch (GoomeException e)", "{", "    Console.Error.WriteLine(\"cant open a window: \" + e.Message);", "    return 1;", "}");
      L.push("using (app)", "{");
      if (th.length) L.push("    SetTheme(app.Ui.Theme);");
      if (cl.length) L.push("    SetConfig(app.Ui);");
      reg("app.Goome").forEach((l) => L.push("    " + l));
      if (hks.length) L.push("    app.OnEvent += ev =>", "    {", "        if (ev.Type == EventType.Hotkey) OnHotkey(app.Ui, ev.Id);", "    };");
      L.push("    app.Run(Draw);", "}", "return 0;", "");
    } else {
      L.push("Goome g;", "try", "{", "    g = new Goome(new GoomeOptions { Title = " + strq(project.title, "cs") + ", NoCapture = true });", "}");
      L.push("catch (GoomeException e)", "{", "    Console.Error.WriteLine(\"cant open an overlay: \" + e.Message);", "    return 1;", "}");
      L.push("using (g)", "using (var u = new Ui(g))", "{");
      if (th.length) L.push("    SetTheme(u.Theme);");
      if (cl.length) L.push("    SetConfig(u);");
      reg("g").forEach((l) => L.push("    " + l));
      L.push("    bool running = true, dirty = true, test = g.BackendName.StartsWith(\"test\");", "    var pace = new Pacer();", "    while (running)", "    {");
      L.push("        int wait = dirty || test || u.Animating ? pace.Pace(60) : 500;");
      L.push("        while (g.Poll(out var ev, wait))", "        {", "            if (ev.Type == EventType.Quit || ev.Type == EventType.Close) running = false;");
      if (hks.length) L.push("            if (ev.Type == EventType.Hotkey) OnHotkey(u, ev.Id);");
      L.push("            u.Feed(ev);", "            dirty = true;", "            wait = 0;", "        }", "        if (!running) break;");
      L.push("        if (!dirty && !test && !u.Animating) continue;", "        dirty = false;");
      L.push("        if (u.Begin(0) == null) continue;", "        Draw(u);", "        u.End();", "    }", "}", "return 0;", "");
    }
    if (th.length) {
      L.push("void SetTheme(Theme t)", "{");
      th.forEach((l) => L.push("    " + l));
      L.push("}", "");
    }
    if (cl.length) L.push("void SetConfig(Ui ui)", "{", ...cl.map((l) => "    " + l), "}", "");
    L.push("void Draw(Ui ui)", "{", ...out.l, "}", "");
    if (hks.length) L.push("void OnHotkey(Ui ui, int id)", "{", ...hout.l, "}", "");
    for (const f of ctx.fns) L.push("static void " + pascal(f) + "()", "{", "}", "");
    els.forEach((b) => L.push(b, ""));
    L.push(...bl.helpers);
    return { code: finish(L.join("\n").replace(/\n+$/, "\n"), "cs", project), files: [...ctx.files] };
  }

  function genPy(project, warn) {
    const ctx = new Ctx(project, "py", warn);
    prepass(ctx);
    const app = project.mode === "app";
    const out = new Out(true);
    out.d = 1;
    emitList(project.root, ctx, out, app ? "app" : "overlay");
    if (app && project.app.statusbar) out.add("ui.statusbar(" + textCode(ctx, project.app.status || "", {}).code + ")");
    const hout = new Out(true);
    hout.d = 1;
    const hks = hotkeyBody(ctx, hout);
    const els = [];
    for (const info of ctx.used.values()) els.push(elementCode(ctx, info));
    const th = themeLines(ctx);
    const cl = configLines(ctx);
    const bl = bitmapLoads(ctx);
    const L = [];
    if (ctx.need.base64) L.push("import base64");
    if (els.some((b) => /\bmath\./.test(b))) L.push("import math");
    L.push("import sys");
    if (ctx.need.placeholder) L.push("from array import array");
    L.push("", "import goome", "");
    if (ctx.consts.length) L.push(...ctx.consts, "");
    if (ctx.need.placeholder) L.push('PLACEHOLDER = goome.Bitmap.from_argb(array("I", [0xFF3A3F48] * 4), 2, 2)', "");
    if (bl.helpers.length) L.push(...bl.helpers, "");
    if (bl.decl.length) L.push(...bl.decl, "");
    if (ctx.need.g) L.push("G = None", "");
    L.push("", "class State:");
    if (ctx.top.length) ctx.top.forEach((l) => L.push("    " + l));
    else L.push("    pass");
    L.push("", "", "s = State()", "");
    for (const f of ctx.fns) L.push("", "def " + f + "():", "    pass", "");
    els.forEach((b) => L.push("", b, ""));
    if (th.length) {
      L.push("", "def set_theme(t):");
      th.forEach((l) => L.push("    " + l));
      L.push("");
    }
    if (cl.length) L.push("", "def set_config(ui):", ...cl.map((l) => "    " + l), "");
    L.push("", "def draw(ui):");
    if (out.l.length) L.push(...out.l);
    else L.push("    pass");
    L.push("");
    if (hks.length) L.push("", "def on_hotkey(ui, n):", ...hout.l, "");
    const regs = (gv) => hks.length ? ["    for n, combo in enumerate((" + hks.map((k) => strq(k.combo, "py")).join(", ") + (hks.length === 1 ? "," : "") + "), 1):", "        try:", "            " + gv + ".hotkey(combo, n)", "        except goome.GoomeError:", "            pass"] : [];
    if (app) {
      const fl = flags(AFLAGS, project.app, "py");
      const extra = project.app.titlebar ? ", window_flags=goome.WINDOW_RESIZABLE | goome.WINDOW_BORDERLESS | goome.WINDOW_TRANSPARENT | goome.WINDOW_CENTER" : "";
      L.push("", "app = goome.App(" + strq(project.title, "py") + ", " + (project.app.w | 0) + ", " + (project.app.h | 0) + ", flags=" + fl + extra + ")", "");
      if (th.length || cl.length || ctx.need.g || hks.length) {
        L.push("", "@app.on_start", "def start():");
        if (ctx.need.g) L.push("    global G", "    G = app.g");
        if (th.length) L.push("    set_theme(app.ui.theme)");
        if (cl.length) L.push("    set_config(app.ui)");
        L.push(...regs("app.g"), "");
      }
      if (hks.length) L.push("", "@app.event", "def on_event(ev):", "    if ev.type == goome.HOTKEY:", "        on_hotkey(app.ui, ev.id)", "");
      L.push("", "@app.frame", "def frame(ui):", "    draw(ui)", "");
      L.push("", "def main():", "    try:", "        app.run()", "    except goome.GoomeError as e:", '        print("cant open a window: %s" % e, file=sys.stderr)', "        return 1", "    return 0", "");
    } else {
      L.push("", "def main():");
      if (ctx.need.g) L.push("    global G");
      L.push("    try:", "        g = goome.open(" + strq(project.title, "py") + ", no_capture=True)", "    except goome.GoomeError as e:");
      L.push('        print("cant open an overlay: %s" % e, file=sys.stderr)', "        return 1");
      if (ctx.need.g) L.push("    G = g");
      L.push("    ui = g.ui()");
      if (th.length) L.push("    set_theme(ui.theme)");
      if (cl.length) L.push("    set_config(ui)");
      L.push(...regs("g"));
      L.push('    test = g.backend_name.split()[0] == "test"', "    pace = goome.Pacer(60)", "    running, dirty = True, True", "    while running:");
      L.push("        busy = dirty or test or ui.animating");
      L.push("        for ev in g.events(pace.wait() if busy else 500):", "            if ev.type in (goome.QUIT, goome.CLOSE):", "                running = False");
      if (hks.length) L.push("            if ev.type == goome.HOTKEY:", "                on_hotkey(ui, ev.id)");
      L.push("            ui.feed(ev)", "            dirty = True", "        if not running:", "            break");
      L.push("        if not (dirty or test or ui.animating):", "            continue", "        dirty = False");
      L.push("        if ui.begin(0) is None:", "            continue", "        draw(ui)", "        ui.end()");
      L.push("    ui.close()", "    g.close()", "    return 0", "");
    }
    L.push("", 'if __name__ == "__main__":', "    sys.exit(main())", "");
    return { code: finish(L.join("\n").replace(/\n{4,}/g, "\n\n\n").replace(/^\n+/, ""), "py", project), files: [...ctx.files] };
  }

  function genJava(project, warn) {
    const ctx = new Ctx(project, "java", warn);
    prepass(ctx);
    const app = project.mode === "app";
    const cls = javaClass(project);
    const out = new Out(false);
    out.d = 2;
    emitList(project.root, ctx, out, app ? "app" : "overlay");
    if (app && project.app.statusbar) out.add("ui.statusbar(" + textCode(ctx, project.app.status || "", {}).code + ");");
    const hout = new Out(false);
    hout.d = 2;
    const hks = hotkeyBody(ctx, hout);
    const els = [];
    for (const info of ctx.used.values()) els.push(elementCode(ctx, info));
    const th = themeLines(ctx);
    const cl = configLines(ctx);
    const bl = bitmapLoads(ctx);
    const I = (l) => (l === "" ? "" : "    " + l);
    const L = ["import io.github.goomeui.*;"];
    if (ctx.need.doubleBuffer) L.push("import java.nio.DoubleBuffer;");
    if (ctx.need.base64) L.push("import java.util.Base64;");
    L.push("", "public final class " + cls + " {");
    const fields = ctx.consts.concat(ctx.top);
    if (ctx.need.placeholder) fields.push("static Bitmap placeholder;");
    fields.push(...bl.decl);
    if (fields.length) L.push(...fields.map(I), "");
    const setup = (ui, gv) => {
      const S = bl.load.slice();
      if (ctx.need.placeholder) S.push("placeholder = Bitmap.fromArgb(new int[] {0xFF3A3F48, 0xFF3A3F48, 0xFF3A3F48, 0xFF3A3F48}, 2, 2);");
      if (th.length) S.push("setTheme(" + ui + ".theme());");
      if (cl.length) S.push("setConfig(" + ui + ");");
      hks.forEach((k, i) => S.push("try {", "    " + gv + ".hotkey(" + strq(k.combo, "cs") + ", " + (i + 1) + ");", "} catch (GoomeException e) {", "    System.err.println(\"couldnt grab " + strq(k.combo, "cs").slice(1, -1) + ": \" + e.getMessage());", "}"));
      return S;
    };
    L.push("    public static void main(String[] args) {");
    if (app) {
      const fl = flags(AFLAGS, project.app, "java");
      L.push("        App app = new App(" + strq(project.title, "cs") + ", " + (project.app.w | 0) + ", " + (project.app.h | 0) + ").flags(" + fl + ");");
      if (project.app.titlebar) L.push("        app.options(new Options().windowFlags(Goome.WINDOW_RESIZABLE | Goome.WINDOW_BORDERLESS | Goome.WINDOW_TRANSPARENT | Goome.WINDOW_CENTER));");
      const S = setup("ui", "app.goome()");
      if (S.length) L.push("        app.onStart(() -> {", "            Ui ui = app.ui();", ...S.map((l) => "            " + l), "        });");
      if (hks.length) L.push("        app.onEvent(ev -> {", "            if (ev.type() == Goome.HOTKEY) onHotkey(app.ui(), ev.id());", "            return false;", "        });");
      L.push("        app.onFrame(" + cls + "::draw);");
      L.push("        try {", "            app.run();", "        } catch (GoomeException e) {", "            System.err.println(\"cant open a window: \" + e.getMessage());", "            System.exit(1);", "        }");
    } else {
      L.push("        Goome g;", "        try {", "            g = Goome.open(new Options().title(" + strq(project.title, "cs") + ").noCapture(true));", "        } catch (GoomeException e) {");
      L.push("            System.err.println(\"cant open an overlay: \" + e.getMessage());", "            System.exit(1);", "            return;", "        }");
      L.push("        try (g; Ui u = g.ui(); Pacer pace = new Pacer(60)) {");
      setup("u", "g").forEach((l) => L.push("            " + l));
      L.push("            boolean running = true, dirty = true, test = g.backendName().startsWith(\"test\");", "            while (running) {");
      L.push("                int wait = dirty || test || u.animating() ? pace.next() : 500;");
      L.push("                for (Event ev = g.poll(wait); ev != null; ev = g.poll(0)) {", "                    if (ev.type() == Goome.QUIT || ev.type() == Goome.CLOSE) running = false;");
      if (hks.length) L.push("                    if (ev.type() == Goome.HOTKEY) onHotkey(u, ev.id());");
      L.push("                    u.feed(ev);", "                    dirty = true;", "                }", "                if (!running) break;");
      L.push("                if (!dirty && !test && !u.animating()) continue;", "                dirty = false;");
      L.push("                if (u.begin(0) == null) continue;", "                draw(u);", "                u.end();", "            }", "        }");
    }
    L.push("    }", "");
    if (th.length) L.push("    static void setTheme(Theme t) {", ...th.map((l) => "        " + l), "    }", "");
    if (cl.length) L.push("    static void setConfig(Ui ui) {", ...cl.map((l) => "        " + l), "    }", "");
    L.push("    static void draw(Ui ui) {", ...out.l, "    }", "");
    if (hks.length) L.push("    static void onHotkey(Ui ui, int id) {", ...hout.l, "    }", "");
    for (const f of ctx.fns) L.push("    static void " + camel(f) + "() {", "    }", "");
    els.forEach((b) => L.push(...b.split("\n").map(I), ""));
    bl.helpers.forEach((l) => L.push(I(l)));
    while (L[L.length - 1] === "") L.pop();
    L.push("}", "");
    return { code: finish(L.join("\n"), "java", project), files: [...ctx.files], file: cls + ".java" };
  }

  const GD_KEYS = { space: "SPACE", esc: "ESCAPE", escape: "ESCAPE", enter: "ENTER", return: "ENTER", tab: "TAB", backspace: "BACKSPACE", delete: "DELETE", del: "DELETE",
    left: "LEFT", right: "RIGHT", up: "UP", down: "DOWN", home: "HOME", end: "END", pageup: "PAGEUP", pagedown: "PAGEDOWN", insert: "INSERT", plus: "EQUAL" };
  const GD_CHARS = { "`": "QUOTELEFT", "-": "MINUS", "=": "EQUAL", "[": "BRACKETLEFT", "]": "BRACKETRIGHT", "\\": "BACKSLASH", ";": "SEMICOLON", "'": "APOSTROPHE", ",": "COMMA", ".": "PERIOD", "/": "SLASH" };
  const GD_MODS = { alt: "alt", opt: "alt", option: "alt", ctrl: "ctrl", control: "ctrl", shift: "shift", super: "meta", win: "meta", cmd: "meta", meta: "meta" };
  function gdCombo(combo) {
    let s = String(combo || "").trim();
    const m = new Set();
    for (;;) {
      const x = /^([a-z]+)\+(.+)$/i.exec(s);
      if (!x || !GD_MODS[x[1].toLowerCase()]) break;
      m.add(GD_MODS[x[1].toLowerCase()]);
      s = x[2];
    }
    let key = null;
    const lo = s.toLowerCase();
    if (s.length === 1) {
      const sh = "~!@#$%^&*()_+{}|:\"<>?".indexOf(s), pl = "`1234567890-=[]\\;',./";
      let ch = s;
      if (sh >= 0) ch = pl[sh], m.add("shift");
      if (/[A-Z]/.test(ch)) m.add("shift");
      if (/[a-z0-9]/i.test(ch)) key = "KEY_" + ch.toUpperCase();
      else if (GD_CHARS[ch]) key = "KEY_" + GD_CHARS[ch];
    } else if (/^f([1-9]|1[0-2])$/.test(lo)) key = "KEY_F" + lo.slice(1);
    else if (GD_KEYS[lo]) {
      key = "KEY_" + GD_KEYS[lo];
      if (lo === "plus") m.add("shift");
    }
    if (!key) return null;
    return ["e.keycode == " + key].concat(["ctrl", "shift", "alt", "meta"].map((k) => (m.has(k) ? "" : "not ") + "e." + k + "_pressed")).join(" and ");
  }

  function genGd(project, warn) {
    const ctx = new Ctx(project, "gd", warn);
    prepass(ctx);
    const app = project.mode === "app";
    if (!app) warn("", "godot has no see-through desktop overlay, in godot these windows float over your game inside the GoomeView instead");
    const out = new Out(true);
    out.d = 1;
    if (app) {
      out.open("if ui.app_begin(" + strq(project.title, "gd") + ", " + flags(AFLAGS, project.app, "gd") + "):");
      emitList(project.root, ctx, out, "app");
      if (project.app.statusbar) out.add("ui.statusbar(" + textCode(ctx, project.app.status || "", {}).code + ")");
      out.close();
      out.add("ui.app_end()");
    } else emitList(project.root, ctx, out, "overlay");
    const hout = new Out(true);
    hout.d = 1;
    const hks = hotkeyBody(ctx, hout);
    const els = [];
    for (const info of ctx.used.values()) els.push(elementCode(ctx, info));
    const th = themeLines(ctx);
    const cl = configLines(ctx);
    const bl = bitmapLoads(ctx);
    const setup = bl.load.concat(th, cl);
    const L = ["extends GoomeView", ""];
    if (ctx.consts.length) L.push(...ctx.consts, "");
    const fields = ctx.top.concat(bl.decl);
    L.push("", "class State:");
    if (fields.length) fields.forEach((l) => L.push("    " + l));
    else L.push("    pass");
    L.push("", "", "var s := State.new()");
    if (setup.length) L.push("var _started := false");
    if (hks.length) L.push("var _hotkey := 0");
    L.push("", "", "func _goome_frame(ui: GoomeUI) -> void:");
    if (setup.length) L.push("    if not _started:", "        _started = true", "        _setup(ui)");
    if (hks.length) L.push("    if _hotkey:", "        var n := _hotkey", "        _hotkey = 0", "        _on_hotkey(ui, n)");
    if (out.l.length) L.push(...out.l);
    else if (!setup.length && !hks.length) L.push("    pass");
    if (setup.length) L.push("", "", "func _setup(ui: GoomeUI) -> void:", ...setup.map((l) => "    " + l));
    if (hks.length) {
      warn("", "godot cant grab hotkeys for the whole desktop, these only fire while the game window has focus");
      const conds = [];
      hks.forEach((k, i) => {
        const c = gdCombo(k.combo);
        if (c) conds.push([c, i + 1]);
        else warn("", "cant turn the hotkey " + k.combo + " into a godot key, skipped");
      });
      if (conds.length) {
        L.push("", "", "func _unhandled_key_input(event: InputEvent) -> void:", "    var e := event as InputEventKey", "    if e == null or not e.pressed or e.echo:", "        return");
        conds.forEach(([c, n], i) => L.push("    " + (i ? "elif " : "if ") + c + ":", "        _hotkey = " + n));
        L.push("    else:", "        return", "    get_viewport().set_input_as_handled()", "    redraw()");
      }
      L.push("", "", "func _on_hotkey(ui: GoomeUI, n: int) -> void:", ...hout.l);
    }
    for (const f of ctx.fns) L.push("", "", "func " + gdFn(f) + "() -> void:", "    pass");
    els.forEach((b) => L.push("", "", b));
    if (ctx.need.argb) L.push("", "", "func _argb(v: int) -> Color:", "    return Color.hex(((v & 0xFFFFFF) << 8) | ((v >> 24) & 0xFF))");
    if (bl.helpers.length) L.push("", "", ...bl.helpers);
    while (L[L.length - 1] === "") L.pop();
    L.push("");
    return { code: finish(L.join("\n"), "gd", project), files: ctx.files.size ? [...ctx.files].map((f) => "res://" + f) : [], file: GM.ident(project.name || "ui", "ui") + ".gd" };
  }

  X.generate = (project, lang) => {
    const warnings = [];
    const seen = new Set();
    const warn = (id, msg) => {
      const k = id + "|" + msg;
      if (seen.has(k)) return;
      seen.add(k);
      warnings.push({ id, msg });
    };
    const pj = GM.normProject(GM.clone(project));
    const r = lang === "cs" ? genCS(pj, warn) : lang === "py" ? genPy(pj, warn) : lang === "java" ? genJava(pj, warn) : lang === "gd" ? genGd(pj, warn) : genC(pj, warn);
    return { code: r.code, warnings, files: r.files, file: r.file };
  };

  X.hint = (project, lang) => {
    if (lang === "cs") return "dotnet new console -n ui, reference GoomeSharp, paste this over Program.cs, dotnet run";
    if (lang === "py") return "PYTHONPATH=path/to/python-goome python3 ui.py";
    if (lang === "java") {
      const n = javaClass(GM.normProject(GM.clone(project)));
      return "java 22+: java --enable-native-access=ALL-UNNAMED -cp goome-0.2.0.jar " + n + ".java    or javac -cp goome-0.2.0.jar " + n + ".java, then run it with -cp goome-0.2.0.jar:.";
    }
    if (lang === "gd") return "put addons/goome in your project, add a GoomeView node (anchors Full Rect) and attach this script to it";
    return "linux/mac: cc -std=c99 -I path/to/c-goome ui.c -o ui && ./ui    windows: cl /std:c11 /I path\\to\\c-goome ui.c";
  };

  if (typeof module !== "undefined" && module.exports) module.exports = X;
  else root.GMCode = X;
})(typeof window !== "undefined" ? window : globalThis);
