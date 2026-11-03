"use strict";

/* ==========================================================
   Helpers
   ========================================================== */
/* ==========================================================
   Ícones embutidos (SVG) — não dependem de internet nem de fonte
   ========================================================== */
const ICONS = {
  "settings": "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  "music_note": "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z",
  "play_arrow": "M8 5v14l11-7z",
  "pause": "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
  "skip_next": "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z",
  "skip_previous": "M6 6h2v12H6zm3.5 6l8.5 6V6z",
  "shuffle": "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z",
  "repeat": "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z",
  "repeat_one": "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z",
  "favorite": "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  "favorite_border": "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z",
  "more_vert": "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  "person": "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  "search": "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  "library_music": "M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z",
  "add": "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  "light_mode": "M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z",
  "dark_mode": "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z",
  "keyboard_arrow_down": "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",
  "lyrics": "M4 4h16v13H8l-4 4V4zm4 3v2h8V7H8zm0 4v2h5v-2H8z",
  "check": "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  "check_circle": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  "playlist_add": "M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z",
  "playlist_remove": "M14 10H3v2h11v-2zm0-4H3v2h11V6zM3 16h7v-2H3v2zm11.41 6L17 19.41 19.59 22 21 20.59 18.41 18 21 15.41 19.59 14 17 16.59 14.41 14 13 15.41 15.59 18 13 20.59 14.41 22z",
  "delete": "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  "speaker_notes_off": "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  "upload_file": "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z",
  "notifications": "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  "storage": "M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z",
  "folder": "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z",
  "restart_alt": "M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6 0 2.97-2.17 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93 0-4.42-3.58-8-8-8zm-6 8c0-1.65.67-3.15 1.76-4.24L6.34 7.34C4.9 8.79 4 10.79 4 13c0 4.08 3.05 7.44 7 7.93v-2.02c-2.83-.48-5-2.94-5-5.91z",
  "edit": "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
};

function iconSvg(name) {
  const d = ICONS[name];
  if (!d) return "";
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="' + d + '"/></svg>';
}

const $ = id => document.getElementById(id);

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;

  if (text !== undefined) {
    if (cls && cls.indexOf("material-symbols-rounded") !== -1 && ICONS[text]) {
      e.innerHTML = iconSvg(text);
    } else {
      e.textContent = text;
    }
  }

  return e;
}

// ícones escritos direto no HTML
document.querySelectorAll(".material-symbols-rounded").forEach(node => {
  const name = node.textContent.trim();
  if (ICONS[name]) node.innerHTML = iconSvg(name);
});

// segurar o dedo num texto não abre "Copiar / Selecionar tudo"
document.addEventListener("contextmenu", e => {
  if (!e.target.closest("input, textarea")) e.preventDefault();
});

function setIcon(element, name) {
  element.innerHTML = "";
  element.appendChild(el("span", "material-symbols-rounded", name));
}

// A capa vem SEMPRE de song.cover (fonte única)
function setCover(element, url) {
  element.innerHTML = "";

  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Capa da música";
    img.draggable = false;
    element.appendChild(img);
  } else {
    setIcon(element, "music_note");
  }
}

function fmt(t) {
  if (!isFinite(t) || t < 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return m + ":" + String(s).padStart(2, "0");
}

function lsGet(key, fallback) {
  let value;
  try {
    value = localStorage.getItem(key);
  } catch {
    reportStorageIssue();
    return fallback;
  }
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    reportStorageIssue();
  }
}


/* ==========================================================
   Armazenamento permanente (IndexedDB)
   ========================================================== */
const DB_NAME = "musica-db";
const STORE = "songs";
let storageIssueReported = false;

function reportStorageIssue() {
  if (storageIssueReported) return;
  storageIssueReported = true;
  setTimeout(() => showToast("Não foi possível acessar o armazenamento local. Confira as permissões e o espaço disponível."), 0);
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const dbReady = (() => {
  try {
    return openDB().catch(() => {
      reportStorageIssue();
      return null;
    });
  } catch {
    reportStorageIssue();
    return Promise.resolve(null);
  }
})();

if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

async function dbPut(record) {
  const db = await dbReady;
  if (!db) return false;
  return new Promise(resolve => {
    let tx;
    try {
      tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
    } catch {
      reportStorageIssue();
      resolve(false);
      return;
    }
    tx.oncomplete = () => resolve(true);
    tx.onerror = tx.onabort = () => {
      reportStorageIssue();
      resolve(false);
    };
  });
}

async function dbDelete(id) {
  const db = await dbReady;
  if (!db) return false;
  return new Promise(resolve => {
    let tx;
    try {
      tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
    } catch {
      reportStorageIssue();
      resolve(false);
      return;
    }
    tx.oncomplete = () => resolve(true);
    tx.onerror = tx.onabort = () => {
      reportStorageIssue();
      resolve(false);
    };
  });
}

async function dbGetAll() {
  const db = await dbReady;
  if (!db) return [];
  return new Promise(resolve => {
    let settled = false;
    const finish = records => {
      if (settled) return;
      settled = true;
      resolve(records);
    };
    try {
      const tx = db.transaction(STORE);
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => finish(req.result || []);
      req.onerror = () => {
        reportStorageIssue();
        finish([]);
      };
      tx.onerror = tx.onabort = () => {
        reportStorageIssue();
        finish([]);
      };
    } catch {
      reportStorageIssue();
      finish([]);
    }
  });
}

function toRecord(song) {
  return {
    id: song.id,
    name: song.name,
    artist: song.artist,
    album: song.album || "",
    sourceKey: song.sourceKey || fileIdentity(song.file),
    favorite: song.favorite,
    file: song.file,
    coverBlob: song.coverBlob || null,
    playCount: song.playCount || 0,
    lastPlayed: song.lastPlayed || 0,
    lyrics: song.lyrics || "",
    lyricsSource: song.lyricsSource || "",
    lyricsSourceId: song.lyricsSourceId || null,
    lyricsSearchAt: song.lyricsSearchAt || 0,
    lyricsRetryAt: song.lyricsRetryAt || 0,
    lyricsRetryReason: song.lyricsRetryReason || ""
  };
}

function inferLocalArtistFromFilename(file) {
  const baseName = String(file && file.name || "").replace(/\.[^/.]+$/, "").trim();
  const parts = baseName.split(/\s+-\s+/, 2);
  if (parts.length !== 2) return null;
  const artist = parts[0].trim();
  const title = parts[1].trim();
  if (!artist || !title) return null;
  return { artist, title };
}

function makeSong(r) {
  return {
    id: r.id,
    name: r.name,
    artist: r.artist,
    album: r.album || "",
    sourceKey: r.sourceKey || fileIdentity(r.file),
    favorite: !!r.favorite,
    file: r.file,
    url: URL.createObjectURL(r.file),
    coverBlob: r.coverBlob || null,
    cover: r.coverBlob ? URL.createObjectURL(r.coverBlob) : null,
    playCount: r.playCount || 0,
    lastPlayed: r.lastPlayed || 0,
    lyrics: r.lyrics || "",
    lyricsSource: r.lyricsSource || "",
    lyricsSourceId: r.lyricsSourceId || null,
    lyricsSearchAt: r.lyricsSearchAt || 0,
    lyricsRetryAt: r.lyricsRetryAt || 0,
    lyricsRetryReason: r.lyricsRetryReason || "",
    seed: null
  };
}

/* ==========================================================
   Estado
   ========================================================== */
const audio = $("audio");
const fileInput = $("fileInput");
const lrcInput = $("lrcInput");

const songs = [];
let currentId = null;
let queue = [];
let playHistory = [];
let shuffle = false;
let repeat = "off"; // off | all | one
let libraryFilter = "all"; // all | fav | id de playlist
let playlists = lsGet("playlists", []);
let mixMode = lsGet("mixMode", "plays"); // plays | recent
let manualTheme = lsGet("manualTheme", null);
let seeking = false;
let lyricsView = false;
let fpOpen = false;
let homeMain = null;
let lrcTargetId = null;
let seed = { h: 215, s: 0.8 };
let settings = Object.assign(
  { accent: "auto", amoled: false, disc: false, name: "", shapes: {}, swipe: true, swipeInvert: false, font: "roboto", autoLyrics: true, autoCovers: true },
  lsGet("settings", {})
);
if (!settings.shapes || typeof settings.shapes !== "object") settings.shapes = {};

function saveSettings() {
  lsSet("settings", settings);
}

const getSong = id => songs.find(s => s.id === id) || null;
const current = () => getSong(currentId);
const allIds = () => songs.map(s => s.id);

function savePlaylists() {
  lsSet("playlists", playlists);
}

/* ==========================================================
   Cor dinâmica (Material 3) — extraída da capa
   ========================================================== */
const DEFAULT_SEED = { h: 215, s: 0.8 };
const rootStyle = document.documentElement.style;

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    else if (max === g) h = ((b - r) / d + 2) * 60;
    else h = ((r - g) / d + 4) * 60;
  }

  return [h, s, l];
}

function extractSeed(url) {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        const weight = new Array(36).fill(0);
        const satSum = new Array(36).fill(0);

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue;
          const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          if (l < 0.12 || l > 0.92) continue;
          const w = s * (1 - Math.abs(2 * l - 1));
          const bin = Math.floor(h / 10) % 36;
          weight[bin] += w;
          satSum[bin] += s * w;
        }

        let best = 0;
        for (let i = 1; i < 36; i++) {
          if (weight[i] > weight[best]) best = i;
        }

        if (weight[best] < 0.8) {
          resolve({ h: 220, s: 0.06 }); // capa praticamente cinza
          return;
        }

        resolve({
          h: best * 10 + 5,
          s: Math.min(0.75, Math.max(0.3, satSum[best] / weight[best]))
        });
      } catch {
        resolve(DEFAULT_SEED);
      }
    };

    img.onerror = () => resolve(DEFAULT_SEED);
    img.src = url;
  });
}

function hsl(h, s, l) {
  return "hsl(" + h + " " + s + "% " + l + "%)";
}

function applyPalette() {
  const light = document.body.classList.contains("light");
  const h = Math.round(seed.h);
  const sat = Math.round(Math.min(Math.max(seed.s, 0.04), 0.8) * 100);
  const set = (name, value) => rootStyle.setProperty(name, value);
  const k = f => Math.round(sat * f);

  if (!light) {
    set("--md-primary", hsl(h, sat, 80));
    set("--md-on-primary", hsl(h, sat, 16));
    set("--md-primary-container", hsl(h, k(0.75), 28));
    set("--md-on-primary-container", hsl(h, Math.min(sat + 10, 100), 90));
    set("--md-secondary-container", hsl(h, k(0.3), 26));
    set("--md-on-secondary-container", hsl(h, k(0.4), 90));
    const am = settings.amoled;
    set("--md-surface", am ? "#000000" : hsl(h, k(0.25), 7));
    set("--md-surface-container", am ? hsl(h, k(0.2), 5) : hsl(h, k(0.22), 11));
    set("--md-surface-container-high", am ? hsl(h, k(0.18), 9) : hsl(h, k(0.2), 15));
    set("--md-surface-container-highest", am ? hsl(h, k(0.18), 13) : hsl(h, k(0.2), 19));
    set("--md-on-surface", hsl(h, 12, 92));
    set("--md-on-surface-variant", hsl(h, 10, 72));
    set("--md-outline-variant", hsl(h, 10, 30));
    set("--glow", "hsl(" + h + " " + k(0.75) + "% 30% / " + (settings.amoled ? ".4" : ".6") + ")");
  } else {
    set("--md-primary", hsl(h, sat, 38));
    set("--md-on-primary", "#ffffff");
    set("--md-primary-container", hsl(h, Math.min(sat + 15, 100), 88));
    set("--md-on-primary-container", hsl(h, sat, 14));
    set("--md-secondary-container", hsl(h, k(0.4), 88));
    set("--md-on-secondary-container", hsl(h, k(0.5), 14));
    set("--md-surface", hsl(h, k(0.3), 97));
    set("--md-surface-container", hsl(h, k(0.28), 94));
    set("--md-surface-container-high", hsl(h, k(0.26), 91));
    set("--md-surface-container-highest", hsl(h, k(0.26), 88));
    set("--md-on-surface", hsl(h, 12, 10));
    set("--md-on-surface-variant", hsl(h, 8, 34));
    set("--md-outline-variant", hsl(h, 10, 78));
    set("--glow", "hsl(" + h + " " + Math.min(sat + 15, 100) + "% 80% / .75)");
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute(
      "content",
      !light && settings.amoled ? "#000000" : hsl(h, light ? k(0.3) : k(0.25), light ? 97 : 7)
    );
  }
}

let colorToken = 0;

async function updateColor() {
  const song = current() || homeMain;
  const token = ++colorToken;

  if (settings.accent !== "auto") {
    seed = { h: Number(settings.accent), s: 0.7 };
    applyPalette();
    return;
  }

  if (!song || !song.cover) {
    seed = DEFAULT_SEED;
    applyPalette();
    return;
  }

  if (!song.seed) {
    song.seed = await extractSeed(song.cover);
  }

  if (token !== colorToken) return;
  seed = song.seed;
  applyPalette();
}

/* ---------- Tema claro/escuro ---------- */
const systemTheme = window.matchMedia("(prefers-color-scheme: light)");

function applyTheme() {
  const light = manualTheme === null
    ? systemTheme.matches
    : manualTheme === "light";

  document.body.classList.toggle("light", light);
  setIcon($("themeBtn"), light ? "dark_mode" : "light_mode");
  applyPalette();
}

$("themeBtn").onclick = () => {
  manualTheme = document.body.classList.contains("light") ? "dark" : "light";
  lsSet("manualTheme", manualTheme);
  applyTheme();
};

