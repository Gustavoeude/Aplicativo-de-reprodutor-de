"use strict";

/* ==========================================================
   Pasta monitorada (só no app Android)
   Você escolhe uma pasta uma vez; o Nyx adiciona sozinho as
   músicas novas que aparecerem nela (ao abrir o app, ao voltar
   para ele ou pelo botão "Atualizar agora").
   ========================================================== */
let watchedSyncing = false;
let watchedLastSync = 0;

function getWatchedFolder() {
  const f = lsGet("watchedFolder", null);
  return f && f.uri ? f : null;
}

async function readWatchedFile(item) {
  const parts = [];
  let offset = 0;
  let done = false;
  while (!done) {
    const chunk = await MN.readFolderFileChunk({ uri: item.uri, offset, chunkSize: 512 * 1024 });
    const binary = atob(chunk.base64 || "");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    if (bytes.length) parts.push(bytes);
    offset = Number(chunk.nextOffset) || (offset + bytes.length);
    done = !!chunk.done;
    if (!bytes.length && !done) throw new Error("O Android não retornou dados do arquivo.");
  }
  const file = new File(parts, item.name, {
    type: item.mimeType || "application/octet-stream",
    lastModified: Number(item.lastModified) || Date.now()
  });
  try { Object.defineProperty(file, "sourcePath", { value: item.relativePath || item.name }); } catch (e) { logErr("pasta:30", e); }
  return file;
}

async function syncWatchedFolder(manual) {
  const folder = getWatchedFolder();
  if (!MN || typeof MN.listFolderAudio !== "function" || !folder || watchedSyncing) return;
  watchedSyncing = true;
  try {
    const listing = await MN.listFolderAudio({ uri: folder.uri });
    const items = listing.files || [];
    const have = new Set();
    for (const s of songs) if (s.file) have.add(s.file.name + "::" + s.file.size);

    const isLrc = n => /\.lrc$/i.test(n);
    const novos = items.filter(i => !isLrc(i.name) && !have.has(i.name + "::" + (Number(i.size) || 0)));
    const keys = new Set(novos.map(i => (i.relativePath || i.name).replace(/\.[^/.]+$/, "").normalize("NFKC").toLocaleLowerCase("pt-BR")));
    const letras = items.filter(i => isLrc(i.name) &&
      keys.has((i.relativePath || i.name).replace(/\.[^/.]+$/, "").normalize("NFKC").toLocaleLowerCase("pt-BR")));

    if (!novos.length) {
      if (manual) showToast("Pasta já está atualizada");
      watchedLastSync = Date.now();
      return;
    }
    showToast("Encontrei " + novos.length + (novos.length === 1 ? " música nova…" : " músicas novas…"));
    const files = [];
    for (const it of novos.concat(letras)) {
      try { files.push(await readWatchedFile(it)); } catch (e) { logErr("pasta:60", e); }
    }
    await importFiles(files, "“" + (folder.name || "pasta") + "”");
    watchedLastSync = Date.now();
  } catch (e) {
    logErr("pasta:65", e);
    if (manual) showToast("Não consegui ler a pasta. Escolha ela de novo.");
  } finally {
    watchedSyncing = false;
  }
}

async function chooseWatchedFolder() {
  if (!MN || typeof MN.pickFolder !== "function") {
    showToast("A pasta monitorada só funciona no app Android");
    return false;
  }
  try {
    const selected = await MN.pickFolder();
    if (!selected || selected.cancelled) return false;
    lsSet("watchedFolder", { uri: selected.uri, name: selected.name || "pasta" });
    await syncWatchedFolder(true);
    return true;
  } catch (e) {
    logErr("pasta:85", e);
    showToast("Não foi possível escolher a pasta");
    return false;
  }
}

function stopWatchedFolder() {
  lsSet("watchedFolder", null);
  showToast("Pasta desvinculada. As músicas já adicionadas continuam.");
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && Date.now() - watchedLastSync > 30000) syncWatchedFolder(false);
});
