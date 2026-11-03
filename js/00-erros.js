"use strict";

/* ==========================================================
  Registro de erros — guarda os últimos problemas para você
  poder ver (Ajustes → Registro de erros) e me mandar.
  ========================================================== */
const ERR_KEY = "errorLog";
const ERR_MAX = 40;

function readErrLog() {
  try {
    const v = JSON.parse(localStorage.getItem(ERR_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch (_) {
    return [];
  }
}

function logErr(where, err) {
  try {
    const msg = String((err && (err.stack || err.message)) || err || "erro")
      .split("\n").slice(0, 3).join(" | ").slice(0, 300);
    const log = readErrLog();
    const last = log[log.length - 1];
    if (last && last.w === where && last.m === msg) {
      last.n = (last.n || 1) + 1;
      last.t = Date.now();
    } else {
      log.push({ t: Date.now(), w: String(where), m: msg, n: 1 });
    }
    localStorage.setItem(ERR_KEY, JSON.stringify(log.slice(-ERR_MAX)));
  } catch (_) { /* sem armazenamento: nada a fazer */ }
}

function errLogText() {
  const log = readErrLog();
  if (!log.length) return "";
  return log.slice().reverse().map(e => {
    const d = new Date(e.t);
    const hora = d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR");
    return hora + " · " + e.w + (e.n > 1 ? " (x" + e.n + ")" : "") + "\n" + e.m;
  }).join("\n\n");
}

window.addEventListener("error", e => {
  logErr("janela " + (e.filename || "").split("/").pop() + ":" + (e.lineno || 0), e.error || e.message);
});
window.addEventListener("unhandledrejection", e => logErr("promessa", e.reason));