systemTheme.addEventListener("change", () => {
  if (manualTheme === null) applyTheme();
});

/* ==========================================================
   Navegação
   ========================================================== */
const pageIds = {
  home: "homePage",
  search: "searchPage",
  library: "libraryPage"
};

const pageOrder = ["home", "search", "library"];
let pageTimer = null;

function cleanupLeaving() {
  document.querySelectorAll(".page.leaving").forEach(p => {
    p.classList.remove("leaving", "leave-left", "leave-right");
    p.style.transform = "";
    p.style.opacity = "";
    p.style.transition = "";
  });
}

function openPage(name, opts) {
  opts = opts || {};
  const prev = document.body.dataset.page;
  const same = prev === name;
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  clearTimeout(pageTimer);
  cleanupLeaving();

  const dir = pageOrder.indexOf(name) > pageOrder.indexOf(prev) ? 1 : -1; // 1 = vai para a direita (próxima)
  const outEl = $(pageIds[prev]);
  const inEl = $(pageIds[name]);

  document.body.dataset.page = name;

  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active", "enter-from-right", "enter-from-left", "stagger");
  });
  inEl.classList.add("active");

  if (!same && !reduced) {
    outEl.classList.add("leaving", dir > 0 ? "leave-left" : "leave-right");
    if (opts.fromDrag) inEl.classList.add("no-enter");
    else inEl.classList.add(dir > 0 ? "enter-from-right" : "enter-from-left", "stagger");
    pageTimer = setTimeout(() => {
      cleanupLeaving();
      inEl.classList.remove("enter-from-right", "enter-from-left", "stagger", "no-enter");
    }, 950);
  }

  document.querySelectorAll(".nav-item").forEach(b => {
    b.classList.toggle("active", b.dataset.target === name);
  });

  window.scrollTo({ top: 0, behavior: same ? "smooth" : "auto" });

  if (name === "search") renderSearch();
  if (name === "library") renderLibrary();
}

document.querySelectorAll(".nav-item").forEach(b => {
  b.addEventListener("click", () => openPage(b.dataset.target));
});

/* ==========================================================
   Deslizar entre as páginas (Your Mix ⇄ Search ⇄ Library)
   ========================================================== */
(function initPageSwipe() {
  let sx = 0, sy = 0, st = 0, dx = 0;
  let active = false, engaged = false, page = null;
  let peekName = null, peekEl = null;

  const BLOCK = ".hscroll, .filters, input, textarea, .seek-wrap, .sheet, .dialog, .scrim, .full-player, .now-playing, .bottom-nav, .playlist-bar";
  const EASE = "cubic-bezier(.22, 1, .36, 1)";

  function neighborFor(delta) {
    const i = pageOrder.indexOf(document.body.dataset.page);
    const step = (delta < 0 ? 1 : -1) * (settings.swipeInvert ? -1 : 1);
    return pageOrder[i + step] || null;
  }

  function width() {
    return (page && page.getBoundingClientRect().width) || window.innerWidth;
  }

  // mostra a página do lado junto com a atual (assim nunca fica tela vazia)
  function setPeek(name) {
    if (name === peekName) return;
    clearPeek();
    if (!name) return;
    peekName = name;
    peekEl = $(pageIds[name]);
    if (name === "search") renderSearch();
    if (name === "library") renderLibrary();
    peekEl.style.transition = "none";
    peekEl.classList.add("peek");
  }

  function clearPeek() {
    if (peekEl) {
      peekEl.classList.remove("peek");
      peekEl.style.transform = "";
      peekEl.style.transition = "";
    }
    peekName = null;
    peekEl = null;
  }

  document.addEventListener("touchstart", e => {
    active = false;
    if (!settings.swipe || e.touches.length !== 1 || fpOpen) return;
    if (document.querySelector(".scrim, .dialog")) return;
    if (e.target.closest && e.target.closest(BLOCK)) return;

    const t = e.touches[0];
    sx = t.clientX;
    sy = t.clientY;
    st = performance.now();
    dx = 0;
    engaged = false;
    active = true;
    page = $(pageIds[document.body.dataset.page]);
    clearPeek();
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (!active) return;
    const t = e.touches[0];
    const mx = t.clientX - sx;
    const my = t.clientY - sy;

    if (!engaged) {
      if (Math.abs(my) > 12 && Math.abs(my) > Math.abs(mx)) { active = false; return; } // rolagem vertical
      if (Math.abs(mx) > 12 && Math.abs(mx) > Math.abs(my) * 1.4) {
        engaged = true;
        page.style.transition = "none";
        page.classList.add("dragging");
      } else return;
    }

    e.preventDefault();
    dx = mx;
    const target = neighborFor(dx);
    setPeek(target);

    const W = width();
    if (target) {
      page.style.transform = "translateX(" + dx.toFixed(1) + "px)";
      peekEl.style.transform = "translateX(" + (dx + (dx < 0 ? W : -W)).toFixed(1) + "px)";
    } else {
      page.style.transform = "translateX(" + (dx * 0.16).toFixed(1) + "px)"; // sem página do outro lado: elástico
    }
  }, { passive: false });

  function finish() {
    if (!active) return;
    active = false;
    if (!engaged) return;
    engaged = false;

    const v = Math.abs(dx) / Math.max(1, performance.now() - st);
    const target = neighborFor(dx);
    const W = width();
    page.classList.remove("dragging");

    if (target && peekEl && (Math.abs(dx) > 70 || v > 0.5)) {
      // conclui: a página do lado termina de entrar, a atual termina de sair
      const inEl = peekEl;
      peekName = null;
      peekEl = null;
      page.style.transition = "";
      openPage(target, { fromDrag: true });
      inEl.classList.remove("peek");
      void inEl.offsetWidth;
      inEl.style.transition = "transform .42s " + EASE;
      inEl.style.transform = "";
      setTimeout(() => { inEl.style.transition = ""; }, 460);
    } else {
      // volta com efeito de mola
      const cur = page;
      const other = peekEl;
      cur.style.transition = "transform .5s var(--spring)";
      cur.style.transform = "";
      if (other) {
        other.style.transition = "transform .5s var(--spring)";
        other.style.transform = "translateX(" + (dx < 0 ? W : -W) + "px)";
      }
      setTimeout(() => {
        cur.style.transition = "";
        clearPeek();
      }, 520);
    }
  }

  document.addEventListener("touchend", finish, { passive: true });
  document.addEventListener("touchcancel", finish, { passive: true });
})();

/* ==========================================================
   Snackbar, bottom sheet e diálogos (Material 3)
   ========================================================== */
let toastTimer = null;

function showToast(message) {
  let bar = $("snackbar");

  if (!bar) {
    bar = el("div", "snackbar");
    bar.id = "snackbar";
    document.body.appendChild(bar);
  }

  bar.textContent = message;
  void bar.offsetWidth;
  bar.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => bar.classList.remove("show"), 2600);
}

let activeSheet = null;
let activeDialog = null;
let modalTitleSerial = 0;

function activeModalElement() {
  if (activeDialog) return activeDialog.dlg;
  if (activeSheet) return activeSheet.sheet;
  return fpOpen ? $("fullPlayer") : null;
}

document.addEventListener("keydown", e => {
  const modal = activeModalElement();
  if (!modal) return;

  if (e.key === "Escape") {
    e.preventDefault();
    if (activeDialog) activeDialog.done(null);
    else if (activeSheet) closeSheet();
    else if (fpOpen) closeFullPlayer();
    return;
  }

  if (e.key !== "Tab") return;
  const focusable = Array.from(modal.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
  )).filter(node => node.getAttribute("aria-hidden") !== "true" && node.getClientRects().length);
  if (!focusable.length) {
    e.preventDefault();
    modal.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

function closeSheet() {
  if (!activeSheet) return;
  const { scrim, sheet, returnFocus } = activeSheet;
  activeSheet = null;

  scrim.classList.remove("show");
  sheet.classList.remove("show");
  sheet.setAttribute("aria-hidden", "true");
  if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  setTimeout(() => {
    scrim.remove();
    sheet.remove();
  }, 260);
}

function presentSheet(scrim, sheet, returnFocus) {
  const title = sheet.querySelector("h3");
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("tabindex", "-1");
  if (title) {
    title.id = "sheet-title-" + (++modalTitleSerial);
    sheet.setAttribute("aria-labelledby", title.id);
  } else {
    sheet.setAttribute("aria-label", "Opções");
  }
  scrim.setAttribute("aria-hidden", "true");
  document.body.append(scrim, sheet);
  activeSheet = { scrim, sheet, returnFocus };

  requestAnimationFrame(() => {
    scrim.classList.add("show");
    sheet.classList.add("show");
    const first = sheet.querySelector('button:not([disabled]), input:not([disabled])');
    (first || sheet).focus();
  });
}

function openSheet(title, actions) {
  const returnFocus = activeSheet ? activeSheet.returnFocus : document.activeElement;
  closeSheet();

  const scrim = el("div", "scrim");
  const sheet = el("div", "sheet");
  sheet.appendChild(el("div", "sheet-handle"));
  if (title) sheet.appendChild(el("h3", "", title));

  actions.forEach(a => {
    const btn = el("button", "sheet-item" + (a.danger ? " danger" : ""));
    btn.appendChild(el("span", "material-symbols-rounded", a.icon));
    btn.appendChild(el("span", "", a.label));
    btn.onclick = () => {
      closeSheet();
      a.run();
    };
    sheet.appendChild(btn);
  });

  scrim.onclick = closeSheet;
  presentSheet(scrim, sheet, returnFocus);
}

function showDialog({ title, text, input, confirmLabel = "OK", danger = false }) {
  return new Promise(resolve => {
    const returnFocus = document.activeElement;
    const scrim = el("div", "scrim");
    const dlg = el("div", "dialog");
    const heading = el("h3", "", title);
    heading.id = "dialog-title-" + (++modalTitleSerial);
    dlg.setAttribute("role", "dialog");
    dlg.setAttribute("aria-modal", "true");
    dlg.setAttribute("aria-labelledby", heading.id);
    dlg.setAttribute("tabindex", "-1");
    scrim.setAttribute("aria-hidden", "true");
    dlg.appendChild(heading);
    if (text) dlg.appendChild(el("p", "", text));

    let field = null;
    if (input) {
      field = el("input", "dialog-input");
      field.type = "text";
      field.value = input.value || "";
      field.placeholder = input.placeholder || "";
      field.maxLength = 40;
      dlg.appendChild(field);
    }

    const actions = el("div", "dialog-actions");
    const cancel = el("button", "text-btn", "Cancelar");
    const ok = el("button", "text-btn" + (danger ? " danger" : ""), confirmLabel);
    actions.append(cancel, ok);
    dlg.appendChild(actions);

    let settled = false;
    const done = value => {
      if (settled) return;
      settled = true;
      if (activeDialog && activeDialog.dlg === dlg) activeDialog = null;
      scrim.classList.remove("show");
      dlg.classList.remove("show");
      dlg.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        scrim.remove();
        dlg.remove();
        if (returnFocus && returnFocus.isConnected) returnFocus.focus();
      }, 260);
      resolve(value);
    };

    cancel.onclick = () => done(null);
    scrim.onclick = () => done(null);
    ok.onclick = () => done(field ? field.value.trim() : true);

    if (field) {
      field.addEventListener("keydown", e => {
        if (e.key === "Enter") ok.click();
      });
    }

    document.body.append(scrim, dlg);
    activeDialog = { dlg, done, returnFocus };

    requestAnimationFrame(() => {
      scrim.classList.add("show");
      dlg.classList.add("show");
      if (field) field.focus();
      else ok.focus();
    });
  });
}

/* ==========================================================
   Adicionar músicas
   ========================================================== */
function openFilePicker() {
  fileInput.click();
}

$("addBtn").onclick = openFilePicker;
$("libraryAdd").onclick = openFilePicker;

const audioExt = /\.(mp3|m4a|m4b|aac|flac|ogg|oga|opus|wav|weba|webm|aiff|aif|alac|amr|3gp)$/i;
const lrcExt = /\.lrc$/i;

function fileIdentity(file) {
  return [file.name, file.size, file.lastModified || 0, file.sourcePath || file.webkitRelativePath || ""].join("::");
}

function lyricsMatchKey(file) {
  const path = (file.sourcePath || file.webkitRelativePath || file.name || "").replace(/\\/g, "/");
  return path.replace(/\.[^/.]+$/, "").normalize("NFKC").toLocaleLowerCase("pt-BR");
}

function lyricsFromTag(value) {
  if (typeof value === "string") return value.replace(/^\uFEFF/, "").trim();
  if (!value || typeof value !== "object") return "";
  const text = value.lyrics || value.text || value.value || "";
  return typeof text === "string" ? text.replace(/^\uFEFF/, "").trim() : "";
}

const LRCLIB_SEARCH_URL = "https://lrclib.net/api/search";
const LRCLIB_CLIENT = "ReprodutorMusicalWeb/1.0 (https://github.com/Gustavoeude/Aplicativo-de-reprodutor-de)";
const lyricsLookupStatus = new Map();
const lyricsLookupInFlight = new Map();
let lyricsLookupQueue = Promise.resolve();
let lastLyricsLookupAt = 0;

function normalizeLyricsLookup(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function lyricsLookupTitle(song) {
  return String(song && song.name || "").replace(/^\s*\d{1,3}\s*[-._)\]]+\s*/, "").trim();
}

function lyricsLookupArtist(song) {
  const artist = normalizeLyricsLookup(song && song.artist);
  return !artist || ["arquivo local", "artista desconhecido", "unknown"].includes(artist) ? "" : artist;
}

