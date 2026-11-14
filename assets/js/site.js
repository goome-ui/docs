var toggle = document.querySelector(".nav-toggle");
var side = document.getElementById("sidebar");
toggle.addEventListener("click", function () {
  var open = side.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
  toggle.textContent = open ? "Close" : "Menu";
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
