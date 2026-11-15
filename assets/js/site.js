var toggle = document.querySelector(".nav-toggle");
var side = document.getElementById("sidebar");
var shade = document.querySelector(".shade");
var phone = window.matchMedia("(max-width: 860px)");

function setDrawer(open) {
  side.classList.toggle("open", open);
  shade.hidden = !open;
  document.body.classList.toggle("locked", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.textContent = open ? "Close" : "Menu";
}

toggle.addEventListener("click", function () {
  setDrawer(!side.classList.contains("open"));
});

shade.addEventListener("click", function () { setDrawer(false); });

side.addEventListener("click", function (e) {
  if (e.target.closest("a") && phone.matches) setDrawer(false);
});

phone.addEventListener("change", function () {
  if (!phone.matches) setDrawer(false);
});

var names = { c: "C", csharp: "C#", python: "Python", java: "Java" };
var saved = null;
try { saved = localStorage.getItem("goome-lang"); } catch (e) {}

function lang(el) {
  var m = el.className.match(/language-(c|csharp|python|java)\b/);
  return m ? m[1] : null;
}

function pick(want) {
  document.querySelectorAll(".tabs").forEach(function (box) {
    var has = box.querySelector('[data-lang="' + want + '"]');
    if (!has) return;
    box.querySelectorAll("[data-lang]").forEach(function (el) {
      var on = el.dataset.lang === want;
      if (el.tagName === "BUTTON") el.classList.toggle("on", on);
      else el.hidden = !on;
    });
  });
}

document.querySelectorAll(".content > div.highlighter-rouge").forEach(function (block) {
  if (!lang(block) || block.closest(".tabs")) return;
  var group = [block];
  var next = block.nextElementSibling;
  while (next && lang(next) && group.every(function (g) { return lang(g) !== lang(next); })) {
    group.push(next);
    next = next.nextElementSibling;
  }
  if (group.length < 2) return;
  var box = document.createElement("div");
  box.className = "tabs";
  var row = document.createElement("div");
  row.className = "tab-row";
  box.appendChild(row);
  block.parentNode.insertBefore(box, block);
  group.forEach(function (g, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = names[lang(g)];
    b.dataset.lang = lang(g);
    b.addEventListener("click", function () {
      pick(b.dataset.lang);
      try { localStorage.setItem("goome-lang", b.dataset.lang); } catch (e) {}
    });
    row.appendChild(b);
    g.dataset.lang = lang(g);
    box.appendChild(g);
    if (i === 0) b.classList.add("on");
    else g.hidden = true;
  });
});

if (saved) pick(saved);

document.querySelectorAll(".content table").forEach(function (table) {
  if (table.parentNode.classList.contains("table-wrap")) return;
  var wrap = document.createElement("div");
  wrap.className = "table-wrap";
  table.parentNode.insertBefore(wrap, table);
  wrap.appendChild(table);
});

function jumpTo(anchor) {
  var el = anchor && document.getElementById(anchor);
  if (el) el.scrollIntoView();
  else if (!anchor) window.scrollTo(0, 0);
}

var params = new URLSearchParams(location.search);
var wantLang = params.get("lang");
if (wantLang && names[wantLang]) {
  pick(wantLang);
  history.replaceState(null, "", location.pathname + location.hash);
  if (location.hash) jumpTo(decodeURIComponent(location.hash.slice(1)));
}

var toc = document.getElementById("toc");
var heads = Array.prototype.slice.call(document.querySelectorAll(".content h2[id], .content h3[id]"));
if (heads.length > 40) heads = heads.filter(function (h) { return h.tagName === "H2"; });
if (toc && heads.length > 1) {
  var title = document.createElement("p");
  title.className = "toc-title";
  title.textContent = "On this page";
  toc.appendChild(title);
  var list = document.createElement("ul");
  var links = {};
  heads.forEach(function (h) {
    var li = document.createElement("li");
    li.className = h.tagName === "H3" ? "sub" : "";
    var a = document.createElement("a");
    a.href = "#" + h.id;
    var copy = h.cloneNode(true);
    copy.querySelectorAll("kbd").forEach(function (k) { k.remove(); });
    a.textContent = copy.textContent.trim();
    li.appendChild(a);
    list.appendChild(li);
    links[h.id] = a;
  });
  toc.appendChild(list);

  var current = null;
  var spy = function () {
    var best = heads[0];
    heads.forEach(function (h) {
      if (h.getBoundingClientRect().top < 120) best = h;
    });
    if (current === best) return;
    if (current) links[current.id].classList.remove("here");
    links[best.id].classList.add("here");
    current = best;
  };
  var queued = false;
  window.addEventListener("scroll", function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; spy(); });
  }, { passive: true });
  spy();
}