function readLocalTrackDuration(song) {
  if (!song || !song.url) return Promise.resolve(null);
  return new Promise(resolve => {
    const probe = document.createElement("audio");
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      probe.removeAttribute("src");
      probe.load();
      resolve(Number.isFinite(value) && value > 0 ? value : null);
    };
    const timer = setTimeout(() => finish(null), 7000);
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", () => finish(probe.duration), { once: true });
    probe.addEventListener("error", () => finish(null), { once: true });
    probe.src = song.url;
    probe.load();
  });
}

function chooseLyricsRecord(song, records, duration) {
  const title = normalizeLyricsLookup(lyricsLookupTitle(song));
  if (!title || !Array.isArray(records)) return null;
  const artist = lyricsLookupArtist(song);
  // Primeiro tenta título + artista exatos. Se o cadastro do artista variar,
  // mantém os resultados do título e só aceita quando não houver ambiguidade.
  const titleMatches = records.filter(record =>
    normalizeLyricsLookup(record.trackName || record.name) === title
  );
  if (!titleMatches.length) return null;

  let candidates = artist
    ? titleMatches.filter(record => normalizeLyricsLookup(record.artistName) === artist)
    : titleMatches;

  if (!candidates.length) candidates = titleMatches;

  const artists = new Set(candidates.map(record => normalizeLyricsLookup(record.artistName)).filter(Boolean));
  if (artists.size > 1) return null;

  // A duração ajuda a escolher uma versão, mas não deve eliminar uma letra
  // válida quando o arquivo tem alguns segundos de diferença.
  if (Number.isFinite(duration)) {
    const durationMatches = candidates.filter(record =>
      Number.isFinite(Number(record.duration)) && Math.abs(Number(record.duration) - duration) <= 5
    );
    if (durationMatches.length) candidates = durationMatches;
  }
  if (!duration && candidates.length > 1) {
    const albums = new Set(candidates.map(record => normalizeLyricsLookup(record.albumName)).filter(Boolean));
    if (albums.size > 1) return null;
  }
  const album = normalizeLyricsLookup(song && song.album);
  candidates.sort((a, b) => {
    if (album) {
      const albumA = Number(normalizeLyricsLookup(a.albumName) === album);
      const albumB = Number(normalizeLyricsLookup(b.albumName) === album);
      if (albumA !== albumB) return albumB - albumA;
    }
    const sync = Number(!!b.syncedLyrics) - Number(!!a.syncedLyrics);
    if (sync) return sync;
    if (Number.isFinite(duration)) return Math.abs(Number(a.duration) - duration) - Math.abs(Number(b.duration) - duration);
    return 0;
  });
  return candidates.find(record => record.syncedLyrics || record.plainLyrics) || null;
}

