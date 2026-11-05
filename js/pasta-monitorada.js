"use strict";

/* ==========================================================
   Diretórios de música e diretórios ignorados (Android)
   Pastas monitoradas são verificadas ao abrir/retomar o app e
   pelo botão Atualizar agora. Pastas ignoradas são excluídas
   da varredura em todos os diretórios monitorados.
   ========================================================== */
let watchedSyncing = false;
let watchedLastSync = 0;

function normalizeDirectoryList(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter(item => {
    if (!item || typeof item.uri !== "string" || !item.uri || seen.has(item.uri)) return false;
    seen.add(item.uri);
    return true;
  }).map(item => ({ uri: item.uri, name: item.name || "pasta" }));
}

function getWatchedFolders() {
  const saved = lsGet("watchedFolders", null);
  if (Array.isArray(saved)) return normalizeDirectoryList(saved);
  const legacy = lsGet("watchedFolder", null);
  return legacy && legacy.uri ? [{ uri: legacy.uri, name: legacy.name || "pasta" }] : [];
}

function getIgnoredFolders() {
  return normalizeDirectoryList(lsGet("ignoredFolders", []));
}

function setDirectories(kind, list) {
  lsSet(kind === "ignored" ? "ignoredFolders" : "watchedFolders", normalizeDirectoryList(list));
}

function watchedItemPaths(item, folder) {
  const relativePath = String(item.relativePath || item.name || "").replace(/\\/g, "/");
  const size = Number(item.size) || 0;
  const lastModified = Number(item.lastModified) || 0;
  return {
    relativePath,
    sourcePath: folder.uri + "::" + relativePath,
    sourceKey: [item.name, size, lastModified, folder.uri + "::" + relativePath].join("::"),
    legacyKey: [item.name, size, lastModified, relativePath].join("::")
  };
}

async function readWatchedFile(item, folder) {
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
    lastModified: Number(item.lastModified) || 0
  });
  const paths = watchedItemPaths(item, folder);
  try { Object.defineProperty(file, "sourcePath", { value: paths.sourcePath }); } catch (e) { logErr("pasta:read", e); }
  return file;
}

function normalizedSidecarPath(item) {
  return String(item.relativePath || item.name || "")
    .replace(/\\/g, "/")
    .replace(/\.[^/.]+$/, "")
    .normalize("NFKC")
    .toLocaleLowerCase("pt-BR");
}

async function syncWatchedFolder(manual) {
  const folders = getWatchedFolders();
  if (!MN || typeof MN.listFolderAudio !== "function" || !folders.length || watchedSyncing) return;
  watchedSyncing = true;
  try {
    const ignoredUris = getIgnoredFolders().map(folder => folder.uri);
    const known = new Set();
    const legacyKnown = new Set();
    for (const song of songs) {
      const key = song.sourceKey || (song.file ? fileIdentity(song.file) : "");
      if (key) {
        known.add(key);
        legacyKnown.add(key);
      }
    }

    const files = [];
    let discovered = 0;
    for (const folder of folders) {
      const listing = await MN.listFolderAudio({ uri: folder.uri, ignoredUris });
      const items = listing.files || [];
      const audio = items.filter(item => !/\.lrc$/i.test(item.name || ""));
      const fresh = audio.filter(item => {
        const keys = watchedItemPaths(item, folder);
        if (known.has(keys.sourceKey) || legacyKnown.has(keys.legacyKey)) return false;
        known.add(keys.sourceKey);
        return true;
      });
      if (!fresh.length) continue;

      discovered += fresh.length;
      const sidecarKeys = new Set(fresh.map(normalizedSidecarPath));
      const sidecars = items.filter(item => /\.lrc$/i.test(item.name || "") && sidecarKeys.has(normalizedSidecarPath(item)));
      for (const item of fresh.concat(sidecars)) {
        try {
          files.push(await readWatchedFile(item, folder));
        } catch (e) {
          logErr("pasta:read-file", e);
        }
      }
    }

    if (!discovered || !files.some(file => !/\.lrc$/i.test(file.name || ""))) {
      if (manual) showToast("Diretórios já estão atualizados");
      watchedLastSync = Date.now();
      return;
    }

    showToast("Encontrei " + discovered + (discovered === 1 ? " música nova…" : " músicas novas…"));
    await importFiles(files, "diretórios monitorados");
    watchedLastSync = Date.now();
  } catch (e) {
    logErr("pasta:sync", e);
    if (manual) showToast("Não consegui ler um diretório. Verifique o acesso à pasta nos Ajustes.");
  } finally {
    watchedSyncing = false;
  }
}

async function addDirectory(kind) {
  if (!MN || typeof MN.pickFolder !== "function") {
    showToast("A seleção de diretórios só funciona no app Android");
    return false;
  }
  try {
    const selected = await MN.pickFolder();
    if (!selected || selected.cancelled) return false;
    const ignored = kind === "ignored";
    const current = ignored ? getIgnoredFolders() : getWatchedFolders();
    if (current.some(folder => folder.uri === selected.uri)) {
      showToast("Esse diretório já está na lista");
      return false;
    }
    current.push({ uri: selected.uri, name: selected.name || "pasta" });
    setDirectories(kind, current);
    if (ignored) {
      showToast("Diretório adicionado à lista de ignorados");
      await syncWatchedFolder(false);
    } else {
      await syncWatchedFolder(true);
    }
    return true;
  } catch (e) {
    logErr("pasta:add", e);
    showToast("Não foi possível adicionar esse diretório");
    return false;
  }
}

async function removeDirectory(kind, uri) {
  const ignored = kind === "ignored";
  const current = ignored ? getIgnoredFolders() : getWatchedFolders();
  setDirectories(kind, current.filter(folder => folder.uri !== uri));
  showToast(ignored
    ? "Diretório removido da lista de ignorados"
    : "Diretório removido; as músicas já adicionadas continuam");
  if (ignored) await syncWatchedFolder(false);
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && Date.now() - watchedLastSync > 30000) {
    syncWatchedFolder(false);
  }
});
