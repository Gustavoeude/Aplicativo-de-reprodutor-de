"use strict";

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

let settingsPage = null; // null = menu principal

function catRow(icon, hue, title, desc, onClick) {
  const row = el("button", "cat-row");
  const ic = el("span", "cat-ic material-symbols-rounded", icon);
  ic.style.background = "hsl(" + hue + " 38% 30%)";
  const txt = el("div", "set-row-text");
  txt.append(el("strong", "", title), el("span", "", desc));
  row.append(ic, txt);
  row.onclick = onClick;
  return row;
}

/* ----- páginas dos Ajustes ----- */
function pageAparencia(go) {
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
        go("aparencia");
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
    go("aparencia");
  };
  shapeSec.appendChild(resetRow);

  return [sec, fontSec, shapeSec];
}

function pageBiblioteca() {
  const sec = el("div", "set-sec");
  const permRow = el("button", "set-row");
  const permText = el("div", "set-row-text");
  permText.append(
    el("strong", "", "Importação e controles"),
    el("span", "", "Escolha arquivos e veja o suporte do navegador")
  );
  permRow.append(permText, el("span", "material-symbols-rounded", "folder"));
  permRow.onclick = () => openPermissions(false);
  sec.appendChild(permRow);
  return [sec];
}

function pageReproducao() {
  const sec = el("div", "set-sec");
  if (MN) {
    sec.appendChild(
      switchRow("Player nativo (segundo plano mais estável)", "Toca pelo Android, mesmo com o app congelado. Feche e abra o app depois de mudar.", "nativePlayer")
    );
  }
  return [sec];
}

function pageComportamento() {
  const sec = el("div", "set-sec");
  sec.appendChild(
    switchRow("Deslizar entre páginas", "Arraste para o lado para trocar de página", "swipe")
  );
  sec.appendChild(
    switchRow("Inverter o gesto", "Troca a direção do arrastar entre as páginas", "swipeInvert")
  );
  return [sec];
}

function pagePrivacidade() {
  const sec = el("div", "set-sec");
  sec.appendChild(el("div", "set-label", "Busca online"));
  sec.appendChild(
    switchRow("Buscar letras automaticamente", "Consulta o LRCLIB usando título, artista e duração; o áudio não é enviado", "autoLyrics")
  );
  sec.appendChild(
    switchRow("Buscar capas automaticamente", "Consulta a iTunes usando título e artista ao importar; o áudio não é enviado", "autoCovers")
  );
  return [sec];
}

function pageDiagnostico() {
  const sec = el("div", "set-sec");
  const errRow = el("button", "set-row");
  const errText = el("div", "set-row-text");
  errText.append(
    el("strong", "", "Registro de erros"),
    el("span", "", readErrLog().length ? "Há problemas registrados; toque para ver e copiar" : "Nenhum problema registrado")
  );
  errRow.append(errText, el("span", "material-symbols-rounded", "bug_report"));
  errRow.onclick = async () => {
    const txt = errLogText();
    if (!txt) { showToast("Nenhum erro registrado."); return; }
    const ok = await showDialog({
      title: "Registro de erros",
      text: txt.length > 900 ? txt.slice(0, 900) + "…" : txt,
      confirmLabel: "Copiar tudo"
    });
    if (!ok) return;
    try {
      await navigator.clipboard.writeText(txt);
      showToast("Copiado.");
    } catch (e) {
      logErr("copiar-registro", e);
      showToast("Não consegui copiar.");
    }
  };
  sec.appendChild(errRow);
  return [sec];
}

async function editProfileName() {
  closeSheet();
  const n = await showDialog({
    title: "Seu nome",
    input: { value: settings.name, placeholder: "Como você quer ser chamado?" },
    confirmLabel: "Salvar"
  });
  if (n !== null) {
    settings.name = n;
    saveSettings();
    renderGreeting();
  }
  setTimeout(() => openSettings(), 300);
}

const SETTINGS_PAGES = {
  aparencia: { title: "Aparência", build: pageAparencia },
  biblioteca: { title: "Biblioteca", build: pageBiblioteca },
  reproducao: { title: "Reprodução", build: pageReproducao },
  comportamento: { title: "Comportamento", build: pageComportamento },
  privacidade: { title: "Privacidade", build: pagePrivacidade },
  diagnostico: { title: "Diagnóstico", build: pageDiagnostico }
};

function renderSettingsPage(sheet, go) {
  sheet.replaceChildren(el("div", "sheet-handle"));
  const page = SETTINGS_PAGES[settingsPage];

  if (!page) {
    settingsPage = null;
    sheet.appendChild(el("h3", "set-title", "Ajustes"));
    const list = el("div", "cat-list");
    list.append(
      catRow("person", 215, "Perfil", settings.name ? settings.name : "Seu nome e saudação", editProfileName),
      catRow("library_music", 205, "Biblioteca", "Importar músicas e pastas", () => go("biblioteca")),
      catRow("light_mode", 335, "Aparência", "Cor do app, fonte, preto total, capa em disco", () => go("aparencia"))
    );
    if (MN) list.appendChild(catRow("music_note", 350, "Reprodução", "Player nativo e segundo plano", () => go("reproducao")));
    list.append(
      catRow("settings", 230, "Comportamento", "Deslizar entre páginas e gestos", () => go("comportamento")),
      catRow("lyrics", 175, "Privacidade", "Buscas online de letras e capas", () => go("privacidade")),
      catRow("bug_report", 120, "Diagnóstico", "Registro de erros", () => go("diagnostico"))
    );
    sheet.appendChild(list);
    return;
  }

  const head = el("div", "set-head");
  const back = el("button", "set-back");
  back.setAttribute("aria-label", "Voltar");
  back.appendChild(el("span", "material-symbols-rounded", "arrow_back"));
  back.onclick = () => go(null);
  head.append(back, el("h3", "", page.title));
  sheet.appendChild(head);
  page.build(go).forEach(n => sheet.appendChild(n));
}

function openSettings(page) {
  settingsPage = typeof page === "string" ? page : null;
  const returnFocus = activeSheet ? activeSheet.returnFocus : document.activeElement;
  closeSheet();

  const scrim = el("div", "scrim");
  const sheet = el("div", "sheet");
  const go = p => {
    settingsPage = p;
    renderSettingsPage(sheet, go);
    sheet.scrollTop = 0;
  };
  renderSettingsPage(sheet, go);

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
      if (backToSettings) setTimeout(() => openSettings("aparencia"), 300);
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