async function fetchLyricsRecord(song) {
  const title = lyricsLookupTitle(song);
  if (!title) return null;
  const params = new URLSearchParams({ track_name: title });
  const artist = lyricsLookupArtist(song);
  if (artist) params.set("artist_name", song.artist);
  if (song.album) params.set("album_name", song.album);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  let response;
  try {
    response = await fetch(LRCLIB_SEARCH_URL + "?" + params.toString(), {
      method: "GET",
      headers: { "Lrclib-Client": LRCLIB_CLIENT },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 429) {
    const error = new Error("rate-limited");
    const retryHeader = response.headers.get("Retry-After");
    const retrySeconds = Number(retryHeader);
    const retryDate = retryHeader && Number.isNaN(retrySeconds) ? Date.parse(retryHeader) : NaN;
    error.retryAfter = Math.max(1, Number.isFinite(retrySeconds) && retrySeconds > 0
      ? retrySeconds
      : Number.isFinite(retryDate) ? Math.ceil((retryDate - Date.now()) / 1000) : 60);
    error.retryReason = "rate";
    throw error;
  }
  if (response.status === 503) {
    const error = new Error("service-busy");
    const retryHeader = response.headers.get("Retry-After");
    const retrySeconds = Number(retryHeader);
    const retryDate = retryHeader && Number.isNaN(retrySeconds) ? Date.parse(retryHeader) : NaN;
    error.retryAfter = Math.max(1, Number.isFinite(retrySeconds) && retrySeconds > 0
      ? retrySeconds
      : Number.isFinite(retryDate) ? Math.ceil((retryDate - Date.now()) / 1000) : 5);
    error.retryReason = "busy";
    throw error;
  }
  if (!response.ok) throw new Error("lyrics-service-" + response.status);
  const records = await response.json();
  const duration = await readLocalTrackDuration(song);
  return chooseLyricsRecord(song, records, duration);
}

function updateLyricsLookupView(song) {
  if (!song || !songs.includes(song)) return;
  updateMiniPlayer();
  if (song.id === currentId && lyricsView) renderLyrics(song);
}

function requestOnlineLyrics(song, force = false) {
  if (!song || song.lyrics || !songs.includes(song)) return Promise.resolve(false);
  if (!force && !settings.autoLyrics) return Promise.resolve(false);
  if (lyricsLookupInFlight.has(song.id)) return lyricsLookupInFlight.get(song.id);
  const now = Date.now();
  if (song.lyricsRetryAt > now) {
    if (!(force && song.lyricsRetryReason === "error")) {
      lyricsLookupStatus.set(song.id, song.lyricsRetryReason === "error" ? "error" : "limited");
      updateLyricsLookupView(song);
      return Promise.resolve(false);
    }
    song.lyricsRetryAt = 0;
    song.lyricsRetryReason = "";
  }
  if (!force && song.lyricsSearchAt && now - song.lyricsSearchAt < 24 * 60 * 60 * 1000) {
    lyricsLookupStatus.set(song.id, "not-found");
    return Promise.resolve(false);
  }

  const task = lyricsLookupQueue.then(async () => {
    if (!songs.includes(song) || song.lyrics || (!force && !settings.autoLyrics)) return false;
    const wait = Math.max(0, 1500 - (Date.now() - lastLyricsLookupAt));
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
    if (!songs.includes(song) || song.lyrics) return false;
    lyricsLookupStatus.set(song.id, "searching");
    updateLyricsLookupView(song);
    lastLyricsLookupAt = Date.now();
    try {
      const record = await fetchLyricsRecord(song);
      if (!songs.includes(song)) return false;
      song.lyricsSearchAt = Date.now();
      song.lyricsRetryAt = 0;
      song.lyricsRetryReason = "";
      if (record) {
        song.lyrics = record.syncedLyrics || record.plainLyrics || "";
        song.lyricsSource = "lrclib";
        song.lyricsSourceId = record.id || null;
        lyricsLookupStatus.set(song.id, "found");
      } else {
        lyricsLookupStatus.set(song.id, "not-found");
      }
      await dbPut(toRecord(song));
      refreshAll();
      updateLyricsLookupView(song);
      return !!record;
    } catch (error) {
      if (!songs.includes(song)) return false;
      if (error && error.retryAfter) {
        song.lyricsRetryAt = Date.now() + error.retryAfter * 1000;
        song.lyricsRetryReason = error.retryReason || "rate";
        lyricsLookupStatus.set(song.id, "limited");
      } else {
        song.lyricsRetryAt = Date.now() + 5 * 60 * 1000;
        song.lyricsRetryReason = "error";
        lyricsLookupStatus.set(song.id, "error");
      }
      await dbPut(toRecord(song));
      updateLyricsLookupView(song);
      return false;
    }
  });
  lyricsLookupQueue = task.catch(() => false);
  const tracked = task.finally(() => lyricsLookupInFlight.delete(song.id));
  lyricsLookupInFlight.set(song.id, tracked);
  return tracked;
}

async function fetchOnlineCover(song, force) {
  if (!force && !settings.autoCovers) return false;
  if (!song || song.coverBlob || !song.name) return false;

  const normalize = value => String(value || "")
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const title = normalize(song.name);
  const artist = normalize(song.artist);
  const album = normalize(song.album);
  const queries = [...new Set([
    [song.name, song.artist].filter(Boolean).join(" "),
    [song.name, song.album].filter(Boolean).join(" "),
    song.name
  ].filter(Boolean))];

  try {
    let match = null;
    for (const query of queries) {
      const response = await fetch("https://itunes.apple.com/search?term=" + encodeURIComponent(query) + "&entity=song&limit=25");
      if (!response.ok) continue;
      const data = await response.json();
      const results = data.results || [];
      const exact = results.filter(item => normalize(item.trackName) === title);
      match = exact.find(item => {
        const candidateArtist = normalize(item.artistName);
        const candidateAlbum = normalize(item.collectionName);
        return (!artist || candidateArtist === artist || candidateArtist.includes(artist) || artist.includes(candidateArtist)) &&
          (!album || !candidateAlbum || candidateAlbum === album || candidateAlbum.includes(album) || album.includes(candidateAlbum));
      }) || exact[0] || null;
      if (match) break;
    }

    if (!match || !match.artworkUrl100) return false;
    const imageUrl = match.artworkUrl100.replace(/100x100bb/, "600x600bb");
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return false;
    const blob = await imageResponse.blob();
    if (!blob.type.startsWith("image/")) return false;

    song.coverBlob = blob;
    if (song.cover) URL.revokeObjectURL(song.cover);
    song.cover = URL.createObjectURL(blob);
    await dbPut(toRecord(song));
    refreshAll();
    if (song.id === currentId) updateFullPlayer();
    return true;
  } catch (_) {
    return false;
  }
}
function pickCoverFor(songId) {
  const song = getSong(songId);
  if (!song) return;
  const input = $("coverInput");
  input.onchange = async () => {
    const file = input.files && input.files[0];
    input.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    song.coverBlob = file;
    if (song.cover) URL.revokeObjectURL(song.cover);
    song.cover = URL.createObjectURL(file);
    await dbPut(toRecord(song));
    refreshAll();
    if (song.id === currentId) updateFullPlayer();
    showToast("Capa atualizada");
  };
  input.click();
}

async function addFile(file, automaticLyrics = "") {
  const sourceKey = fileIdentity(file);
  const duplicate = songs.find(s => s.file && (s.sourceKey || fileIdentity(s.file)) === sourceKey);
  if (duplicate) {
    if (!duplicate.coverBlob) fetchOnlineCover(duplicate);
    if (!duplicate.lyrics && automaticLyrics) {
      duplicate.lyrics = automaticLyrics;
      duplicate.lyricsSource = "lrc";
      const stored = await dbPut(toRecord(duplicate));
      if (duplicate.id === currentId) renderLyrics(duplicate);
      return { added: false, stored, lyricsAdded: true };
    }
    if (!duplicate.lyrics && settings.autoLyrics) requestOnlineLyrics(duplicate);
    return { added: false, stored: true, lyricsAdded: false };
  }

  const fileBaseName = file.name.replace(/\.[^/.]+$/, "").trim();
  const nameParts = fileBaseName.split(/\s+-\s+/, 2);
  const hasArtistInFileName = nameParts.length === 2 && nameParts[0].trim() && nameParts[1].trim();
  const song = {
    id: Date.now() + Math.random(),
    name: hasArtistInFileName ? nameParts[1].trim() : fileBaseName,
    artist: hasArtistInFileName ? nameParts[0].trim() : "Arquivo local",
    album: "",
    sourceKey,
    favorite: false,
    file: file,
    url: URL.createObjectURL(file),
    coverBlob: null,
    cover: null,
    playCount: 0,
    lastPlayed: 0,
    lyrics: automaticLyrics || "",
    lyricsSource: automaticLyrics ? "lrc" : "",
    lyricsSourceId: null,
    lyricsSearchAt: 0,
    lyricsRetryAt: 0,
    lyricsRetryReason: "",
    seed: null
  };

  songs.push(song);
  const stored = await dbPut(toRecord(song));

  if (window.jsmediatags) {
    try {
      window.jsmediatags.read(file, {
        onSuccess: result => {
          if (!songs.includes(song)) return;
        const tags = result.tags || {};

        if (tags.title) song.name = tags.title;
        if (tags.artist) song.artist = tags.artist;
        if (tags.album) song.album = tags.album;
        const embeddedLyrics = lyricsFromTag(tags.lyrics);
        if (!song.lyrics && embeddedLyrics) {
          song.lyrics = embeddedLyrics;
          song.lyricsSource = "embedded";
          if (song.id === currentId) renderLyrics(song);
        }

        if (tags.picture) {
          const picture = tags.picture;
          const bytes = new Uint8Array(picture.data);
          const blob = new Blob([bytes], { type: picture.format || "image/jpeg" });
          song.coverBlob = blob;
          song.cover = URL.createObjectURL(blob);
        }

        dbPut(toRecord(song));
        refreshAll();
        if (!song.coverBlob) fetchOnlineCover(song);
        if (!song.lyrics && settings.autoLyrics) requestOnlineLyrics(song);
        },
        onError: () => {
          refreshAll();
          fetchOnlineCover(song);
          if (!song.lyrics && settings.autoLyrics) requestOnlineLyrics(song);
        }
      });
    } catch {
      showToast("A música foi adicionada, mas não consegui ler suas informações.");
      if (!song.lyrics && settings.autoLyrics) requestOnlineLyrics(song);
    }
  } else {
    fetchOnlineCover(song);
    if (!song.lyrics && settings.autoLyrics) requestOnlineLyrics(song);
  }

  return { added: true, stored, lyricsAdded: !!automaticLyrics };
}

async function readSidecarLyrics(files) {
  const bySong = new Map();
  for (const file of files) {
    if (!lrcExt.test(file.name)) continue;
    const key = lyricsMatchKey(file);
    if (!key || bySong.has(key)) continue;
    try {
      const text = (await file.text()).replace(/^\uFEFF/, "").trim();
      if (text && parseLrc(text).lines.length) bySong.set(key, text);
    } catch (_) {}
  }
  return bySong;
}

// Recebe músicas e, se estiverem disponíveis no mesmo lote/pasta, associa arquivos LRC homônimos.
async function importFiles(list, origem) {
  const selectedFiles = Array.from(list || []);
  const files = selectedFiles.filter(
    f => (f.type || "").startsWith("audio/") || audioExt.test(f.name)
  );
  const sidecars = await readSidecarLyrics(selectedFiles);

  let added = 0;
  let notStored = 0;
  let lyricsAdded = 0;
  for (const file of files) {
    const result = await addFile(file, sidecars.get(lyricsMatchKey(file)) || "");
    if (result.added) {
      added++;
      if (!result.stored) notStored++;
    }
    if (result.lyricsAdded) lyricsAdded++;
  }

  refreshAll();

  if (files.length === 0) {
    showToast(selectedFiles.some(f => lrcExt.test(f.name))
      ? "Selecione também a música correspondente para associar a letra."
      : origem ? "Nenhuma música encontrada nessa pasta" : "Nenhum áudio selecionado");
  } else if (added === 0 && lyricsAdded === 0) showToast("Essas músicas já estão na biblioteca");
  else if (added === 0) showToast(lyricsAdded + (lyricsAdded === 1 ? " letra associada à música existente" : " letras associadas às músicas existentes"));
  else if (notStored) showToast(added + " música(s) adicionada(s) só nesta sessão; não foi possível salvá-las.");
  else {
    let message = added + (added === 1 ? " música adicionada" : " músicas adicionadas") + (origem ? " de " + origem : "");
    if (lyricsAdded) message += " · " + lyricsAdded + (lyricsAdded === 1 ? " letra encontrada" : " letras encontradas");
    showToast(message);
  }
}

fileInput.addEventListener("change", () => {
  importFiles(fileInput.files);
  fileInput.value = "";
});

/* ==========================================================
   Importar pasta
   ========================================================== */
const folderInput = $("folderInput");

// Percorre a pasta e as subpastas (File System Access API)
async function collectFromDirectory(dirHandle, out, prefix = "") {
  for await (const entry of dirHandle.values()) {
    const relativePath = prefix ? prefix + "/" + entry.name : entry.name;
    if (entry.kind === "file") {
      try {
        const file = await entry.getFile();
        try { Object.defineProperty(file, "sourcePath", { value: relativePath }); } catch (_) {}
        if ((file.type || "").startsWith("audio/") || audioExt.test(file.name) || lrcExt.test(file.name)) out.push(file);
      } catch (_) {}
    } else if (entry.kind === "directory") {
      await collectFromDirectory(entry, out, relativePath);
    }
  }
}

async function importFolder() {
  if (window.showDirectoryPicker) {
    let dir;
    try {
      dir = await window.showDirectoryPicker({ mode: "read" });
    } catch (e) {
      if (e && e.name === "AbortError") return;
      showToast("A seleção de pasta não está disponível aqui; tentando o seletor do navegador.");
    }

    if (dir) {
      try {
        showToast("Lendo a pasta…");
        const found = [];
        await collectFromDirectory(dir, found, dir.name);
        await importFiles(found, "“" + dir.name + "”");
        return;
      } catch (_) {
        showToast("Não consegui ler essa pasta; tentando o seletor do navegador.");
      }
    }
  }

  // Alternativa: seletor de pasta do navegador
  folderInput.click();
}

folderInput.addEventListener("change", () => {
  const list = Array.from(folderInput.files || []);
  let nome = "";
  if (list[0] && list[0].webkitRelativePath) nome = "“" + list[0].webkitRelativePath.split("/")[0] + "”";
  importFiles(list, nome || "a pasta");
  folderInput.value = "";
});

/* ==========================================================
   Playlists e menus
   ========================================================== */
async function createPlaylist(firstSongId) {
  const name = await showDialog({
    title: "Nova playlist",
    input: { placeholder: "Nome da playlist" },
    confirmLabel: "Criar"
  });

  if (!name) return null;

  const playlist = {
    id: "p" + Date.now(),
    name: name,
    songIds: firstSongId !== undefined ? [firstSongId] : []
  };

  playlists.push(playlist);
  savePlaylists();
  renderLibrary();
  showToast("Playlist \"" + name + "\" criada");
  return playlist;
}

function toggleInPlaylist(playlist, song) {
  const i = playlist.songIds.indexOf(song.id);

  if (i >= 0) {
    playlist.songIds.splice(i, 1);
    showToast("Removida de \"" + playlist.name + "\"");
  } else {
    playlist.songIds.push(song.id);
    showToast("Adicionada a \"" + playlist.name + "\"");
  }

  savePlaylists();
  renderLibrary();
}

function addToPlaylistSheet(song) {
  const actions = playlists.map(p => ({
    icon: p.songIds.includes(song.id) ? "check_circle" : "playlist_add",
    label: p.name,
    run: () => toggleInPlaylist(p, song)
  }));

  actions.push({
    icon: "add",
    label: "Nova playlist",
    run: () => createPlaylist(song.id)
  });

  openSheet("Adicionar à playlist", actions);
}

function pickLrcFor(songId) {
  lrcTargetId = songId;
  lrcInput.click();
}

async function deleteSong(song) {
  const ok = await showDialog({
    title: "Excluir música?",
    text: "\"" + song.name + "\" será removida da sua biblioteca.",
    confirmLabel: "Excluir",
    danger: true
  });

  if (!ok) return;

  if (song.id === currentId) {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    currentId = null;
    closeFullPlayer();
  }

  URL.revokeObjectURL(song.url);
  if (song.cover) URL.revokeObjectURL(song.cover);

  songs.splice(songs.indexOf(song), 1);
  playlists.forEach(p => {
    p.songIds = p.songIds.filter(id => id !== song.id);
  });
  savePlaylists();

  queue = queue.filter(id => id !== song.id);
  playHistory = playHistory.filter(id => id !== song.id);
  const deletedFromStorage = await dbDelete(song.id);

  refreshAll();
  showToast(deletedFromStorage
    ? "Música excluída"
    : "Removida desta sessão, mas não foi possível apagá-la do armazenamento.");
}

function openSongMenu(song, opts = {}) {
  const actions = [
    {
      icon: "playlist_add",
      label: "Adicionar à playlist",
      run: () => addToPlaylistSheet(song)
    }
  ];

  if (opts.playlistId) {
    const p = playlists.find(x => x.id === opts.playlistId);
    if (p) {
      actions.push({
        icon: "playlist_remove",
        label: "Remover desta playlist",
        run: () => toggleInPlaylist(p, song)
      });
    }
  }

  actions.push({
    icon: "edit",
    label: song.coverBlob ? "Trocar capa pela galeria" : "Escolher capa da galeria",
    run: () => pickCoverFor(song.id)
  });

  actions.push({
    icon: "lyrics",
    label: song.lyrics ? "Trocar letra (.lrc)" : "Importar letra (.lrc)",
    run: () => pickLrcFor(song.id)
  });

  if (song.lyrics) {
    actions.push({
      icon: "speaker_notes_off",
      label: "Remover letra",
      run: () => {
        song.lyrics = "";
        dbPut(toRecord(song));
        if (song.id === currentId) renderLyrics(song);
        showToast("Letra removida");
      }
    });
  }

  actions.push({
    icon: "delete",
    label: "Excluir música",
    danger: true,
    run: () => deleteSong(song)
  });

  openSheet(song.name, actions);
}

/* ==========================================================
   Listas (Library e Search)
   ========================================================== */
function toggleFavorite(song) {
  song.favorite = !song.favorite;
  dbPut(toRecord(song));
  renderAll();
  if (song.id === currentId) updateFullPlayer();
  if (song.favorite) popHeart(song);
}

function setFavoriteControl(button, song) {
  button.setAttribute("aria-pressed", String(song.favorite));
  button.setAttribute(
    "aria-label",
    (song.favorite ? "Remover " : "Adicionar ") + song.name + " dos favoritos"
  );
}

// coração "estoura" ao favoritar
function popHeart(song) {
  const nodes = Array.from(
    document.querySelectorAll('.icon-btn.fav[data-fav="' + song.id + '"]')
  );
  if (song.id === currentId) nodes.push($("fpFav"));

  nodes.forEach(n => {
    n.classList.remove("pop");
    void n.offsetWidth;
    n.classList.add("pop");
    setTimeout(() => n.classList.remove("pop"), 650);
  });
}

function createSongItem(song, context, opts = {}) {
  const isCurrent = song.id === currentId;
  const item = el("div", "song-item" + (isCurrent ? " playing" : ""));

  const play = el("button", "song-main");
  play.type = "button";
  play.setAttribute("aria-label", "Tocar " + song.name + " — " + song.artist);

  const cover = el("div", "song-cover");
  setCover(cover, song.cover);

  if (isCurrent) {
    const eq = el("div", "eq" + (audio.paused ? " paused" : ""));
    eq.innerHTML = "<i></i><i></i><i></i>";
    cover.appendChild(eq);
  }

  const info = el("div", "song-info");
  info.append(el("strong", "", song.name), el("small", "", song.artist));
  play.append(cover, info);

  const fav = el("button", "icon-btn fav" + (song.favorite ? " active" : ""));
  setFavoriteControl(fav, song);
  fav.dataset.fav = String(song.id);
  setIcon(fav, song.favorite ? "favorite" : "favorite_border");
  fav.onclick = e => {
    e.stopPropagation();
    toggleFavorite(song);
  };

  const more = el("button", "icon-btn");
  more.setAttribute("aria-label", "Mais opções");
  setIcon(more, "more_vert");
  more.onclick = e => {
    e.stopPropagation();
    openSongMenu(song, opts);
  };

  play.onclick = () => {
    if (song.id === currentId) togglePlay();
    else playSong(song.id, context);
  };

  attachRipple(item);

  item.append(play, fav, more);
  return item;
}

function showEmpty(container, title, message, showButton) {
  container.innerHTML = "";

  const empty = el("div", "empty-state");
  empty.appendChild(el("span", "material-symbols-rounded", "library_music"));
  empty.appendChild(el("h3", "", title));
  empty.appendChild(el("p", "", message));

  if (showButton) {
    const button = el("button", "", "Adicionar músicas");
    button.onclick = openFilePicker;
    empty.appendChild(button);
  }

  container.appendChild(empty);
}

function renderSearch() {
  const container = $("searchSongList");
  container.innerHTML = "";

  const query = $("searchInput").value.trim().toLowerCase();

  const results = songs.filter(
    s =>
      s.name.toLowerCase().includes(query) ||
      s.artist.toLowerCase().includes(query)
  );

  if (results.length === 0) {
    $("searchStatus").textContent = query
      ? "Nenhum resultado para " + query + "."
      : "Nenhuma música na coleção.";
    showEmpty(
      container,
      songs.length === 0 ? "Nenhuma música adicionada" : "Nenhum resultado encontrado",
      songs.length === 0
        ? "Adicione músicas para pesquisar sua coleção."
        : "Experimente pesquisar por outro nome.",
      songs.length === 0
    );
    return;
  }

  $("searchStatus").textContent = query
    ? results.length + (results.length === 1 ? " resultado para " : " resultados para ") + query + "."
    : results.length + (results.length === 1 ? " música na coleção." : " músicas na coleção.");
  const ids = results.map(s => s.id);
  results.forEach(song => container.appendChild(createSongItem(song, ids)));
}

function librarySongs() {
  if (libraryFilter === "all") return songs.slice();
  if (libraryFilter === "fav") return songs.filter(s => s.favorite);

  const p = playlists.find(x => x.id === libraryFilter);
  if (!p) {
    libraryFilter = "all";
    return songs.slice();
  }

  return p.songIds.map(getSong).filter(Boolean);
}

function renderFilters() {
  const box = $("filters");
  box.innerHTML = "";

  const addChip = (label, value, extra) => {
    const active = libraryFilter === value;
    const chip = el("button", "filter" + (active ? " active" : "") + (extra ? " " + extra : ""));
    if (active) chip.appendChild(el("span", "material-symbols-rounded", "check"));
    chip.appendChild(document.createTextNode(label));
    chip.onclick = () => {
      libraryFilter = value;
      renderLibrary();
    };
    box.appendChild(chip);
  };

  addChip("Todas", "all");
  addChip("Favoritas", "fav");
  playlists.forEach(p => addChip(p.name, p.id));

  const add = el("button", "filter new");
  add.appendChild(el("span", "material-symbols-rounded", "add"));
  add.appendChild(document.createTextNode("Playlist"));
  add.onclick = async () => {
    const p = await createPlaylist();
    if (p) {
      libraryFilter = p.id;
      renderLibrary();
    }
  };
  box.appendChild(add);
}

function renderPlaylistBar(playlist, list) {
  const bar = $("playlistBar");

  if (!playlist) {
    bar.hidden = true;
    return;
  }

  bar.hidden = false;
  bar.innerHTML = "";

  const info = el("div", "pl-info");
  info.append(
    el("strong", "", playlist.name),
    el("span", "", list.length + (list.length === 1 ? " música" : " músicas"))
  );

  const play = el("button", "tonal-btn");
  play.appendChild(el("span", "material-symbols-rounded", "play_arrow"));
  play.appendChild(document.createTextNode("Tocar"));
  play.onclick = () => {
    if (list.length === 0) {
      showToast("A playlist está vazia");
      return;
    }
    const ids = list.map(s => s.id);
    const first = shuffle ? ids[Math.floor(Math.random() * ids.length)] : ids[0];
    playSong(first, ids);
  };

  const rename = el("button", "icon-btn");
  rename.setAttribute("aria-label", "Renomear playlist");
  setIcon(rename, "edit");
  rename.onclick = async () => {
    const name = await showDialog({
      title: "Renomear playlist",
      input: { value: playlist.name, placeholder: "Nome da playlist" },
      confirmLabel: "Salvar"
    });
    if (name) {
      playlist.name = name;
      savePlaylists();
      renderLibrary();
    }
  };

  const del = el("button", "icon-btn");
  del.setAttribute("aria-label", "Excluir playlist");
  setIcon(del, "delete");
  del.onclick = async () => {
    const ok = await showDialog({
      title: "Excluir playlist?",
      text: "As músicas continuam na biblioteca.",
      confirmLabel: "Excluir",
      danger: true
    });
    if (ok) {
      playlists = playlists.filter(p => p !== playlist);
      savePlaylists();
      libraryFilter = "all";
      renderLibrary();
      showToast("Playlist excluída");
    }
  };

  bar.append(info, play, rename, del);
}

function renderLibrary() {
  const container = $("songList");
  container.innerHTML = "";

  $("libraryCount").textContent =
    songs.length + (songs.length === 1 ? " música adicionada" : " músicas adicionadas");

  const list = librarySongs();
  const playlist = playlists.find(p => p.id === libraryFilter) || null;

  renderFilters();
  renderPlaylistBar(playlist, list);

  if (list.length === 0) {
    if (playlist) {
      showEmpty(
        container,
        "Playlist vazia",
        "Use o menu ⋮ de uma música para adicioná-la aqui.",
        false
      );
    } else if (libraryFilter === "fav") {
      showEmpty(
        container,
        "Nenhuma favorita",
        "Marque músicas com o coração para encontrá-las aqui.",
        false
      );
    } else {
      showEmpty(
        container,
        "Sua biblioteca está vazia",
        "As músicas que você adicionar aparecerão aqui.",
        false
      );
    }
    return;
  }

  const ids = list.map(s => s.id);
  const opts = playlist ? { playlistId: playlist.id } : {};
  list.forEach(song => container.appendChild(createSongItem(song, ids, opts)));
}

function renderAll() {
  renderSearch();
  renderLibrary();
}

/* ==========================================================
   Your Mix
   ========================================================== */
const homeTargets = { artMain: null, artSmall1: null, artSmall2: null };

function rankedForHome() {
  const arr = songs.slice();

  if (mixMode === "plays") {
    arr.sort(
      (a, b) =>
        b.playCount - a.playCount ||
        b.lastPlayed - a.lastPlayed ||
        a.id - b.id
    );
  } else {
    arr.sort((a, b) => b.lastPlayed - a.lastPlayed || a.id - b.id);
  }

  return arr;
}

function renderMixMode() {
  document.querySelectorAll("#mixMode button").forEach(b => {
    b.classList.toggle("active", b.dataset.mode === mixMode);
  });
}

document.querySelectorAll("#mixMode button").forEach(b => {
  b.addEventListener("click", () => {
    mixMode = b.dataset.mode;
    lsSet("mixMode", mixMode);
    renderMixMode();
    updateHome();
  });
});

function renderGreeting() {
  const h = new Date().getHours();
  const base = h < 5 ? "Boa madrugada" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const text = (base + (settings.name ? ", " + settings.name : "")).toUpperCase();
  const node = $("greeting");
  if (node.textContent === text) return;

  // primeira vez: só escreve. Depois: troca com uma transição suave
  if (!node.textContent || node.dataset.ready !== "1") {
    node.textContent = text;
    node.dataset.ready = "1";
    return;
  }

  node.classList.add("greet-out");
  setTimeout(() => {
    node.textContent = text;
    node.classList.remove("greet-out");
  }, 350);
}

// Confere o horário a cada 10 s e quando você volta para o app
setInterval(renderGreeting, 10000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) renderGreeting();
});
window.addEventListener("focus", renderGreeting);

