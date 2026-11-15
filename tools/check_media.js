// prints one line per problem found in site/media*.js, then a summary line
const fs = require("fs"), vm = require("vm");
const dir = process.argv[2], LG = ["en", "ru", "tg"];
const ctx = { window: {} };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["assets/images.js", "media.js", "media2.js", "media3.js"]) vm.runInContext(fs.readFileSync(dir + "/" + f, "utf8"), ctx);
const reg = {};
for (const c in ctx.LOCAL_IMG) for (const x of ctx.LOCAL_IMG[c]) reg[x.id] = x;
const info = (() => { const c2 = { window: {} }; c2.window = c2; vm.createContext(c2); vm.runInContext(fs.readFileSync(dir + "/qrdata.js", "utf8") + ";this.I=INFO", c2); return c2.I })();
const M = ctx.MEDIA, used = new Set(), out = [];
for (const k of Object.keys(info)) {
  const m = M[k];
  if (!m) { out.push(k + ": no media entry"); continue }
  if (!m.s.length) out.push(k + ": no slides");
  for (const s of m.s) {
    used.add(s[0]);
    if (!reg[s[0]]) out.push(k + ": slide image " + s[0] + " is not in images.js");
    for (const l of LG) {
      if (!s[1][l]) out.push(k + " " + s[0] + ": no title in " + l);
      else if (s[1][l].length > 60) out.push(k + " " + s[0] + ": title too long in " + l);
      if (!s[2][l]) out.push(k + " " + s[0] + ": no text in " + l);
      else if (s[2][l].length > 420) out.push(k + " " + s[0] + ": text too long in " + l);
    }
  }
  const q = m.q;
  if (!q) { out.push(k + ": no quiz"); continue }
  if (q[1].length !== 3 || !(q[2] >= 0 && q[2] < 3)) out.push(k + ": quiz needs 3 options and a valid answer index");
  for (const l of LG) {
    if (!q[0][l] || !q[3][l] || q[1].some(o => !o[l])) out.push(k + ": quiz text missing in " + l);
  }
}
for (const k in M) if (!info[k]) out.push(k + ": media entry for unknown topic");
out.forEach(l => console.log(l));
const unused = Object.keys(reg).filter(x => !used.has(x));
console.log("#" + Object.keys(M).length + " topics, " + [...used].length + " photos used" + (unused.length ? ", not used by any slide: " + unused.join(", ") : ""));
