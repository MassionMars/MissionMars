const vm = require("vm"), fs = require("fs"), path = require("path");
const site = process.argv[2];
const ctx = { document: { dispatchEvent() {}, createElement() { return {}; } }, CustomEvent: function () {}, localStorage: { getItem() { return null; } }, console };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ["content.js", "qrdata.js", "qr-text.js"]) {
  vm.runInContext(fs.readFileSync(path.join(site, f), "utf8"), ctx, { filename: f });
}
const pick = vm.runInContext("({L, INFO, GT})", ctx);
process.stdout.write(JSON.stringify(pick));