function plural(n, one, many) {
  return n + " " + (n === 1 ? one : many);
}

function hCard(song, ctx, sub, rank) {
  const card = el("button", "h-card");

  const cover = el("div", "h-cover");
  setCover(cover, song.cover);
  if (rank) cover.appendChild(el("span", "h-rank", String(rank)));

  card.append(cover, el("strong", "", song.name), el("small", "", sub));

  card.onclick = () => {
    if (song.id === currentId) togglePlay();
    else playSong(song.id, ctx);
  };

  return card;
}

function fillRow(section, list, arr, subFn, ranked) {
  section.hidden = arr.length === 0;
  list.innerHTML = "";
  const ids = arr.map(s => s.id);
  arr.forEach((s, i) => list.appendChild(hCard(s, ids, subFn(s), ranked ? i + 1 : 0)));
}

let homeSig = "";

function renderHomeExtras() {
  const stats = $("homeStats");
  stats.hidden = songs.length === 0;

  const sig = songs
    .map(s => [s.id, s.playCount, s.lastPlayed, s.cover ? 1 : 0, s.favorite ? 1 : 0, s.name, s.artist].join(":"))
    .join("|");
  if (sig === homeSig) return;
  homeSig = sig;

  const plays = songs.reduce((n, s) => n + s.playCount, 0);
  const favs = songs.filter(s => s.favorite).length;

  stats.innerHTML = "";
  [
    [songs.length, "música", "músicas"],
    [plays, "reprodução", "reproduções"],
    [favs, "favorita", "favoritas"]
  ].forEach(([n, one, many]) => {
    const card = el("div", "stat");
    card.append(el("strong", "", String(n)), el("span", "", n === 1 ? one : many));
    stats.appendChild(card);
  });

  const top = songs
    .filter(s => s.playCount > 0)
    .sort((a, b) => b.playCount - a.playCount || b.lastPlayed - a.lastPlayed)
    .slice(0, 8);
  fillRow($("topSection"), $("topList"), top, s => plural(s.playCount, "vez", "vezes"), true);

  const recent = songs
    .filter(s => s.lastPlayed > 0)
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
    .slice(0, 8);
  fillRow($("recentSection"), $("recentList"), recent, s => s.artist, false);
}

function updateHome() {
  const ranked = rankedForHome();
  const main = current() || ranked[0] || null;
  const others = ranked.filter(s => s !== main);
  const pick = i => others[i] || main;

  homeMain = main;
  homeTargets.artMain = main ? main.id : null;
  homeTargets.artSmall1 = pick(0) ? pick(0).id : null;
  homeTargets.artSmall2 = pick(1) ? pick(1).id : null;

  setCover($("artMain"), main ? main.cover : null);
  setCover($("artSmall1"), pick(0) ? pick(0).cover : null);
  setCover($("artSmall2"), pick(1) ? pick(1).cover : null);
  [["artMain", main], ["artSmall1", pick(0)], ["artSmall2", pick(1)]].forEach(([id, song]) => {
    $(id).setAttribute("aria-label", song
      ? "Tocar " + song.name + " — " + song.artist
      : "Adicionar músicas");
  });

  $("heroSubtitle").textContent = main ? main.name : "Sua coleção musical";

  renderGreeting();
  renderHomeExtras();
  updateMiniPlayer();
}

["artMain", "artSmall1", "artSmall2"].forEach(id => {
  $(id).addEventListener("click", () => {
    const songId = homeTargets[id];

    if (songId === null || !getSong(songId)) {
      openFilePicker();
      return;
    }

    if (songId === currentId) togglePlay();
    else playSong(songId, allIds());
  });
});

/* ==========================================================
   Mini player
   ========================================================== */
// Ondinha de toque estilo Material
function attachRipple(node) {
  node.classList.add("ripple-host");

  node.addEventListener("pointerdown", e => {
    const r = node.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 2;
    const dot = el("span", "ripple");
    dot.style.width = dot.style.height = size + "px";
    dot.style.left = e.clientX - r.left - size / 2 + "px";
    dot.style.top = e.clientY - r.top - size / 2 + "px";
    node.appendChild(dot);
    dot.addEventListener("animationend", () => dot.remove());
  });
}

let lastMiniId = null;

function updateMiniPlayer() {
  const box = $("nowPlaying");

  if (songs.length === 0) {
    box.hidden = true;
    lastMiniId = null;
    return;
  }

  box.hidden = false;
  const song = current() || homeMain;
  if (!song) return;

  $("nowTitle").textContent = song.name;
  $("nowArtist").textContent = song.artist;
  setCover($("nowCover"), song.cover);
  $("nowLyrics").classList.toggle("has-lyrics", !!song.lyrics);
  $("nowLyrics").setAttribute("aria-label", song.lyrics ? "Mostrar letra disponível" : "Abrir e buscar a letra");

  // animação da capa só quando a música muda
  if (lastMiniId !== null && lastMiniId !== song.id) {
    const cover = $("nowCover");
    cover.classList.remove("pop");
    void cover.offsetWidth;
    cover.classList.add("pop");
    setTimeout(() => cover.classList.remove("pop"), 450);
  }
  lastMiniId = song.id;
}

attachRipple($("nowPlaying"));

$("nowPlaying").addEventListener("click", e => {
  if (e.target.closest("#nowPlay, #nowLyrics")) return;

  if (!current() && homeMain) playSong(homeMain.id, allIds());
  openFullPlayer();
});

$("nowLyrics").addEventListener("click", e => {
  e.stopPropagation();
  if (!current() && homeMain) playSong(homeMain.id, allIds());
  const song = current();
  if (!song) return;
  lyricsView = true;
  $("fpStage").classList.add("lyrics-on");
  renderLyrics(song);
  openFullPlayer();
  if (!song.lyrics) requestOnlineLyrics(song, true);
});

$("nowPlay").addEventListener("click", e => {
  e.stopPropagation();
  togglePlay();
});

$("heroPlay").addEventListener("click", () => {
  if (!current() && homeMain) playSong(homeMain.id, allIds());
  else togglePlay();
});

function updatePlayButtons() {
  const playing = !audio.paused && currentId !== null;
  const icon = playing ? "pause" : "play_arrow";

  setIcon($("heroPlay"), icon);
  setIcon($("nowPlay"), icon);
  setIcon($("fpPlay"), icon);

  $("heroPlay").classList.toggle("playing", playing);
  $("fpPlay").classList.toggle("playing", playing);

  // usado pelas animações (capa girando, bolhas, etc.)
  document.body.classList.toggle("is-playing", playing);
}

/* ==========================================================
   Reprodução
   ========================================================== */
function playSong(id, context, back) {
  const song = getSong(id);
  if (!song) return;

  if (context) queue = context.slice();
  else if (!queue.includes(id)) queue = allIds();

  if (!back && currentId !== null && currentId !== id) {
    playHistory.push(currentId);
    if (playHistory.length > 50) playHistory.shift();
  }

  currentId = id;
  song.playCount += 1;
  song.lastPlayed = Date.now();
  dbPut(toRecord(song));

  audio.src = song.url;
  playAudio();

  onSongChanged();
}

function onSongChanged() {
  lrcActive = -1;
  updateHome();
  updatePlayButtons();
  updateMediaSession();
  updateFullPlayer();
  renderLyrics(current());
  renderAll();
  updateColor();
  updateProgress();
}

function refreshAll() {
  updateHome();
  renderAll();
  updatePlayButtons();
  if (current()) updateFullPlayer();
  updateColor();
}

function togglePlay() {
  if (currentId === null) {
    const first = homeMain || songs[0];
    if (first) playSong(first.id, allIds());
    return;
  }

  if (audio.paused) {
    playAudio();
  } else {
    audio.pause();
  }
}

function pickNext(auto) {
  if (queue.length === 0) return null;
  if (repeat === "one" && auto) return currentId;

  const idx = queue.indexOf(currentId);

  if (shuffle) {
    if (queue.length === 1) return queue[0];
    let n;
    do {
      n = queue[Math.floor(Math.random() * queue.length)];
    } while (n === currentId);
    return n;
  }

  if (idx === -1) return queue[0];
  if (idx < queue.length - 1) return queue[idx + 1];
  return repeat === "all" || !auto ? queue[0] : null;
}

function playNext() {
  const next = pickNext(false);
  if (next !== null) playSong(next);
}

function playPrev() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  while (playHistory.length) {
    const id = playHistory.pop();
    if (getSong(id)) {
      playSong(id, null, true);
      return;
    }
  }

  const idx = queue.indexOf(currentId);
  if (idx > 0) playSong(queue[idx - 1], null, true);
  else if (queue.length > 1 && repeat === "all") playSong(queue[queue.length - 1], null, true);
  else audio.currentTime = 0;
}

audio.addEventListener("play", () => {
  updatePlayButtons();
  renderAll();
  updateMediaState();
});

audio.addEventListener("pause", () => {
  updatePlayButtons();
  renderAll();
  updateMediaState();
});

let lastPlaybackNotice = 0;
function notifyPlaybackProblem(message) {
  const now = Date.now();
  if (now - lastPlaybackNotice < 1800) return;
  lastPlaybackNotice = now;
  showToast(message);
}

audio.addEventListener("error", () => {
  if (!current()) return;
  const code = audio.error ? audio.error.code : 0;
  if (code === 1) return;
  let message = "Ocorreu um erro ao ler o arquivo de áudio.";
  if (code === 2) message = "Falha ao carregar os dados do arquivo de áudio.";
  else if (code === 3) message = "Não consegui decodificar este arquivo de áudio.";
  else if (code === 4) message = "Este formato não é compatível com o navegador.";
  updatePlayButtons();
  updateMediaState();
  notifyPlaybackProblem(message);
});

audio.addEventListener("ended", () => {
  const next = pickNext(true);

  if (next === null) {
    audio.pause();
    return;
  }

  if (next === currentId) {
    audio.currentTime = 0;
    playAudio();
  } else {
    playSong(next);
  }
});

