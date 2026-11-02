// Depois de "npx cap add android": copia o serviço de áudio nativo para o projeto
// Android e declara permissões e serviço no AndroidManifest.xml.
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const appId = JSON.parse(fs.readFileSync(path.join(root, "capacitor.config.json"), "utf8")).appId;
const javaDir = path.join(root, "android/app/src/main/java", ...appId.split("."));
const manifestPath = path.join(root, "android/app/src/main/AndroidManifest.xml");

if (!fs.existsSync(manifestPath)) throw new Error("Projeto Android não encontrado. Rode 'npx cap add android' antes.");

fs.mkdirSync(javaDir, { recursive: true });
const srcDir = path.join(root, "native/android");
for (const f of fs.readdirSync(srcDir).filter(n => n.endsWith(".java"))) {
  const code = fs.readFileSync(path.join(srcDir, f), "utf8");
  if (!code.includes("package " + appId + ";")) throw new Error(f + ": pacote diferente de " + appId);
  fs.writeFileSync(path.join(javaDir, f), code);
  console.log("copiado", f);
}

let xml = fs.readFileSync(manifestPath, "utf8");
if (!xml.includes("MusicaService")) {
  const perms = [
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK",
    "android.permission.POST_NOTIFICATIONS",
    "android.permission.WAKE_LOCK"
  ]
    .filter(p => !xml.includes('"' + p + '"'))
    .map(p => '    <uses-permission android:name="' + p + '" />\n')
    .join("");
  const service =
    '        <service android:name=".MusicaService" android:exported="false" android:foregroundServiceType="mediaPlayback" />\n';

  if (!xml.includes("</application>")) throw new Error("AndroidManifest sem </application>");
  xml = xml.replace("</application>", service + "    </application>");
  xml = xml.replace(/(\s*<application)/, "\n" + perms.replace(/\n$/, "") + "$1");
  fs.writeFileSync(manifestPath, xml);
  console.log("AndroidManifest atualizado");
}