var box = document.getElementById("search");
var input = document.getElementById("search-input");
var hits = document.getElementById("search-hits");
var openBtn = document.querySelector(".search-open");
var closeBtn = document.querySelector(".search-close");
var docs = null;
var loading = null;
var shown = [];
var active = -1;
var weights = { t: 13, h: 6, k: 3, x: 1 };

function words(str) {
  var out = {};
  (str.match(/[A-Za-z0-9_]+/g) || []).forEach(function (w) {
    out[w.toLowerCase()] = 1;
    var parts = [];
    w.split("_").forEach(function (part) {
      (part.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|[0-9]+/g) || []).forEach(function (bit) {
        parts.push(bit.toLowerCase());
      });
    });
    for (var i = 0; i < parts.length; i++) {
      out[parts[i]] = 1;
      out[parts.slice(i).join("")] = 1;
    }
  });
  return Object.keys(out);
}

function load() {
  if (loading) return loading;
  loading = fetch(input.dataset.index).then(function (r) { return r.json(); }).then(function (pages) {
    docs = [];
    pages.forEach(function (p) {
      var titleWords = words(p.t);
      p.s.forEach(function (s) {
        docs.push({
          page: p,
          sec: s,
          t: titleWords,
          h: words(s.h),
          x: words(s.x),
          k: s.k.map(function (c) { return { lang: c[0], src: c[1], w: words(c[1]) }; })
        });
      });
    });
    return docs;
  }).catch(function () { loading = null; });
  return loading;
}

function has(list, q) {
  var best = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i] === q) return 1.5;
    if (best === 0 && list[i].indexOf(q) === 0) best = 1;
  }
  return best;
}

function score(d, want, raw, loose) {
  var total = 0;
  var missed = 0;
  var fromCode = false;
  var codeHits = {};
  for (var i = 0; i < want.length; i++) {
    var q = want[i];
    var best = has(d.t, q) * (d.sec.a ? 3 : weights.t);
    var where = "t";
    var h = has(d.h, q) * weights.h;
    if (h > best) { best = h; where = "h"; }
    var k = 0;
    d.k.forEach(function (c) {
      var m = has(c.w, q);
      if (!m) return;
      codeHits[c.lang] = (codeHits[c.lang] || 0) + m;
      k = Math.max(k, m * weights.k);
    });
    if (k > best) { best = k; where = "k"; }
    var x = has(d.x, q) * weights.x;
    if (x > best) { best = x; where = "x"; }
    if (!best && /^[0-9]+$/.test(q)) continue;
    if (!best) {
      if (!loose) return null;
      missed++;
      continue;
    }
    if (where === "k") fromCode = true;
    total += best;
  }
  if (missed && (want.length < 4 || missed * 3 > want.length)) return null;
  var low = raw.toLowerCase();
  if (d.sec.h.toLowerCase().indexOf(low) >= 0) total += 3;
  var codeLang = null;
  var codeBest = 0;
  d.k.forEach(function (c) {
    var s = codeHits[c.lang] || 0;
    if (c.src.indexOf(raw) >= 0) s += 4;
    else if (c.src.toLowerCase().indexOf(low) >= 0) s += 2;
    if (s > codeBest || (s === codeBest && s > 0 && c.lang === saved)) { codeBest = s; codeLang = c.lang; }
  });
  if (codeBest >= 4) total += 2;
  return { d: d, score: total, lang: fromCode && names[codeLang] ? codeLang : null, code: fromCode ? codeLang : null };
}

function terms(raw) {
  return (raw.toLowerCase().match(/[a-z0-9_]+/g) || []).map(function (t) { return t.replace(/_/g, ""); }).filter(Boolean);
}

function search(raw) {
  var want = terms(raw);
  if (!want.length || !docs) return [];
  var found = [];
  docs.forEach(function (d) {
    var r = score(d, want, raw, false);
    if (r) found.push(r);
  });
  if (!found.length) {
    docs.forEach(function (d) {
      var r = score(d, want, raw, true);
      if (r) found.push(r);
    });
  }
  found.sort(function (a, b) { return b.score - a.score; });
  var perPage = {};
  return found.filter(function (r) {
    perPage[r.d.page.u] = (perPage[r.d.page.u] || 0) + 1;
    return perPage[r.d.page.u] <= 3;
  }).slice(0, 12);
}

function esc(s) {
  return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
}

function mark(s, want) {
  if (!want.length) return esc(s);
  var re = new RegExp("(" + want.map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }).join("|") + ")", "gi");
  var out = "";
  var last = 0;
  s.replace(re, function (m, g, at) {
    out += esc(s.slice(last, at)) + "<mark>" + esc(m) + "</mark>";
    last = at + m.length;
    return m;
  });
  return out + esc(s.slice(last));
}

