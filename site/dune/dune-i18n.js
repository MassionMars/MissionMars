/* Language of the game pages. The game text is written in Russian; DUNE_DICT maps it (numbers as {n}) to English and
 * Tajik. The engine translates text nodes, a few attributes and canvas text, and follows DOM changes, so every
 * mini-game screen, button and result card switches language with the site. */
(function () {
  "use strict";
  var IDX = { en: 0, tg: 1 }, lang = "ru", D = window.DUNE_DICT || {};
  var NUM = /-?\d+(?:\.\d+)?/g, ATTR = ["title", "aria-label", "placeholder", "alt"];
  var seen = typeof WeakMap === "function" ? new WeakMap() : null; // node -> {src, out}
  var cache = {};

  function tr(s) {
    if (lang === "ru" || typeof s !== "string" || !/[А-Яа-яЁё]/.test(s)) return s;
    var ck = lang + "|" + s; if (cache[ck] !== undefined) return cache[ck];
    var lead = s.match(/^\s*/)[0], tail = s.match(/\s*$/)[0], core = s.trim(), nums = core.match(NUM) || [];
    var key = core.replace(NUM, "{n}").replace(/\s+/g, " "), e = D[key], out = s;
    if (e) { var i = 0; out = lead + e[IDX[lang]].replace(/\{n\}/g, function () { return nums[i++] || ""; }) + tail; }
    else {
      /* a line made of several known parts joined by line breaks / bullets */
      var parts = core.split(/\n+/);
      if (parts.length > 1) out = lead + parts.map(function (p) { return tr(p.trim()); }).join("\n") + tail;
    }
    if (Object.keys(cache).length < 4000) cache[ck] = out;
    return out;
  }

  function text(n) {
    var v = n.nodeValue, rec = seen && seen.get(n);
    if (rec && v === rec.out) { if (lang === "ru") { n.nodeValue = rec.src; seen.delete(n); } else { var o = tr(rec.src); if (o !== rec.out) { rec.out = o; n.nodeValue = o; } } return; }
    if (lang === "ru") return;
    if (!/[А-Яа-яЁё]/.test(v)) return;
    var out = tr(v); if (out !== v) { seen && seen.set(n, { src: v, out: out }); n.nodeValue = out; }
  }
  function attrs(el) {
    if (!el.getAttribute) return;
    ATTR.forEach(function (a) {
      var v = el.getAttribute(a); if (!v) return;
      var k = "data-ru-" + a, src = el.getAttribute(k);
      if (src === null) { if (!/[А-Яа-яЁё]/.test(v)) return; src = v; el.setAttribute(k, v); }
      var o = lang === "ru" ? src : tr(src); if (o !== v) el.setAttribute(a, o);
    });
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { text(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { var t = root.tagName; if (t === "SCRIPT" || t === "STYLE") return; attrs(root); }
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  /* restore Russian originals when the language goes back to ru */
  function restore() {
    document.querySelectorAll("[data-ru-title],[data-ru-aria-label],[data-ru-placeholder],[data-ru-alt]").forEach(attrs);
  }

  var mo = null;
  function observe() {
    if (mo || typeof MutationObserver !== "function") return;
    mo = new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === "characterData") text(m.target);
        else if (m.type === "attributes") attrs(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    });
    mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTR });
  }

  /* canvas text goes through the same dictionary */
  var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  if (P) ["fillText", "strokeText", "measureText"].forEach(function (f) {
    var o = P[f]; if (!o) return;
    P[f] = function (s) { var a = arguments; if (typeof s === "string" && lang !== "ru") { a = Array.prototype.slice.call(a); a[0] = tr(s); } return o.apply(this, a); };
  });

  function set(l) {
    if (l !== "en" && l !== "tg" && l !== "ru") l = "en";
    if (l === lang && document.documentElement.getAttribute("data-dl") === l) return;
    var prev = lang; lang = l; cache = {};
    document.documentElement.setAttribute("data-dl", l);
    document.documentElement.lang = l === "tg" ? "tg" : l;
    if (prev !== "ru" || l !== "ru") {
      /* nodes translated earlier are re-derived from their Russian source */
      var w = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, null), n, list = [];
      while ((n = w.nextNode())) list.push(n);
      list.forEach(text);
      document.querySelectorAll("*").forEach(attrs);
    }
    try { document.dispatchEvent(new CustomEvent("dunelang", { detail: l })); } catch (e) {}
  }
  function initial() {
    var l = null;
    try { l = window.parent.__mmLang; } catch (e) {}
    if (!l) try { l = localStorage.getItem("mm-lang3"); } catch (e) {}
    return l === "ru" || l === "en" || l === "tg" ? l : "en";
  }
  window.DuneI18n = { tr: tr, set: set, get: function () { return lang; } };
  addEventListener("message", function (e) {
    var d = e.data; if (d && typeof d.mmLang === "string" && e.source === window.parent) set(d.mmLang);
  });
  function start() { observe(); set(initial()); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
