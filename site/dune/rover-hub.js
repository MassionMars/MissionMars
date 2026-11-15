(function () {
  "use strict";
  function init() {
    var svg = document.getElementById("mars-base-svg"), box = document.getElementById("scene-aspect-box");
    if (!svg || !box || !window.DuneBridge) return;
    var arm = svg.querySelector("g.arm"); if (!arm) return;
    var kids = Array.prototype.slice.call(svg.children), ia = kids.indexOf(arm), start = kids[ia - 13], end = kids[ia + 1];
    if (!start || start.tagName.toLowerCase() !== "polygon") return;
    var NS = "http://www.w3.org/2000/svg", g = document.createElementNS(NS, "g");
    g.id = "rover-act"; svg.insertBefore(g, start);
    for (var i = ia - 13; i <= ia + 1; i++) g.appendChild(kids[i]);
    var pre = [], post = [], n;
    for (n = g.previousElementSibling; n && pre.length < 3 && n.tagName.toLowerCase() === "g" && !n.id && n.children.length === 6; n = n.previousElementSibling) pre.unshift(n);
    for (n = g.nextElementSibling; n && post.length < 3 && n.tagName.toLowerCase() === "g" && !n.id && n.children.length === 6; n = n.nextElementSibling) post.push(n);
    pre.forEach(function (w) { g.insertBefore(w, g.firstChild); });
    post.forEach(function (w) { g.appendChild(w); });
    var hit = document.createElementNS(NS, "rect");
    hit.setAttribute("x", 1040); hit.setAttribute("y", 930); hit.setAttribute("width", 225); hit.setAttribute("height", 140); hit.setAttribute("fill", "transparent");
    g.insertBefore(hit, g.firstChild);
    var st = document.createElement("style");
    st.textContent = "#rover-act{cursor:pointer;transition:filter .25s}#rover-act.glow{filter:drop-shadow(0 0 6px #fff3b0) drop-shadow(0 0 14px #ffd66b) drop-shadow(0 0 26px #ffa43a) brightness(1.22)}" +
      ".rover-pin{display:none;z-index:40}.rover-pin.on{display:block}.rover-pin small{font-size:.72rem;font-weight:800;color:#8a4a22;margin-left:2px}.rover-pin.off .dept-btn-inner{opacity:.7}";
    st.textContent += "@keyframes roverDrive{0%,5%{transform:translate(444px,-39px)}45%,55%{transform:translate(144px,-209px)}95%,100%{transform:translate(444px,-39px)}}#rover-act{animation:roverDrive 30s ease-in-out infinite;transform:translate(444px,-39px)}#rover-act:hover,#rover-act.glow{animation-play-state:paused}@media (prefers-reduced-motion:reduce){#rover-act{animation:none;transform:translate(300px,-120px)}}";
    document.head.appendChild(st);
    var pin = document.createElement("div"); pin.className = "dept-pin rover-pin"; pin.dataset.dept = "rover"; pin.setAttribute("role", "button"); pin.tabIndex = 0;
    pin.innerHTML = '<div class="dept-btn-inner"><span class="w-7 h-7 rounded-full bg-[#c4562e] border-2 border-[#231815] flex items-center justify-center text-white text-sm">🚙</span><span>ПОЕЗДКА НА РОВЕРЕ</span><small>−8 ⚡</small></div>';
    box.appendChild(pin);
    var hideT = 0;
    function place() {
      var r = g.getBoundingClientRect(), b = box.getBoundingClientRect();
      pin.style.left = ((r.left + r.width / 2 - b.left) / b.width * 100).toFixed(2) + "%";
      pin.style.top = ((r.top - b.top - 6) / b.height * 100).toFixed(2) + "%";
    }
    var raf = 0;
    function follow() { if (!pin.classList.contains("on")) { raf = 0; return; } place(); raf = requestAnimationFrame(follow); }
    function show() {
      clearTimeout(hideT); place();
      var c = DuneBridge.roverCan();
      pin.classList.toggle("off", !c.ok && c.why !== "phase");
      pin.classList.add("on"); g.classList.add("glow"); if (!raf) raf = requestAnimationFrame(follow);
    }
    function hide(now) { clearTimeout(hideT); hideT = setTimeout(function () { pin.classList.remove("on"); g.classList.remove("glow"); }, now ? 0 : 450); }
    function open() {
      var c = DuneBridge.roverCan();
      if (!c.ok && c.why === "used") { DuneBridge.toast("Сегодня ты уже ездил на ровере: завтра будет новая поездка"); return; }
      if (!c.ok && c.why === "energy") { DuneBridge.toast("Не хватает энергии для поездки на ровере"); return; }
      DuneBridge.go("rover");
    }
    g.addEventListener("mouseenter", show); g.addEventListener("mouseleave", function () { hide(); });
    pin.addEventListener("mouseenter", show); pin.addEventListener("mouseleave", function () { hide(); });
    g.addEventListener("click", function (e) { e.stopPropagation(); if (pin.classList.contains("on") && matchMedia("(hover:hover)").matches) open(); else show(); });
    pin.addEventListener("click", function (e) { e.stopPropagation(); open(); });
    pin.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    document.addEventListener("click", function () { hide(true); });
    addEventListener("resize", function () { if (pin.classList.contains("on")) place(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else setTimeout(init, 0);
})();