audio.addEventListener("loadedmetadata", () => {
  updateProgress();
  updatePositionState();
});
audio.addEventListener("durationchange", updateProgress);
audio.addEventListener("timeupdate", updateProgress);

// mantém a barra da notificação em dia (a cada poucos segundos, pra gastar pouco)
let lastPosUpdate = 0;
audio.addEventListener("timeupdate", () => {
  const now = Date.now();
  if (now - lastPosUpdate > 2000) {
    lastPosUpdate = now;
    updatePositionState();
  }
});
audio.addEventListener("seeked", updatePositionState);
audio.addEventListener("playing", () => {
  updateMediaState();
  updatePositionState();
});

/* ---------- Media Session (notificação / tela de bloqueio) ---------- */
/* ----- Reprodução em segundo plano (só no app Android) -----
   No APK, o plugin nativo "MusicaNative" mantém um serviço em primeiro plano com a
   notificação de mídia. No navegador/PWA ele não existe e nada disso roda. */
const MN = (() => {
  try {
    const C = window.Capacitor;
    if (C && C.isNativePlatform && C.isNativePlatform()) {
      return C.registerPlugin ? C.registerPlugin("MusicaNative") : C.Plugins && C.Plugins.MusicaNative;
    }
  } catch (_) {}
  return null;
})();

function nativeMediaSession() {
  return MN;
}

const nativeState = { title: "", artist: "", playing: false, duration: 0, rate: 1 };
let nativeTimer = 0;
let nativeCover = "";
let nativeCoverDirty = false;
let nativeAskedNotif = false;

function sendNative() {
  if (!MN) return;
  const payload = {
    title: nativeState.title,
    artist: nativeState.artist,
    playing: nativeState.playing,
    position: audio.currentTime || 0,
    duration: nativeState.duration,
    rate: audio.playbackRate || 1
  };
  if (nativeCoverDirty) {
    payload.cover = nativeCover;
    nativeCoverDirty = false;
  }
  try {
    const r = MN.update(payload);
    if (r && r.catch) r.catch(() => {});
  } catch (_) {}
}

// capa pequena (JPEG 256px em base64) para a notificação
function nativeCoverFor(song) {
  if (!song.cover) return Promise.resolve("");
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 256;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const x = c.getContext("2d");
        const k = Math.max(size / img.width, size / img.height);
        x.drawImage(img, (size - img.width * k) / 2, (size - img.height * k) / 2, img.width * k, img.height * k);
        resolve(c.toDataURL("image/jpeg", 0.8).split(",")[1] || "");
      } catch (_) {
        resolve("");
      }
    };
    img.onerror = () => resolve("");
    img.src = song.cover;
  });
}

function callNativeMedia(method, payload) {
  if (!MN) return;

  if (method === "setMetadata") {
    nativeState.title = payload.title;
    nativeState.artist = payload.artist;
    nativeState.duration = 0;
    nativeCover = "";
    nativeCoverDirty = true;
    const song = current();
    if (song) {
      const id = song.id;
      nativeCoverFor(song).then(b64 => {
        if (currentId !== id) return;
        nativeCover = b64;
        nativeCoverDirty = true;
        sendNative();
      });
    }
  } else if (method === "setPlaybackState") {
    nativeState.playing = payload.playbackState === "playing";
    if (nativeState.playing && !nativeAskedNotif) {
      nativeAskedNotif = true;
      try { MN.requestNotifications(); } catch (_) {}
    }
  } else if (method === "setPositionState") {
    nativeState.duration = payload.duration;
  }

  clearTimeout(nativeTimer);
  nativeTimer = setTimeout(sendNative, 80);
}

// botões da notificação, da tela de bloqueio e dos fones
if (MN && MN.addListener) {
  MN.addListener("action", e => {
    switch (e && e.action) {
      case "play":
        if (currentId === null) togglePlay();
        else playAudio();
        break;
      case "pause":
        audio.pause();
        break;
      case "next":
        playNext();
        break;
      case "previous":
        playPrev();
        break;
      case "seek":
        if (typeof e.position === "number") {
          audio.currentTime = e.position;
          updatePositionState();
        }
        break;
    }
  });
}

function updateMediaSession() {
  const song = current();
  if (!song) return;

  const type = (song.coverBlob && song.coverBlob.type) || "image/jpeg";
  const art = song.cover
    ? ["96x96", "128x128", "192x192", "256x256", "384x384", "512x512"].map(sizes => ({
        src: song.cover, sizes, type
      }))
    : [{ src: "icon-512.png", sizes: "512x512", type: "image/png" }];

  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.name, artist: song.artist, album: "Música", artwork: art
      });
    } catch (_) {}
  }

  callNativeMedia("setMetadata", {
    title: song.name || "Música",
    artist: song.artist || "Artista desconhecido",
    album: "Música",
    artwork: art
  });
}

function updateMediaState() {
  const state = audio.paused ? "paused" : "playing";
  if ("mediaSession" in navigator) {
    try { navigator.mediaSession.playbackState = state; } catch (_) {}
  }
  callNativeMedia("setPlaybackState", { playbackState: state });
}

function updatePositionState() {
  if (!isFinite(audio.duration) || audio.duration <= 0) return;
  const position = Math.min(audio.currentTime || 0, audio.duration);
  const playbackRate = audio.playbackRate || 1;

  if ("mediaSession" in navigator && navigator.mediaSession.setPositionState) {
    try {
      navigator.mediaSession.setPositionState({
        duration: audio.duration, playbackRate, position
      });
    } catch (_) {}
  }

  callNativeMedia("setPositionState", {
    duration: audio.duration, playbackRate, position
  });
}

function playAudio() {
  let result;
  try { result = audio.play(); }
  catch (error) { notifyPlayRejected(error); return; }
  if (result && result.catch) result.catch(notifyPlayRejected);
}

function notifyPlayRejected(error) {
  if (error && error.name === "AbortError") return;
  if (error && error.name === "NotAllowedError") {
    notifyPlaybackProblem("O navegador bloqueou a reprodução. Toque novamente em reproduzir.");
  } else if (error && error.name === "NotSupportedError") {
    notifyPlaybackProblem("Este formato não é compatível com o navegador.");
  } else {
    notifyPlaybackProblem("Não foi possível iniciar a reprodução desta música.");
  }
}

function initMediaSessionHandlers() {
  const hasWeb = "mediaSession" in navigator;
  if (!hasWeb) return;

  const handlers = {
    play: () => {
      if (currentId === null) togglePlay();
      else playAudio();
    },
    pause: () => audio.pause(),
    stop: () => { audio.pause(); audio.currentTime = 0; },
    previoustrack: playPrev,
    nexttrack: playNext,
    seekbackward: d => {
      audio.currentTime = Math.max(0, audio.currentTime - ((d && d.seekOffset) || 10));
      updatePositionState();
    },
    seekforward: d => {
      const t = audio.currentTime + ((d && d.seekOffset) || 10);
      audio.currentTime = isFinite(audio.duration) ? Math.min(audio.duration, t) : t;
      updatePositionState();
    },
    seekto: d => {
      if (d && typeof d.seekTime === "number") {
        audio.currentTime = d.seekTime;
        updatePositionState();
      }
    }
  };

  Object.keys(handlers).forEach(name => {
    if (hasWeb) {
      try { navigator.mediaSession.setActionHandler(name, handlers[name]); } catch (_) {}
    }
  });
}

/* ==========================================================
   Progresso
   ========================================================== */
function updateProgress() {
  const d = audio.duration;
  const t = audio.currentTime || 0;
  const pct = d && isFinite(d) ? (t / d) * 100 : 0;

  $("miniProgress").style.width = pct + "%";

  if (!seeking) {
    const seek = $("seek");
    seek.value = pct * 10;
    seek.style.setProperty("--pct", pct + "%");
    $("curTime").textContent = fmt(t);
  }

  $("durTime").textContent = fmt(d);
  syncLyrics(t);
}

/* ----- Barra de progresso ondulada (Material 3 Expressive) ----- */
const wave = { cv: $("waveCanvas"), ctx: null, raf: 0, last: 0, phase: 0, amp: 0, frame: 0, primary: "#a8c7fa", track: "#333" };

function startWave() {
  if (!wave.cv || !wave.cv.getContext) return;
  if (!wave.ctx) wave.ctx = wave.cv.getContext("2d");
  if (!wave.ctx) return;
  $("seekWrap").classList.add("wave-on");
  if (!wave.raf) wave.raf = requestAnimationFrame(drawWave);
}

