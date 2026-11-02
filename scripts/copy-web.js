const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "www");
const files = [
  "index.html",
  "script.js",
  "style.css",
  "jsmediatags.min.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png"
];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const file of files) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) {
    if (file.startsWith("icon-")) continue;
    throw new Error("Arquivo obrigatório não encontrado: " + file);
  }
  fs.copyFileSync(source, path.join(out, file));
}
console.log("Arquivos web preparados em www/");
