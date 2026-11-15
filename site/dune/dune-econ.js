(function (root) {
  "use strict";
  var UP0 = [-10, -10, -10], DAYS = 15, WEAR_MAX = 6;
  var P = { g0: 1.1, gs: 0.0125, cs: 0.02, us: 0.06, es: 0.01, tired: 0.85, n3: 1.25, n5: 1.5, lowL: 0.85, thr: 25, failBase: 4, failDiv: 4, hoard: 90, wearFail: 1, wearQuick: 1, wearDiv: 2, early: 0.7 };
  var ROOM = { 1: "greenhouse", 2: "medbay", 3: "lab", 4: "airlock" };
  function cl(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function phase(d) { return d <= 4 ? 1 : d <= 9 ? 2 : d <= 13 ? 3 : 4; }
  function gain(d) { return P.g0 - P.gs * (d - 1); }
  function cost(d) { return 1 + P.cs * (d - 1); }
  function neglect(vis, room, d) { var last = vis && vis[room] ? vis[room] : 0; return d - last - 1; }
  function tired(run, room) { return !!(run && run[room] >= 2); }
  function eff(res) { return res && res[0] < P.thr ? P.lowL : 1; }
  function quickIdx(rows) {
    var s = rows.map(function (r) { return r.reduce(function (a, x) { return a + Math.min(0, x); }, 0); });
    return s[0] === s[1] ? -1 : (s[0] > s[1] ? 0 : 1);
  }
  function scale(base, ctx) {
    var d = ctx.day, g = gain(d) * eff(ctx.res) * (ctx.tired ? P.tired : 1), n = ctx.neglect || 0, c = cost(d) * (n >= 5 ? P.n5 : n >= 3 ? P.n3 : 1);
    return base.map(function (x) { return x > 0 ? Math.max(1, Math.round(x * g)) : x < 0 ? Math.round(x * c) : 0; });
  }
  function fail(vec, d) {
    var o = vec.map(function (x) { return Math.min(0, Math.round(x * 0.75)); }), i = 0;
    for (var k = 1; k < 3; k++) if (vec[k] > vec[i]) i = k;
    o[i] -= P.failBase + Math.floor(d / P.failDiv); return o;
  }
  function upBase(d) { return UP0.slice(); }
  function event(ev, d) { var m = 1 + P.es * (d - 1); return ev.map(function (x) { return Math.round(x * m); }); }
  function couple(r) {
    var o = [0, 0, 0], e = r[1], s = r[2], i;
    if (e < P.thr) o[0] -= Math.ceil((P.thr - e) / 6);
    if (s < P.thr) { o[1] -= Math.ceil((P.thr - s) / 6); o[0] -= Math.ceil((P.thr - s) / 10); }
    for (i = 0; i < 3; i++) if (r[i] > P.hoard) o[i] -= Math.floor((r[i] - P.hoard) / 2) + 1;
    return o;
  }
  function reasons(r) { var o = []; if (r[1] < P.thr) o.push("lowE"); if (r[2] < P.thr) o.push("lowS"); if (r.some(function (x) { return x > P.hoard; })) o.push("hoard"); return o; }
  function wearCost(w) { return [0, -Math.ceil(Math.min(WEAR_MAX, w) / P.wearDiv), 0]; }
  function close(d, res, wear, perfect, wearAdd) {
    var up = upBase(d), cp = couple(res), wv = wearCost(wear);
    var tot = [0, 1, 2].map(function (i) { return up[i] + cp[i] + wv[i]; });
    var w2 = Math.max(0, Math.min(WEAR_MAX, wear - 1 - (perfect ? 1 : 0) + wearAdd));
    return { up: up, dep: cp, wear: wv, total: tot, wearAfter: w2 };
  }
  var api = { P: P, UP0: UP0, DAYS: DAYS, ROOM: ROOM, cl: cl, phase: phase, gain: gain, cost: cost, neglect: neglect, tired: tired, eff: eff, quickIdx: quickIdx, scale: scale, fail: fail, upBase: upBase, event: event, couple: couple, reasons: reasons, wearCost: wearCost, close: close };
  root.DuneEcon = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