function drawWave(ts) {
  if (!fpOpen) { wave.raf = 0; return; }
  wave.raf = requestAnimationFrame(drawWave);

  const cv = wave.cv;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth;
  const h = cv.clientHeight;
  if (!w || !h) return;

  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (cv.width !== pw || cv.height !== ph) { cv.width = pw; cv.height = ph; }

  const dt = Math.min(0.05, (ts - (wave.last || ts)) / 1000);
  wave.last = ts;

  if (wave.frame++ % 20 === 0) {
    const cs = getComputedStyle(document.body);
    wave.primary = cs.getPropertyValue("--md-primary").trim() || wave.primary;
    wave.track = cs.getPropertyValue("--md-surface-container-highest").trim() || wave.track;
  }

  const playing = !audio.paused && !seeking;
  wave.amp += ((playing ? 3.6 : 0) - wave.amp) * Math.min(1, dt * 7);
  wave.phase += dt * (playing ? 4.2 : 1.2);

  const ctx = wave.ctx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const p = Math.max(0, Math.min(1, Number($("seek").value) / 1000));
  const x0 = 4, x1 = w - 4;
  const tx = x0 + (x1 - x0) * p;
  const cy = h / 2;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 4;

  // parte que falta: linha reta
  if (tx + 9 < x1) {
    ctx.strokeStyle = wave.track;
    ctx.beginPath();
    ctx.moveTo(tx + 9, cy);
    ctx.lineTo(x1, cy);
    ctx.stroke();
  }

  // parte tocada: onda
  const end = tx - 7;
  if (end > x0) {
    ctx.strokeStyle = wave.primary;
    ctx.beginPath();
    for (let x = x0; x <= end; x += 1.5) {
      const edge = Math.min(1, (x - x0) / 14, (end - x) / 14 + 0.15);
      const y = cy + Math.sin((x / 30) * Math.PI * 2 - wave.phase) * wave.amp * Math.max(0, edge);
      if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // marcador
  ctx.fillStyle = wave.primary;
  const th = seeking ? 28 : 24;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(tx - 2.5, cy - th / 2, 5, th, 2.5);
  else ctx.rect(tx - 2.5, cy - th / 2, 5, th);
  ctx.fill();
}

$("seek").addEventListener("input", () => {
  seeking = true;
  const seek = $("seek");
  const d = audio.duration || 0;
  seek.style.setProperty("--pct", seek.value / 10 + "%");
  $("curTime").textContent = fmt((seek.value / 1000) * d);
});

$("seek").addEventListener("change", () => {
  const seek = $("seek");
  if (audio.duration && isFinite(audio.duration)) {
    audio.currentTime = (seek.value / 1000) * audio.duration;
  }
  seeking = false;
  updatePositionState();
});

/* ==========================================================
   Player completo
   ========================================================== */
function updateFullPlayer() {
  const song = current();
  if (!song) return;

  $("fpTitle").textContent = song.name || "Sem título";
  $("fpArtist").textContent = song.artist || "Artista desconhecido";
  setCover($("fpCover"), song.cover);

  setIcon($("fpFav"), song.favorite ? "favorite" : "favorite_border");
  $("fpFav").classList.toggle("active", song.favorite);
  setFavoriteControl($("fpFav"), song);

  $("fpShuffle").classList.toggle("on", shuffle);

  const rep = $("fpRepeat");
  rep.classList.toggle("on", repeat !== "off");
  setIcon(rep, repeat === "one" ? "repeat_one" : "repeat");

  $("fpLyricsBtn").classList.toggle("on", lyricsView);
  $("fpLyricsBtn").setAttribute("aria-pressed", String(lyricsView));
  $("fpLyricsBtn").setAttribute("aria-label", lyricsView ? "Ocultar letra" : "Mostrar letra");

  // fundo desfocado com a capa
  $("fullPlayer").style.setProperty("--fp-bg", song.cover ? 'url("' + song.cover + '")' : "none");
}

let fpReturnFocus = null;

function openFullPlayer() {
  if (!current()) return;

  updateFullPlayer();
  $("fullPlayer").classList.add("open");
  $("fullPlayer").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");

  if (!fpOpen) {
    fpReturnFocus = document.activeElement;
    try {
      history.pushState({ fp: 1 }, "");
    } catch {}
  }

  fpOpen = true;
  startWave();
  requestAnimationFrame(() => $("fpClose").focus());
  if (lyricsView) requestAnimationFrame(scrollLyricsToActive);
}

function closeFullPlayer(fromPop) {
  if (!fpOpen) return;
  const returnFocus = fpReturnFocus;
  fpReturnFocus = null;
  fpOpen = false;

  $("fullPlayer").classList.remove("open");
  $("fullPlayer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");

  if (!fromPop) {
    try {
      if (history.state && history.state.fp) history.back();
    } catch {}
  }
  if (returnFocus && returnFocus.isConnected) returnFocus.focus();
}

window.addEventListener("popstate", () => {
  if (fpOpen) closeFullPlayer(true);
});

$("fpClose").onclick = () => closeFullPlayer();
$("fpPlay").onclick = togglePlay;
$("fpPrev").onclick = playPrev;
$("fpNext").onclick = playNext;

$("fpFav").onclick = () => {
  const song = current();
  if (song) toggleFavorite(song);
};

$("fpShuffle").onclick = () => {
  shuffle = !shuffle;
  updateFullPlayer();
  showToast(shuffle ? "Aleatório ligado" : "Aleatório desligado");
};

$("fpRepeat").onclick = () => {
  repeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
  updateFullPlayer();
  showToast(
    repeat === "off"
      ? "Repetir desligado"
      : repeat === "all"
      ? "Repetindo a lista"
      : "Repetindo esta música"
  );
};

$("fpMenu").onclick = () => {
  const song = current();
  if (song) openSongMenu(song);
};

$("fpLyricsBtn").onclick = () => {
  lyricsView = !lyricsView;
  $("fpStage").classList.toggle("lyrics-on", lyricsView);
  updateFullPlayer();
  if (lyricsView) {
    const song = current();
    if (song && !song.lyrics) requestOnlineLyrics(song, true);
    requestAnimationFrame(scrollLyricsToActive);
  }
};

/* ==========================================================
   Ajustes (cor do app, preto total, capa em disco, nome)
   ========================================================== */
const ACCENTS = [
  { id: "auto", name: "Da capa da música" },
  { id: 215, name: "Azul" },
  { id: 265, name: "Roxo" },
  { id: 330, name: "Rosa" },
  { id: 0, name: "Vermelho" },
  { id: 28, name: "Laranja" },
  { id: 140, name: "Verde" },
  { id: 175, name: "Turquesa" }
];

function applySettings() {
  document.body.classList.toggle("amoled", !!settings.amoled);
  document.body.classList.toggle("disc", !!settings.disc);
  applyShapes();
  applyFont();
  renderGreeting();
  updateColor();
}

function switchRow(title, desc, key) {
  const row = el("button", "set-row");
  const text = el("div", "set-row-text");
  text.append(el("strong", "", title), el("span", "", desc));

  const sw = el("span", "m3-switch" + (settings[key] ? " on" : ""));
  row.append(text, sw);

  row.onclick = () => {
    settings[key] = !settings[key];
    sw.classList.toggle("on", !!settings[key]);
    saveSettings();
    applySettings();
  };

  return row;
}

function openSettings() {
  const returnFocus = activeSheet ? activeSheet.returnFocus : document.activeElement;
  closeSheet();

  const scrim = el("div", "scrim");
  const sheet = el("div", "sheet");
  sheet.appendChild(el("div", "sheet-handle"));
  sheet.appendChild(el("h3", "", "Ajustes"));

  const sec = el("div", "set-sec");
  sec.appendChild(el("div", "set-label", "Cor do app"));

  const swatches = el("div", "swatches");
  const hint = el("div", "set-hint", "");
  const buttons = [];

  const refresh = () => {
    buttons.forEach(({ b, a }) => {
      const on = settings.accent === a.id;
      b.classList.toggle("on", on);
      b.replaceChildren();
      if (on) b.appendChild(el("span", "material-symbols-rounded", "check"));
    });

    const cur = ACCENTS.find(a => a.id === settings.accent);
    hint.textContent = "Cor atual: " + (cur ? cur.name : "Da capa da música");
  };

  ACCENTS.forEach(a => {
    const b = el("button", "swatch" + (a.id === "auto" ? " auto" : ""));
    b.setAttribute("aria-label", a.name);
    if (a.id !== "auto") b.style.background = "hsl(" + a.id + " 70% 62%)";

    b.onclick = () => {
      settings.accent = a.id;
      saveSettings();
      refresh();
      updateColor();
    };

    buttons.push({ b, a });
    swatches.appendChild(b);
  });

  refresh();
  sec.append(swatches, hint);

  sec.appendChild(
    switchRow("Preto total", "Fundo preto puro (economiza bateria em tela AMOLED)", "amoled")
  );
  sec.appendChild(
    switchRow("Capa em disco", "A capa vira um disco que gira enquanto toca", "disc")
  );
  sec.appendChild(
    switchRow("Deslizar entre páginas", "Arraste para o lado para trocar de página", "swipe")
  );
  sec.appendChild(
    switchRow("Inverter o gesto", "Troca a direção do arrastar entre as páginas", "swipeInvert")
  );
  sec.appendChild(el("div", "set-label", "Busca online (privacidade)"));
  sec.appendChild(
    switchRow("Buscar letras automaticamente", "Consulta o LRCLIB usando título, artista e duração; o áudio não é enviado", "autoLyrics")
  );
  sec.appendChild(
    switchRow("Buscar capas automaticamente", "Consulta a iTunes usando título e artista ao importar; o áudio não é enviado", "autoCovers")
  );

  const nameRow = el("button", "set-row");
  const nameText = el("div", "set-row-text");
  nameText.append(
    el("strong", "", "Seu nome"),
    el("span", "", settings.name || "Aparece na saudação da tela inicial")
  );
  nameRow.append(nameText, el("span", "material-symbols-rounded", "edit"));

  nameRow.onclick = async () => {
    closeSheet();

    const n = await showDialog({
      title: "Seu nome",
      input: { value: settings.name, placeholder: "Como você quer ser chamado?" },
      confirmLabel: "Salvar"
    });

    if (n === null) return;
    settings.name = n;
    saveSettings();
    renderGreeting();
  };

  sec.appendChild(nameRow);

  const permRow = el("button", "set-row");
  const permText = el("div", "set-row-text");
  permText.append(
    el("strong", "", "Importação e controles"),
    el("span", "", "Escolha arquivos e veja o suporte do navegador")
  );
  permRow.append(permText, el("span", "material-symbols-rounded", "folder"));
  permRow.onclick = () => openPermissions(false);
  sec.appendChild(permRow);

  const fontSec = el("div", "set-sec");
  fontSec.appendChild(el("div", "set-label", "Fonte das letras"));

  const fontRows = [];
  const paintFonts = () => {
    fontRows.forEach(({ id, check }) => {
      check.replaceChildren();
      if (settings.font === id) check.appendChild(el("span", "material-symbols-rounded", "check"));
    });
  };

  const fontRow = (id, name, note, family, deletable) => {
    const row = el("div", "set-row font-row");
    const main = el("button", "font-main");
    const text = el("div", "set-row-text");
    const title = el("strong", "", name);
    title.style.fontFamily = family;
    text.append(title, el("span", "", note));
    const check = el("span", "font-check");
    main.append(text, check);
    main.onclick = () => {
      settings.font = id;
      saveSettings();
      applyFont();
      paintFonts();
    };
    row.appendChild(main);

    if (deletable) {
      const del = el("button", "font-del");
      del.setAttribute("aria-label", "Apagar fonte");
      del.appendChild(el("span", "material-symbols-rounded", "delete"));
      del.onclick = async () => {
        const ok = await showDialog({
          title: "Apagar essa fonte?",
          text: "“" + name + "” será removida do app.",
          confirmLabel: "Apagar",
          danger: true
        });
        if (!ok) return;
        customFonts = customFonts.filter(f => f.id !== id);
        fontDbDelete(id);
        if (settings.font === id) {
          settings.font = "roboto";
          saveSettings();
          applyFont();
        }
        openSettings();
      };
      row.appendChild(del);
    }

    fontRows.push({ id, check });
    fontSec.appendChild(row);
  };

  GOOGLE_FONTS.forEach(f => {
    ensureGoogleFont(f);
    fontRow(f.id, f.name, f.note, f.id === "system" ? "system-ui" : '"' + f.family + '", system-ui, sans-serif', false);
  });
  customFonts.forEach(f => fontRow(f.id, f.name, "Importada por você", '"' + f.family + '", system-ui, sans-serif', true));

  const importRow = el("button", "set-row");
  const importText = el("div", "set-row-text");
  importText.append(
    el("strong", "", "Importar fonte"),
    el("span", "", "Escolha um arquivo .ttf, .otf ou .woff2 do seu celular")
  );
  importRow.append(importText, el("span", "material-symbols-rounded", "upload_file"));
  importRow.onclick = () => $("fontInput").click();
  fontSec.appendChild(importRow);
  paintFonts();

  const shapeSec = el("div", "set-sec");
  shapeSec.appendChild(el("div", "set-label", "Formas das bolinhas"));

  Object.keys(BUBBLES).forEach(id => {
    const row = el("button", "set-row");
    const cur = settings.shapes[id] || "default";
    const curName = (SHAPES.find(s => s.id === cur) || SHAPES[0]).name;
    const txt = el("div", "set-row-text");
    txt.append(el("strong", "", BUBBLES[id]), el("span", "", curName));
    const prev = el("span", "shape-prev mini shape-" + (cur !== "default" ? cur : DEFAULT_PREV[id]));
    row.append(txt, prev);
    row.onclick = () => openShapePicker(id, true);
    shapeSec.appendChild(row);
  });

  const resetRow = el("button", "set-row");
  const resetText = el("div", "set-row-text");
  resetText.append(
    el("strong", "", "Restaurar formas"),
    el("span", "", "Volta todas as bolinhas ao formato padrão")
  );
  resetRow.append(resetText, el("span", "material-symbols-rounded", "restart_alt"));
  resetRow.onclick = () => {
    settings.shapes = {};
    saveSettings();
    applyShapes();
    closeSheet();
  };
  shapeSec.appendChild(resetRow);
  sheet.appendChild(sec);
  sheet.appendChild(fontSec);
  sheet.appendChild(shapeSec);

  scrim.onclick = closeSheet;
  presentSheet(scrim, sheet, returnFocus);
}


/* ==========================================================
   Formas das bolinhas (segure para personalizar)
   ========================================================== */
const BUBBLES = {
  artMain: "Bolinha grande",
  artSmall1: "Bolinha da esquerda",
  artSmall2: "Bolinha da direita",
  heroPlay: "Botão de tocar"
};

const SHAPES = [
  { id: "default", name: "Padrão" },
  { id: "circle", name: "Círculo" },
  { id: "squircle", name: "Quadrado" },
  { id: "pill", name: "Pílula" },
  { id: "blob", name: "Blob" },
  { id: "diamond", name: "Losango" },
  { id: "hexagon", name: "Hexágono" },
  { id: "star", name: "Estrela" },
  { id: "flower", name: "Flor" },
  { id: "cookie", name: "Biscoito" },
  { id: "heart", name: "Coração" }
];

// Formas com recorte (clip-path) são desenhadas em SVG, em coordenadas 0..1
function buildClipDefs() {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.cssText = "position:absolute;width:0;height:0;pointer-events:none";

  const add = (id, d) => {
    const cp = document.createElementNS(NS, "clipPath");
    cp.setAttribute("id", "clip-" + id);
    cp.setAttribute("clipPathUnits", "objectBoundingBox");
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    cp.appendChild(p);
    svg.appendChild(cp);
  };

  const radial = (n, base, amp) => {
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      const r = base + amp * Math.cos(n * a);
      d += (i ? "L" : "M") + (0.5 + r * Math.cos(a)).toFixed(4) + "," + (0.5 + r * Math.sin(a)).toFixed(4);
    }
    return d + "Z";
  };

  const star = () => {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 0.22 : 0.5;
      d += (i ? "L" : "M") + (0.5 + r * Math.cos(a)).toFixed(4) + "," + (0.5 + r * Math.sin(a)).toFixed(4);
    }
    return d + "Z";
  };

  add("star", star());
  add("flower", radial(6, 0.39, 0.11));
  add("cookie", radial(12, 0.46, 0.04));
  add(
    "heart",
    "M0.5,0.97 C0.12,0.68 0,0.5 0,0.29 C0,0.11 0.13,0.02 0.27,0.02 C0.37,0.02 0.45,0.07 0.5,0.16 C0.55,0.07 0.63,0.02 0.73,0.02 C0.87,0.02 1,0.11 1,0.29 C1,0.5 0.88,0.68 0.5,0.97 Z"
  );

  document.body.appendChild(svg);
}
buildClipDefs();

function applyShapes() {
  Object.keys(BUBBLES).forEach(id => {
    const node = $(id);
    if (!node) return;
    [...node.classList].forEach(c => {
      if (c.indexOf("shape-") === 0) node.classList.remove(c);
    });
    const s = settings.shapes[id];
    if (s && s !== "default") node.classList.add("shape-" + s);
  });
}

const DEFAULT_PREV = { artMain: "blob", artSmall1: "circle", artSmall2: "circle", heroPlay: "squircle" };

function openShapePicker(id, backToSettings) {
  const returnFocus = activeSheet ? activeSheet.returnFocus : document.activeElement;
  closeSheet();

  const scrim = el("div", "scrim");
  const sheet = el("div", "sheet");
  sheet.appendChild(el("div", "sheet-handle"));
  sheet.appendChild(el("h3", "", BUBBLES[id]));
  sheet.appendChild(el("div", "set-hint shape-hint", "Escolha o formato"));

  const grid = el("div", "shape-grid");
  const current = settings.shapes[id] || "default";

  SHAPES.forEach(s => {
    const b = el("button", "shape-opt" + (s.id === current ? " on" : ""));
    b.setAttribute("aria-label", s.name);
    const prev = el("span", "shape-prev shape-" + (s.id !== "default" ? s.id : DEFAULT_PREV[id]));
    b.append(prev, el("small", "", s.name));

    b.onclick = () => {
      if (s.id === "default") delete settings.shapes[id];
      else settings.shapes[id] = s.id;
      saveSettings();
      applyShapes();
      closeSheet();
      if (backToSettings) setTimeout(openSettings, 300);
    };

    grid.appendChild(b);
  });

  sheet.appendChild(grid);

  scrim.onclick = closeSheet;
  presentSheet(scrim, sheet, returnFocus);
}


/* ==========================================================
   Importação e suporte do navegador
   ========================================================== */