function snippet(s, want) {
  var low = s.toLowerCase();
  var at = -1;
  want.forEach(function (t) {
    var i = low.indexOf(t);
    if (i >= 0 && (at < 0 || i < at)) at = i;
  });
  if (at < 0) at = 0;
  var start = Math.max(0, at - 40);
  var end = Math.min(s.length, start + 150);
  if (start > 0) {
    var space = s.indexOf(" ", start);
    if (space > 0 && space < at) start = space + 1;
  }
  return (start > 0 ? "..." : "") + s.slice(start, end) + (end < s.length ? "..." : "");
}

function linkFor(r) {
  var p = r.d.page.u;
  if (r.lang) p += "?lang=" + r.lang;
  if (r.d.sec.a) p += "#" + r.d.sec.a;
  return p;
}

function render() {
  var raw = input.value.trim();
  var want = terms(raw);
  shown = raw ? search(raw) : [];
  active = shown.length ? 0 : -1;
  hits.innerHTML = "";
  if (!raw) {
    hits.hidden = true;
    input.setAttribute("aria-expanded", "false");
    return;
  }
  if (!shown.length) {
    var none = document.createElement("p");
    none.className = "search-none";
    none.textContent = docs ? "Nothing for that, try a shorter word" : "Loading the index...";
    hits.appendChild(none);
  }
  shown.forEach(function (r, i) {
    var a = document.createElement("a");
    a.className = "hit";
    a.id = "hit-" + i;
    a.href = linkFor(r);
    a.setAttribute("role", "option");
    var code = r.code && r.d.k.filter(function (c) { return c.lang === r.code; })[0];
    var text = code ? code.src : (r.d.sec.x || (r.d.k[0] && r.d.k[0].src) || "");
    var html = '<span class="hit-title">' + mark(r.d.page.t, want) + "</span>";
    if (r.d.sec.h) html += '<span class="hit-head">' + mark(r.d.sec.h, want) + "</span>";
    if (text) html += '<span class="hit-text' + (code ? " is-code" : "") + '">' + mark(snippet(text, want), want) + "</span>";
    if (r.lang) html += '<kbd class="hit-lang">' + names[r.lang] + "</kbd>";
    a.innerHTML = html;
    a.addEventListener("mousemove", function () { setActive(i); });
    a.addEventListener("click", function (e) { go(r, e); });
    hits.appendChild(a);
  });
  hits.hidden = false;
  input.setAttribute("aria-expanded", "true");
  setActive(active);
}

function setActive(i) {
  var els = hits.querySelectorAll(".hit");
  els.forEach(function (el, n) {
    el.classList.toggle("on", n === i);
    el.setAttribute("aria-selected", n === i);
  });
  active = i;
  if (i >= 0 && els[i]) {
    input.setAttribute("aria-activedescendant", els[i].id);
    els[i].scrollIntoView({ block: "nearest" });
  } else {
    input.removeAttribute("aria-activedescendant");
  }
}

function go(r, e) {
  var url = new URL(linkFor(r), location.href);
  if (e && (e.ctrlKey || e.metaKey || e.shiftKey)) return;
  if (url.pathname === location.pathname) {
    if (e) e.preventDefault();
    if (r.lang) pick(r.lang);
    history.pushState(null, "", url.pathname + url.hash);
    closeSearch();
    jumpTo(r.d.sec.a);
    return;
  }
  if (!e) location.href = url.href;
}

function openSearch() {
  document.body.classList.add("searching");
  load().then(function () { if (input.value) render(); });
  input.focus();
}

function closeSearch() {
  document.body.classList.remove("searching");
  hits.hidden = true;
  input.setAttribute("aria-expanded", "false");
  input.blur();
}

input.addEventListener("focus", function () {
  load().then(function () { if (input.value) render(); });
});

input.addEventListener("input", function () {
  render();
  if (!docs) load().then(render);
});

input.addEventListener("keydown", function (e) {
  if (e.key === "ArrowDown" && shown.length) {
    e.preventDefault();
    setActive((active + 1) % shown.length);
  } else if (e.key === "ArrowUp" && shown.length) {
    e.preventDefault();
    setActive((active - 1 + shown.length) % shown.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (shown[active]) go(shown[active]);
  } else if (e.key === "Escape") {
    e.preventDefault();
    if (input.value && !hits.hidden) { input.value = ""; render(); }
    else closeSearch();
  }
});

openBtn.addEventListener("click", openSearch);
closeBtn.addEventListener("click", closeSearch);

document.addEventListener("click", function (e) {
  if (box.contains(e.target) || openBtn.contains(e.target)) return;
  document.body.classList.remove("searching");
  hits.hidden = true;
  input.setAttribute("aria-expanded", "false");
});

document.addEventListener("keydown", function (e) {
  var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
  if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    openSearch();
    input.select();
  } else if (e.key === "/" && !typing) {
    e.preventDefault();
    openSearch();
  } else if (e.key === "Escape" && side.classList.contains("open")) {
    setDrawer(false);
    toggle.focus();
  }
});