async function openPermissions(firstRun) {
  const returnFocus = firstRun
    ? $("homeSettings")
    : activeSheet ? activeSheet.returnFocus : document.activeElement;
  closeSheet();
  if (firstRun) lsSet("permsAsked", true);

  const scrim = el("div", "scrim");
  const sheet = el("div", "sheet");
  sheet.appendChild(el("div", "sheet-handle"));
  sheet.appendChild(el("h3", "", firstRun ? "Bem-vindo à Música!" : "Importar músicas"));
  sheet.appendChild(
    el("div", "set-hint perm-intro", "Escolha arquivos ou uma pasta para adicionar músicas. O app só recebe os itens que você selecionar.")
  );

  const sec = el("div", "set-sec");
  const addOption = (icon, title, desc, label, action) => {
    const row = el("div", "set-row perm-row");
    row.appendChild(el("span", "material-symbols-rounded perm-ico", icon));
    const text = el("div", "set-row-text");
    text.append(el("strong", "", title), el("span", "", desc));
    const btn = el("button", "perm-btn", label);
    btn.onclick = () => {
      closeSheet();
      action();
    };
    row.append(text, btn);
    sec.appendChild(row);
  };

  addOption("folder", "Pasta de músicas", "Importa arquivos de áudio encontrados na pasta escolhida.", "Escolher", importFolder);
  addOption("upload_file", "Arquivos de áudio", "Selecione uma ou mais músicas individualmente.", "Escolher", openFilePicker);

  const note = el(
    "div",
    "set-hint",
    "Os controles na tela bloqueada dependem do suporte do navegador. Eles não precisam da permissão de notificações."
  );
  const done = el("button", "perm-done", firstRun ? "Continuar" : "Fechar");
  done.onclick = closeSheet;

  sheet.append(sec, note, done);
  scrim.onclick = closeSheet;
  presentSheet(scrim, sheet, returnFocus);
}

// Primeira abertura: mostra opções de importação uma vez.
async function maybeAskPermissionsFirstRun() {
  if (lsGet("permsAsked", false)) return;
  setTimeout(() => openPermissions(true), 1500);
}


/* ==========================================================
   Fontes (do Google, do sistema e importadas por você)
   ========================================================== */
const GOOGLE_FONTS = [
  { id: "roboto", name: "Roboto", note: "Padrão do app", family: "Roboto", css: null },
  { id: "poppins", name: "Poppins", note: "Redonda e moderna", family: "Poppins", css: "Poppins:wght@400;500;700;900" },
  { id: "nunito", name: "Nunito", note: "Suave e arredondada", family: "Nunito", css: "Nunito:wght@400;500;700;900" },
  { id: "montserrat", name: "Montserrat", note: "Geométrica", family: "Montserrat", css: "Montserrat:wght@400;500;700;900" },
  { id: "playfair", name: "Playfair Display", note: "Elegante, com serifa", family: "Playfair Display", css: "Playfair+Display:wght@400;500;700;900" },
  { id: "pixelify", name: "Pixelify Sans", note: "Pixelada, parecida com a do Minecraft", family: "Pixelify Sans", css: "Pixelify+Sans:wght@400;500;700", pixel: true },
  { id: "silkscreen", name: "Silkscreen", note: "Pixelada, em maiúsculas", family: "Silkscreen", css: "Silkscreen:wght@400;700", pixel: true },
  { id: "pressstart", name: "Press Start 2P", note: "Pixelada de arcade (bem larga)", family: "Press Start 2P", css: "Press+Start+2P", pixel: true, wide: true },
  { id: "system", name: "Fonte do sistema", note: "A do seu Android", family: "system-ui", css: null }
];

let customFonts = []; // { id, name, family, data }

const fontDbReady = (() => {
  try {
    return new Promise(resolve => {
      const req = indexedDB.open("musica-fonts", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("fonts", { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  } catch (_) {
    return Promise.resolve(null);
  }
})();

async function fontDbPut(rec) {
  const db = await fontDbReady;
  if (!db) return;
  db.transaction("fonts", "readwrite").objectStore("fonts").put(rec);
}

async function fontDbDelete(id) {
  const db = await fontDbReady;
  if (!db) return;
  db.transaction("fonts", "readwrite").objectStore("fonts").delete(id);
}

async function fontDbAll() {
  const db = await fontDbReady;
  if (!db) return [];
  return new Promise(resolve => {
    const req = db.transaction("fonts").objectStore("fonts").getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

const loadedFontCss = new Set();
function ensureGoogleFont(f) {
  if (!f || !f.css || loadedFontCss.has(f.id)) return;
  loadedFontCss.add(f.id);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=" + f.css + "&display=swap";
  document.head.appendChild(link);
}

async function registerCustomFont(rec) {
  const face = new FontFace(rec.family, rec.data, { weight: "100 900", style: "normal" });
  await face.load();
  document.fonts.add(face);
}

async function loadCustomFonts() {
  const all = await fontDbAll();
  for (const rec of all) {
    try {
      await registerCustomFont(rec);
      customFonts.push(rec);
    } catch (_) {}
  }
  applyFont();
}

function applyFont() {
  const root = document.documentElement;
  const g = GOOGLE_FONTS.find(f => f.id === settings.font);
  const c = customFonts.find(f => f.id === settings.font);

  let family = '"Roboto", system-ui, sans-serif';
  let pixel = false, wide = false, custom = false;

  if (g) {
    ensureGoogleFont(g);
    family = g.id === "system" ? "system-ui, sans-serif" : '"' + g.family + '", system-ui, sans-serif';
    pixel = !!g.pixel;
    wide = !!g.wide;
    custom = g.id !== "roboto";
  } else if (c) {
    family = '"' + c.family + '", system-ui, sans-serif';
    custom = true;
  }

  root.style.setProperty("--app-font", family);
  document.body.classList.toggle("font-custom", custom);
  document.body.classList.toggle("font-pixel", pixel);
  document.body.classList.toggle("font-wide", wide);
}

function cleanFontName(fileName) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 40) || "Minha fonte";
}

async function importFontFile(file) {
  if (!file) return;
  if (file.size > 15 * 1024 * 1024) {
    showToast("Essa fonte é grande demais (máximo 15 MB)");
    return;
  }

  const id = "custom-" + Date.now();
  const rec = { id, name: cleanFontName(file.name), family: "UserFont-" + id, data: await file.arrayBuffer() };

  try {
    await registerCustomFont(rec);
  } catch (_) {
    showToast("Esse arquivo não parece ser uma fonte válida");
    return;
  }

  customFonts.push(rec);
  await fontDbPut(rec);
  settings.font = id;
  saveSettings();
  applyFont();
  showToast("Fonte “" + rec.name + "” adicionada");
}

$("fontInput").addEventListener("change", () => {
  const file = $("fontInput").files && $("fontInput").files[0];
  importFontFile(file);
  $("fontInput").value = "";
});

$("homeSettings").onclick = openSettings;

/* ==========================================================
   Letras (.lrc)
   ========================================================== */
let lrcLines = [];
let lrcSynced = false;
let lrcActive = -1;

function parseLrc(text) {
  const lines = [];
  let synced = false;

  text.split(/\r?\n/).forEach(raw => {
    const stamps = Array.from(
      raw.matchAll(/\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g)
    );

    const content = raw
      .replace(/\[[^\]]*\]/g, "")
      .replace(/<\d{1,3}:\d{2}(?:[.:]\d{1,3})?>/g, "")
      .trim();

    if (stamps.length === 0) {
      if (content) lines.push({ t: null, text: content });
      return;
    }

    synced = true;
    stamps.forEach(m => {
      const frac = m[3] ? Number(m[3]) / Math.pow(10, m[3].length) : 0;
      lines.push({
        t: Number(m[1]) * 60 + Number(m[2]) + frac,
        text: content || "♪"
      });
    });
  });

  if (synced) {
    return {
      synced: true,
      lines: lines.filter(l => l.t !== null).sort((a, b) => a.t - b.t)
    };
  }

  return { synced: false, lines };
}

function renderLyrics(song) {
  const box = $("fpLyrics");
  box.innerHTML = "";
  lrcLines = [];
  lrcSynced = false;
  lrcActive = -1;

  if (!song || !song.lyrics) {
    const empty = el("div", "lrc-empty");
    empty.appendChild(el("span", "material-symbols-rounded", "lyrics"));
    const state = lyricsLookupStatus.get(song && song.id);
    const messages = {
      searching: "Buscando letras online…",
      "not-found": "Não encontramos uma letra correspondente.",
      error: "Não foi possível buscar agora. Verifique a conexão e tente novamente.",
      limited: "A busca está temporariamente limitada. Tente novamente mais tarde."
    };
    const message = el("p", "", messages[state] || "Esta música ainda não tem letra.");
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    empty.appendChild(message);

    if (state !== "searching") {
      const actions = el("div", "lyrics-actions");
      const searchBtn = el("button", "tonal-btn");
      searchBtn.appendChild(el("span", "material-symbols-rounded", "search"));
      searchBtn.appendChild(document.createTextNode("Buscar na internet"));
      searchBtn.onclick = () => {
        if (song) requestOnlineLyrics(song, true);
      };
      actions.appendChild(searchBtn);

      const importBtn = el("button", "tonal-btn");
      importBtn.appendChild(el("span", "material-symbols-rounded", "upload_file"));
      importBtn.appendChild(document.createTextNode("Importar .lrc"));
      importBtn.onclick = () => {
        if (song) pickLrcFor(song.id);
      };
      actions.appendChild(importBtn);
      empty.appendChild(actions);
    }

    empty.appendChild(el("small", "lyrics-search-note", "A busca envia apenas título, artista e álbum ao LRCLIB; o arquivo de áudio não é enviado."));
    box.appendChild(empty);
    return;
  }

  const parsed = parseLrc(song.lyrics);
  lrcLines = parsed.lines;
  lrcSynced = parsed.synced;

  lrcLines.forEach(line => {
    const p = el("p", "lrc-line" + (lrcSynced ? "" : " plain"), line.text);

    if (lrcSynced) {
      p.onclick = () => {
        audio.currentTime = line.t;
      };
    }

    box.appendChild(p);
  });

  if (song.lyricsSource === "lrclib") {
    const source = el("a", "lyrics-source", "Letra encontrada pelo LRCLIB");
    source.href = song.lyricsSourceId
      ? "https://lrclib.net/api/get/" + encodeURIComponent(song.lyricsSourceId)
      : "https://lrclib.net/";
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    box.appendChild(source);
  }

  syncLyrics(audio.currentTime || 0);
}

function scrollLyricsToActive() {
  const box = $("fpLyrics");
  const node = box.children[lrcActive];
  if (!node || !lrcSynced) return;

  box.scrollTo({
    top: node.offsetTop - box.clientHeight / 2 + node.offsetHeight / 2,
    behavior: "smooth"
  });
}

function syncLyrics(t) {
  if (!lrcSynced || lrcLines.length === 0) return;

  const target = t + 0.25;
  let lo = 0;
  let hi = lrcLines.length - 1;
  let idx = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lrcLines[mid].t <= target) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (idx === lrcActive) return;

  const nodes = $("fpLyrics").children;
  if (nodes[lrcActive]) nodes[lrcActive].classList.remove("active");
  lrcActive = idx;

  if (idx >= 0 && nodes[idx]) {
    nodes[idx].classList.add("active");
    if (lyricsView && fpOpen) scrollLyricsToActive();
  }
}

lrcInput.addEventListener("change", async () => {
  const file = lrcInput.files && lrcInput.files[0];
  lrcInput.value = "";
  if (!file) return;

  const song = getSong(lrcTargetId !== null ? lrcTargetId : currentId);
  if (!song) {
    showToast("Escolha uma música primeiro");
    return;
  }

  try {
    song.lyrics = await file.text();
    song.lyricsSource = "lrc";
    song.lyricsSourceId = null;
  } catch {
    showToast("Não consegui ler esse arquivo");
    return;
  }

  dbPut(toRecord(song));
  if (song.id === currentId) renderLyrics(song);
  showToast("Letra adicionada");
});

/* ==========================================================
   Pesquisa
   ========================================================== */
$("searchInput").addEventListener("input", renderSearch);

/* ==========================================================
   Inicialização
   ========================================================== */
async function loadSongs() {
  const records = await dbGetAll();
  records.sort((a, b) => a.id - b.id);

  for (const r of records) {
    if (!r || !r.file) continue;
    const song = makeSong(r);
    const genericArtist = !song.artist || ["arquivo local", "artista desconhecido", "unknown"].includes(String(song.artist).trim().toLowerCase());
    if (genericArtist) {
      const inferred = inferLocalArtistFromFilename(song.file);
      if (inferred) {
        song.artist = inferred.artist;
        // Atualiza o título apenas quando ele ainda corresponde ao nome completo do arquivo.
        const savedTitle = String(song.name || "").trim();
        const fileTitle = String(song.file.name || "").replace(/\\.[^/.]+$/, "").trim();
        if (!savedTitle || savedTitle === fileTitle) song.name = inferred.title;
        await dbPut(toRecord(song));
      }
    }
    songs.push(song);
  }

  const valid = new Set(allIds());
  let changed = false;
  playlists.forEach(p => {
    const kept = p.songIds.filter(id => valid.has(id));
    if (kept.length !== p.songIds.length) {
      p.songIds = kept;
      changed = true;
    }
  });
  if (changed) savePlaylists();
}

applyTheme();
applySettings();
renderMixMode();
renderAll();
updateHome();
updatePlayButtons();
renderLyrics(null);
initMediaSessionHandlers();
loadCustomFonts();
$("homePage").classList.add("stagger");
setTimeout(() => $("homePage").classList.remove("stagger"), 1100);

loadSongs().then(() => {
  refreshAll();
  maybeAskPermissionsFirstRun();
});

/* ==========================================================
   Instalação como app (PWA) e uso offline
   ========================================================== */
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
