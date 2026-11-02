"use strict";

/* ==========================================================
   Ajustes em tela cheia (categorias) + funções extras
   Usa as variáveis e funções do script.js (carregado antes).
   ========================================================== */
const APP_VERSION = "v27";

(function () {
  /* ---------- utilidades ---------- */
  const DEFAULTS = JSON.parse(
    JSON.stringify({
      accent: "auto", amoled: false, disc: false, name: "", shapes: {}, swipe: true, swipeInvert: false,
      font: "roboto", sort: "added", speed: 1, resume: true, fade: false, haptics: false, dblFav: true,
      wake: false, eq: { on: false, preset: "flat", gains: [0, 0, 0, 0, 0] }
    })
  );
  if (!settings.eq || !Array.isArray(settings.eq.gains)) settings.eq = JSON.parse(JSON.stringify(DEFAULTS.eq));

  const fmtBytes = n => {
    if (!n) return "0 MB";
    const mb = n / 1048576;
    return mb >= 1024 ? (mb / 1024).toFixed(2).replace(".", ",") + " GB" : mb.toFixed(mb < 10 ? 1 : 0).replace(".", ",") + " MB";
  };
  const songKey = s => (s.file ? s.file.name : s.name) + "|" + (s.file ? s.file.size : 0);

  const SORTS = [
    { value: "added", label: "Ordem em que foram adicionadas" },
    { value: "name", label: "Nome (A–Z)" },
    { value: "artist", label: "Artista (A–Z)" },
    { value: "plays", label: "Mais tocadas" },
    { value: "recent", label: "Tocadas recentemente" }
  ];
  const SPEEDS = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2];
  const THEMES = [
    { value: "auto", label: "Automático (igual ao aparelho)" },
    { value: "light", label: "Claro" },
    { value: "dark", label: "Escuro" }
  ];
  const themeName = () => (THEMES.find(t => t.value === (manualTheme || "auto")) || THEMES[0]).label.split(" (")[0];
  const sortName = () => (SORTS.find(t => t.value === settings.sort) || SORTS[0]).label;
  const fontName = () => {
    const g = GOOGLE_FONTS.find(f => f.id === settings.font);
    const c = customFonts.find(f => f.id === settings.font);
    return g ? g.name : c ? c.name : "Roboto";
  };

  function choose(title, options, cur, cb) {
    openSheet(
      title,
      options.map(o => ({
        label: o.label,
        icon: o.value === cur ? "check" : "",
        run: () => {
          cb(o.value);
          refresh();
        }
      }))
    );
  }

  /* ---------- construtores de linhas ---------- */
  function iconBubble(icon, hue) {
    const b = el("span", "sp-ico");
    b.style.setProperty("--h", hue);
    b.appendChild(el("span", "material-symbols-rounded", icon));
    return b;
  }

  function textBlock(title, sub) {
    const t = el("div", "sp-t");
    t.appendChild(el("strong", "", title));
    if (sub !== undefined && sub !== "") t.appendChild(el("span", "", sub));
    return t;
  }

  // linha genérica. opts: icon, hue, title, sub, trail ("chevron" | "switch:on" | texto | Node), onclick, danger
  function row(opts) {
    const r = el(opts.onclick ? "button" : "div", "sp-row" + (opts.danger ? " danger" : "") + (opts.onclick ? "" : " static"));
    if (opts.icon) r.appendChild(iconBubble(opts.icon, opts.hue === undefined ? 215 : opts.hue));
    const tb = textBlock(opts.title, opts.sub);
    r.appendChild(tb);
    r._sub = tb.querySelector("span");

    if (opts.trail === "chevron") r.appendChild(el("span", "material-symbols-rounded sp-chev", "chevron_right"));
    else if (opts.trail instanceof Node) r.appendChild(opts.trail);
    else if (typeof opts.trail === "string" && opts.trail) r.appendChild(el("span", "sp-val", opts.trail));

    if (opts.onclick) r.onclick = opts.onclick;
    return r;
  }

  function switchRowSP(title, sub, key, hue, icon, after) {
    const sw = el("span", "m3-switch" + (settings[key] ? " on" : ""));
    return row({
      icon, hue, title, sub, trail: sw,
      onclick: () => {
        settings[key] = !settings[key];
        sw.classList.toggle("on", !!settings[key]);
        saveSettings();
        applySettings();
        if (after) after();
      }
    });
  }

  function group(rows, label) {
    const wrap = el("div", "sp-block");
    if (label) wrap.appendChild(el("div", "sp-label", label));
    const g = el("div", "sp-group");
    rows.filter(Boolean).forEach(r => g.appendChild(r));
    wrap.appendChild(g);
    return wrap;
  }

  /* ---------- páginas (views) ---------- */
  const views = {};

  // ===== principal =====
  views.main = {
    title: () => "Ajustes",
    build(box) {
      const n = songs.length;
      const go = v => () => navigate(v);
      box.appendChild(
        group([
          row({ icon: "library_music", hue: 215, title: "Gerenciar músicas", sub: n + (n === 1 ? " música" : " músicas") + " · ordem: " + sortName().split(" (")[0].toLowerCase(), trail: "chevron", onclick: go("library") }),
          row({ icon: "palette", hue: 330, title: "Aparência", sub: "Tema " + themeName().toLowerCase() + ", cores, fonte e formas", trail: "chevron", onclick: go("look") }),
          row({ icon: "play_arrow", hue: 140, title: "Reprodução", sub: "Velocidade " + settings.speed + "x, temporizador, retomar e fade", trail: "chevron", onclick: go("play") }),
          row({ icon: "equalizer", hue: 28, title: "Equalizador", sub: settings.eq.on ? "Ligado · " + eqPresetName() : "Desligado", trail: "chevron", onclick: go("eq") })
        ])
      );
      box.appendChild(
        group([
          row({ icon: "touch_app", hue: 265, title: "Gestos e comportamento", sub: "Deslizar, vibração, toque duplo e tela ligada", trail: "chevron", onclick: go("behavior") }),
          row({ icon: "backup", hue: 175, title: "Backup e restauração", sub: "Salvar e recuperar ajustes, playlists e favoritas", trail: "chevron", onclick: go("backup") }),
          row({ icon: "notifications", hue: 0, title: "Permissões", sub: "Notificações e pasta de músicas", trail: "chevron", onclick: () => openPermissions(false) }),
          row({ icon: "info", hue: 200, title: "Sobre e diagnóstico", sub: "Versão " + APP_VERSION + ", recursos do aparelho e atualização", trail: "chevron", onclick: go("about") })
        ])
      );
    }
  };

  // ===== biblioteca =====
  views.library = {
    title: () => "Gerenciar músicas",
    build(box) {
      box.appendChild(
        group(
          [
            row({ icon: "add", hue: 215, title: "Adicionar músicas", sub: "Escolher arquivos de áudio do aparelho", trail: "chevron", onclick: () => fileInput.click() }),
            row({ icon: "folder", hue: 45, title: "Importar uma pasta", sub: "Traz todas as músicas de uma pasta e subpastas", trail: "chevron", onclick: () => importFolder() })
          ],
          "Adicionar"
        )
      );
      box.appendChild(
        group(
          [
            row({
              icon: "sort", hue: 265, title: "Ordenar a biblioteca", sub: sortName(), trail: "chevron",
              onclick: () =>
                choose("Ordenar a biblioteca", SORTS, settings.sort, v => {
                  settings.sort = v;
                  saveSettings();
                  renderAll();
                })
            })
          ],
          "Organização"
        )
      );

      const total = songs.reduce((a, s) => a + (s.file ? s.file.size : 0), 0);
      const storageRow = row({ icon: "storage", hue: 175, title: "Espaço usado pelas músicas", sub: fmtBytes(total) + " em " + songs.length + (songs.length === 1 ? " arquivo" : " arquivos") });
      const persistRow = row({ icon: "memory", hue: 200, title: "Proteger contra limpeza", sub: "Verificando…" });
      box.appendChild(group([storageRow, persistRow], "Armazenamento"));

      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(e => {
          if (e && e.quota) storageRow._sub.textContent = fmtBytes(total) + " em músicas · app usa " + fmtBytes(e.usage) + " de " + fmtBytes(e.quota) + " disponíveis";
        }).catch(() => {});
      }
      const paintPersist = async () => {
        if (!(navigator.storage && navigator.storage.persisted)) {
          persistRow._sub.textContent = "Seu navegador não oferece essa opção";
          return;
        }
        const ok = await navigator.storage.persisted().catch(() => false);
        persistRow._sub.textContent = ok ? "Ativado: o aparelho não apaga suas músicas sozinho" : "Toque para pedir que o aparelho não apague suas músicas";
        if (!ok) {
          persistRow.classList.remove("static");
          persistRow.onclick = async () => {
            const g = await navigator.storage.persist().catch(() => false);
            showToast(g ? "Armazenamento protegido" : "O aparelho não liberou agora");
            paintPersist();
          };
        } else {
          persistRow.onclick = null;
        }
      };
      paintPersist();

      box.appendChild(
        group(
          [
            row({
              icon: "delete", hue: 0, title: "Apagar todas as músicas", sub: "Remove tudo da biblioteca (os arquivos do celular ficam)", danger: true,
              onclick: async () => {
                if (!songs.length) return showToast("A biblioteca já está vazia");
                const ok = await showDialog({
                  title: "Apagar todas as músicas?",
                  text: "As " + songs.length + " músicas saem do app. Playlists ficarão vazias. Os arquivos originais não são apagados.",
                  confirmLabel: "Apagar tudo",
                  danger: true
                });
                if (!ok) return;
                wipeLibrary();
                refresh();
              }
            })
          ],
          "Zona de perigo"
        )
      );
    }
  };

  function wipeLibrary() {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    currentId = null;
    if (fpOpen) closeFullPlayer();
    songs.forEach(s => {
      try { URL.revokeObjectURL(s.url); if (s.cover) URL.revokeObjectURL(s.cover); } catch {}
      dbDelete(s.id);
    });
    songs.length = 0;
    playlists.forEach(p => (p.songIds = []));
    savePlaylists();
    queue = [];
    playHistory = [];
    lsSet("lastPlayback", null);
    onSongChanged();
    refreshAll();
    showToast("Biblioteca esvaziada");
  }

  // ===== aparência =====
  views.look = {
    title: () => "Aparência",
    build(box) {
      box.appendChild(
        group([
          row({
            icon: "dark_mode", hue: 265, title: "Tema", sub: themeName(), trail: "chevron",
            onclick: () =>
              choose("Tema", THEMES, manualTheme || "auto", v => {
                manualTheme = v === "auto" ? null : v;
                lsSet("manualTheme", manualTheme);
                applyTheme();
              })
          }),
          row({
            icon: "person", hue: 330, title: "Seu nome", sub: settings.name || "Aparece na saudação da tela inicial", trail: "chevron",
            onclick: async () => {
              const n = await showDialog({
                title: "Seu nome",
                input: { value: settings.name, placeholder: "Como você quer ser chamado?" },
                confirmLabel: "Salvar"
              });
              if (n === null) return;
              settings.name = n;
              saveSettings();
              renderGreeting();
              refresh();
            }
          })
        ])
      );

      // cores
      const card = el("div", "sp-card");
      const swatches = el("div", "swatches");
      const hint = el("div", "set-hint", "");
      const btns = [];
      const paint = () => {
        btns.forEach(({ b, a }) => {
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
          paint();
          updateColor();
        };
        btns.push({ b, a });
        swatches.appendChild(b);
      });
      paint();
      card.append(swatches, hint);
      box.appendChild(group([card], "Cor do app"));

      box.appendChild(
        group([
          switchRowSP("Preto total", "Fundo preto puro (economiza bateria em tela AMOLED)", "amoled", 0, "dark_mode"),
          switchRowSP("Capa em disco", "A capa vira um disco que gira enquanto toca", "disc", 28, "music_note")
        ])
      );
      box.appendChild(
        group([
          row({ icon: "lyrics", hue: 215, title: "Fonte das letras", sub: fontName(), trail: "chevron", onclick: () => navigate("fonts") }),
          row({ icon: "palette", hue: 330, title: "Formas das bolinhas", sub: "Escolha o formato de cada bolinha da tela inicial", trail: "chevron", onclick: () => navigate("shapes") })
        ])
      );
    }
  };

  // ===== fontes =====
  views.fonts = {
    title: () => "Fonte das letras",
    build(box) {
      const rows = [];
      const add = (id, name, note, family, deletable) => {
        const check = el("span", "sp-check");
        if (settings.font === id) check.appendChild(el("span", "material-symbols-rounded", "check"));
        const r = row({ title: name, sub: note, trail: check, onclick: () => {
          settings.font = id;
          saveSettings();
          applyFont();
          refresh();
        } });
        r.querySelector("strong").style.fontFamily = family;
        if (deletable) {
          const del = el("span", "sp-del");
          del.setAttribute("role", "button");
          del.setAttribute("aria-label", "Apagar fonte");
          del.appendChild(el("span", "material-symbols-rounded", "delete"));
          del.onclick = async e => {
            e.stopPropagation();
            const ok = await showDialog({ title: "Apagar essa fonte?", text: "“" + name + "” será removida do app.", confirmLabel: "Apagar", danger: true });
            if (!ok) return;
            customFonts = customFonts.filter(f => f.id !== id);
            fontDbDelete(id);
            if (settings.font === id) {
              settings.font = "roboto";
              saveSettings();
              applyFont();
            }
            refresh();
          };
          r.insertBefore(del, check);
        }
        rows.push(r);
      };
      GOOGLE_FONTS.forEach(f => {
        ensureGoogleFont(f);
        add(f.id, f.name, f.note, f.id === "system" ? "system-ui" : '"' + f.family + '", system-ui, sans-serif', false);
      });
      customFonts.forEach(f => add(f.id, f.name, "Importada por você", '"' + f.family + '", system-ui, sans-serif', true));
      box.appendChild(group(rows));
      box.appendChild(
        group([row({ icon: "upload_file", hue: 175, title: "Importar fonte", sub: "Escolha um arquivo .ttf, .otf ou .woff2 do seu celular", trail: "chevron", onclick: () => $("fontInput").click() })])
      );
    }
  };

  // ===== formas =====
  views.shapes = {
    title: () => "Formas das bolinhas",
    build(box) {
      const rows = Object.keys(BUBBLES).map(id => {
        const cur = settings.shapes[id] || "default";
        const curName = (SHAPES.find(s => s.id === cur) || SHAPES[0]).name;
        const prev = el("span", "shape-prev mini shape-" + (cur !== "default" ? cur : DEFAULT_PREV[id]));
        return row({ title: BUBBLES[id], sub: curName, trail: prev, onclick: () => openShapePicker(id, true) });
      });
      box.appendChild(group(rows));
      box.appendChild(
        group([
          row({
            icon: "restart_alt", hue: 0, title: "Restaurar formas", sub: "Volta todas as bolinhas ao formato padrão",
            onclick: () => {
              settings.shapes = {};
              saveSettings();
              applyShapes();
              refresh();
            }
          })
        ])
      );
    }
  };

  // ===== reprodução =====
  views.play = {
    title: () => "Reprodução",
    build(box) {
      box.appendChild(
        group(
          [
            row({
              icon: "speed", hue: 140, title: "Velocidade", sub: settings.speed + "x" + (settings.speed === 1 ? " (normal)" : ""), trail: "chevron",
              onclick: () =>
                choose("Velocidade de reprodução", SPEEDS.map(v => ({ value: v, label: v + "x" + (v === 1 ? " (normal)" : "") })), settings.speed, v => {
                  settings.speed = v;
                  saveSettings();
                  applySpeed();
                })
            }),
            row({ icon: "timer", hue: 265, title: "Temporizador de sono", sub: sleepStatus() || "Desligado", trail: "chevron", onclick: () => openSleepSheet(refresh) })
          ],
          "Ouvir"
        )
      );
      box.appendChild(
        group(
          [
            switchRowSP("Retomar de onde parou", "Ao abrir o app, volta para a última música e o ponto em que estava", "resume", 175, "play_arrow"),
            switchRowSP("Transição suave (fade)", "Entra e sai com o volume subindo e descendo", "fade", 330, "volume_up", applyFadeSetting)
          ],
          "Ao tocar"
        )
      );
    }
  };

  // ===== comportamento =====
  views.behavior = {
    title: () => "Gestos e comportamento",
    build(box) {
      box.appendChild(
        group(
          [
            switchRowSP("Deslizar entre páginas", "Arraste para o lado para trocar de página", "swipe", 265, "touch_app"),
            switchRowSP("Inverter o gesto", "Troca a direção do arrastar entre as páginas", "swipeInvert", 265, "refresh")
          ],
          "Gestos"
        )
      );
      box.appendChild(
        group(
          [
            switchRowSP("Toque duplo para favoritar", "Dê dois toques na capa do player para favoritar a música", "dblFav", 0, "favorite"),
            switchRowSP("Vibrar ao tocar", "Uma vibração leve nos botões (se o aparelho permitir)", "haptics", 28, "touch_app", () => buzz(30)),
            switchRowSP("Manter a tela ligada", "Com o player aberto, a tela não apaga sozinha", "wake", 45, "light_mode", syncWake)
          ],
          "Player"
        )
      );
    }
  };

  // ===== equalizador =====
  const EQ_BANDS = [60, 230, 910, 3600, 14000];
  const EQ_LABELS = ["60 Hz", "230 Hz", "910 Hz", "3,6 kHz", "14 kHz"];
  const EQ_PRESETS = [
    { id: "flat", name: "Normal", g: [0, 0, 0, 0, 0] },
    { id: "bass", name: "Graves", g: [6, 4, 0, -1, -2] },
    { id: "treble", name: "Agudos", g: [-2, -1, 0, 4, 6] },
    { id: "vocal", name: "Vocal", g: [-2, 0, 4, 3, -1] },
    { id: "rock", name: "Rock", g: [5, 3, -1, 3, 5] },
    { id: "pop", name: "Pop", g: [-1, 2, 4, 2, -1] },
    { id: "electronic", name: "Eletrônica", g: [5, 3, 0, 2, 5] }
  ];
  const eqPresetName = () => (settings.eq.preset === "custom" ? "Personalizado" : (EQ_PRESETS.find(p => p.id === settings.eq.preset) || EQ_PRESETS[0]).name);

  let eqCtx = null;
  const eqFilters = [];
  window.MusicaEQ = { filters: eqFilters };

  function ensureEq() {
    if (eqCtx) return true;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      const ctx = new Ctx();
      const src = ctx.createMediaElementSource(audio);
      let prev = src;
      EQ_BANDS.forEach((f, i) => {
        const b = ctx.createBiquadFilter();
        b.type = i === 0 ? "lowshelf" : i === EQ_BANDS.length - 1 ? "highshelf" : "peaking";
        b.frequency.value = f;
        b.Q.value = 1;
        b.gain.value = 0;
        prev.connect(b);
        prev = b;
        eqFilters.push(b);
      });
      prev.connect(ctx.destination);
      eqCtx = ctx;
      window.MusicaEQ.ctx = ctx;
      return true;
    } catch (e) {
      eqCtx = null;
      return false;
    }
  }

  function applyEq() {
    const e = settings.eq;
    if (e.on && !ensureEq()) {
      e.on = false;
      saveSettings();
      showToast("Seu navegador não permite o equalizador");
      return;
    }
    if (!eqCtx) return;
    eqFilters.forEach((f, i) => (f.gain.value = e.on ? e.gains[i] || 0 : 0));
    if (e.on && eqCtx.state === "suspended") eqCtx.resume().catch(() => {});
  }

  views.eq = {
    title: () => "Equalizador",
    build(box) {
      const e = settings.eq;
      box.appendChild(
        group([
          (() => {
            const sw = el("span", "m3-switch" + (e.on ? " on" : ""));
            return row({
              icon: "equalizer", hue: 28, title: "Equalizador", sub: e.on ? "Ligado" : "Desligado", trail: sw,
              onclick: () => {
                e.on = !e.on;
                saveSettings();
                applyEq();
                refresh();
              }
            });
          })()
        ])
      );

      const chips = el("div", "sp-chips");
      EQ_PRESETS.forEach(p => {
        const c = el("button", "filter" + (e.preset === p.id ? " active" : ""));
        if (e.preset === p.id) c.appendChild(el("span", "material-symbols-rounded", "check"));
        c.appendChild(document.createTextNode(p.name));
        c.onclick = () => {
          e.preset = p.id;
          e.gains = p.g.slice();
          saveSettings();
          applyEq();
          refresh();
        };
        chips.appendChild(c);
      });
      box.appendChild(group([chips], "Predefinições"));

      const card = el("div", "sp-card sp-eq" + (e.on ? "" : " off"));
      EQ_BANDS.forEach((f, i) => {
        const line = el("label", "sp-eq-line");
        const lab = el("span", "sp-eq-f", EQ_LABELS[i]);
        const rng = el("input", "sp-eq-range");
        rng.type = "range";
        rng.min = -12;
        rng.max = 12;
        rng.step = 1;
        rng.value = e.gains[i] || 0;
        const val = el("span", "sp-eq-v", (e.gains[i] > 0 ? "+" : "") + (e.gains[i] || 0) + " dB");
        rng.oninput = () => {
          e.gains[i] = Number(rng.value);
          e.preset = "custom";
          val.textContent = (e.gains[i] > 0 ? "+" : "") + e.gains[i] + " dB";
          if (eqCtx && e.on) eqFilters[i].gain.value = e.gains[i];
        };
        rng.onchange = () => {
          saveSettings();
          chips.querySelectorAll(".filter").forEach(c => c.classList.remove("active"));
        };
        line.append(lab, rng, val);
        card.appendChild(line);
      });
      box.appendChild(group([card], "Bandas"));
      box.appendChild(
        group([
          row({
            icon: "info", hue: 200, title: "Observação",
            sub: "O equalizador usa o processamento de áudio do navegador. Em alguns aparelhos ele pode parar com a tela bloqueada — se acontecer, desligue-o."
          })
        ])
      );
    }
  };

  // ===== backup =====
  function buildBackup() {
    const keyOf = id => {
      const s = getSong(id);
      return s ? songKey(s) : null;
    };
    return {
      app: "musica",
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      manualTheme,
      mixMode,
      playlists: playlists.map(p => ({ id: p.id, name: p.name, keys: p.songIds.map(keyOf).filter(Boolean) })),
      songs: songs.map(s => ({
        key: songKey(s), name: s.name, artist: s.artist, favorite: !!s.favorite,
        playCount: s.playCount || 0, lastPlayed: s.lastPlayed || 0, lyrics: s.lyrics || ""
      }))
    };
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(buildBackup(), null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "musica-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1500);
    showToast("Backup salvo");
  }

  async function importBackup(file) {
    let data;
    try {
      data = JSON.parse(await file.text());
      if (!data || data.app !== "musica") throw new Error("x");
    } catch {
      showToast("Esse arquivo não é um backup da Música");
      return;
    }
    const ok = await showDialog({
      title: "Restaurar backup?",
      text: "Seus ajustes, playlists e favoritas atuais serão substituídos pelos do backup. As músicas em si não fazem parte do backup — elas precisam estar na biblioteca.",
      confirmLabel: "Restaurar"
    });
    if (!ok) return;

    const next = Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), data.settings || {});
    if (!next.shapes || typeof next.shapes !== "object") next.shapes = {};
    if (!next.eq || !Array.isArray(next.eq.gains)) next.eq = JSON.parse(JSON.stringify(DEFAULTS.eq));
    if (String(next.font).startsWith("custom-") && !customFonts.some(f => f.id === next.font)) next.font = "roboto";
    Object.keys(settings).forEach(k => delete settings[k]);
    Object.assign(settings, next);
    saveSettings();

    manualTheme = data.manualTheme === "light" || data.manualTheme === "dark" ? data.manualTheme : null;
    lsSet("manualTheme", manualTheme);
    if (data.mixMode === "plays" || data.mixMode === "recent") {
      mixMode = data.mixMode;
      lsSet("mixMode", mixMode);
      renderMixMode();
    }

    const byKey = new Map(songs.map(s => [songKey(s), s]));
    let matched = 0;
    (data.songs || []).forEach(m => {
      const s = byKey.get(m.key);
      if (!s) return;
      matched++;
      s.favorite = !!m.favorite;
      s.playCount = m.playCount || 0;
      s.lastPlayed = m.lastPlayed || 0;
      if (m.lyrics) s.lyrics = m.lyrics;
      if (m.name) s.name = m.name;
      if (m.artist) s.artist = m.artist;
      dbPut(toRecord(s));
    });

    playlists = (data.playlists || []).map(p => ({
      id: p.id || "p" + Date.now() + Math.random(),
      name: p.name || "Playlist",
      songIds: (p.keys || []).map(k => byKey.get(k)).filter(Boolean).map(s => s.id)
    }));
    savePlaylists();

    applyTheme();
    applySettings();
    applySpeed();
    applyEq();
    applyFadeSetting();
    syncWake();
    refreshAll();
    refresh();
    showToast("Backup restaurado (" + matched + (matched === 1 ? " música reconhecida)" : " músicas reconhecidas)"));
  }

  const backupInput = el("input");
  backupInput.type = "file";
  backupInput.accept = ".json,application/json";
  backupInput.hidden = true;
  backupInput.addEventListener("change", () => {
    const f = backupInput.files && backupInput.files[0];
    backupInput.value = "";
    if (f) importBackup(f);
  });
  document.body.appendChild(backupInput);

  views.backup = {
    title: () => "Backup e restauração",
    build(box) {
      box.appendChild(
        group([
          row({ icon: "file_download", hue: 175, title: "Salvar backup", sub: "Cria um arquivo com ajustes, playlists, favoritas, letras e contagem de plays", trail: "chevron", onclick: exportBackup }),
          row({ icon: "upload_file", hue: 215, title: "Restaurar backup", sub: "Escolha um arquivo de backup salvo antes", trail: "chevron", onclick: () => backupInput.click() })
        ])
      );
      box.appendChild(
        group([
          row({ icon: "info", hue: 200, title: "O que fica de fora", sub: "As músicas em si (arquivos de áudio) e as fontes importadas. Adicione as músicas de novo e depois restaure." })
        ])
      );
    }
  };

  // ===== sobre =====
  views.about = {
    title: () => "Sobre e diagnóstico",
    build(box) {
      const can = t => !!audio.canPlayType(t);
      const fmts = [
        ["MP3", 'audio/mpeg'], ["AAC / M4A", 'audio/mp4; codecs="mp4a.40.2"'], ["FLAC", "audio/flac"],
        ["OGG Vorbis", 'audio/ogg; codecs="vorbis"'], ["Opus", 'audio/ogg; codecs="opus"'], ["WAV", "audio/wav"]
      ];
      const ok = fmts.filter(f => can(f[1])).map(f => f[0]);
      const no = fmts.filter(f => !can(f[1])).map(f => f[0]);

      box.appendChild(
        group([
          row({ icon: "music_note", hue: 215, title: "Música " + APP_VERSION, sub: "App de música local feito por você, com tema Material 3" }),
          row({ icon: "library_music", hue: 140, title: "Formatos de áudio", sub: "Toca: " + (ok.join(", ") || "nenhum") + (no.length ? " · Não toca: " + no.join(", ") : "") })
        ])
      );

      const standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
      const yes = v => (v ? "Disponível" : "Indisponível");
      const notif = "Notification" in window ? { granted: "Permitidas", denied: "Bloqueadas", default: "Ainda não pedidas" }[Notification.permission] : "Indisponível";
      box.appendChild(
        group(
          [
            row({ icon: "notifications", hue: 0, title: "Notificações", sub: notif }),
            row({ icon: "play_arrow", hue: 140, title: "Controles na tela de bloqueio", sub: yes("mediaSession" in navigator) }),
            row({ icon: "light_mode", hue: 45, title: "Manter a tela ligada", sub: yes("wakeLock" in navigator) }),
            row({ icon: "equalizer", hue: 28, title: "Equalizador", sub: yes(!!(window.AudioContext || window.webkitAudioContext)) }),
            row({ icon: "check_circle", hue: 175, title: "Instalado como app", sub: standalone ? "Sim" : "Não, está rodando no navegador" })
          ],
          "Recursos deste aparelho"
        )
      );

      box.appendChild(
        group(
          [
            row({
              icon: "refresh", hue: 215, title: "Atualizar o app", sub: "Baixa a versão mais nova. Suas músicas e ajustes não são apagados.", trail: "chevron",
              onclick: async () => {
                showToast("Atualizando…");
                try {
                  if ("serviceWorker" in navigator) (await navigator.serviceWorker.getRegistrations()).forEach(r => r.unregister());
                  if (window.caches) (await caches.keys()).forEach(k => caches.delete(k));
                } catch {}
                setTimeout(() => location.reload(), 600);
              }
            }),
            row({ icon: "info", hue: 200, title: "Ver as boas-vindas de novo", sub: "Reabre o aviso de permissões", trail: "chevron", onclick: () => openPermissions(true) }),
            row({
              icon: "restart_alt", hue: 0, title: "Restaurar todos os ajustes", sub: "Volta tudo ao padrão (suas músicas continuam)", danger: true,
              onclick: async () => {
                const yes2 = await showDialog({ title: "Restaurar ajustes?", text: "Cores, tema, fonte, formas e todas as opções voltam ao padrão. Músicas e playlists não são mexidas.", confirmLabel: "Restaurar", danger: true });
                if (!yes2) return;
                Object.keys(settings).forEach(k => delete settings[k]);
                Object.assign(settings, JSON.parse(JSON.stringify(DEFAULTS)));
                saveSettings();
                manualTheme = null;
                lsSet("manualTheme", null);
                applyTheme();
                applySettings();
                applySpeed();
                applyEq();
                applyFadeSetting();
                syncWake();
                renderAll();
                refresh();
                showToast("Ajustes restaurados");
              }
            })
          ],
          "Manutenção"
        )
      );
    }
  };

  /* ---------- a página em si ---------- */
  const SP = { page: null, scroll: null, titleEl: null, barTitle: null, content: null, stack: [], open: false };

  function build() {
    const page = el("div", "settings-page");
    page.setAttribute("aria-hidden", "true");

    const bar = el("div", "sp-bar");
    const back = el("button", "sp-back");
    back.setAttribute("aria-label", "Voltar");
    back.appendChild(el("span", "material-symbols-rounded", "arrow_back"));
    back.onclick = goBack;
    const barTitle = el("span", "sp-bar-title", "Ajustes");
    bar.append(back, barTitle);

    const scroll = el("div", "sp-scroll");
    const titleEl = el("h1", "sp-title", "Ajustes");
    const content = el("div", "sp-content");
    scroll.append(titleEl, content);

    scroll.addEventListener("scroll", () => bar.classList.toggle("compact", scroll.scrollTop > 56), { passive: true });

    page.append(scroll, bar);
    document.body.appendChild(page);
    Object.assign(SP, { page, scroll, titleEl, barTitle, content });
  }

  const top = () => SP.stack[SP.stack.length - 1];

  function render(dir, keepScroll) {
    const v = views[top()];
    const y = SP.scroll.scrollTop;
    SP.titleEl.textContent = v.title();
    SP.barTitle.textContent = v.title();
    SP.content.replaceChildren();
    v.build(SP.content);
    if (dir) {
      [SP.titleEl, SP.content].forEach(n => {
        n.classList.remove("sp-in-fwd", "sp-in-back");
        void n.offsetWidth;
        n.classList.add(dir === "fwd" ? "sp-in-fwd" : "sp-in-back");
      });
    }
    SP.scroll.scrollTop = keepScroll ? y : 0;
    SP.page.querySelector(".sp-bar").classList.toggle("compact", SP.scroll.scrollTop > 56);
  }

  function refresh() {
    if (SP.open) render(null, true);
  }
  window.refreshSettingsPage = refresh;

  function navigate(view) {
    SP.stack.push(view);
    try { history.pushState({ sp: SP.stack.length }, ""); } catch {}
    render("fwd");
  }

  function closeNow() {
    SP.open = false;
    SP.stack = [];
    SP.page.classList.remove("open");
    SP.page.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  function goBack() {
    const depth = SP.stack.length;
    if (!depth) return;
    let handled = false;
    const onPop = () => (handled = true);
    window.addEventListener("popstate", onPop, { once: true });
    try { history.back(); } catch {}
    // plano B: se o histórico não respondeu, volta na mão
    setTimeout(() => {
      window.removeEventListener("popstate", onPop);
      if (!handled && SP.open && SP.stack.length === depth) {
        if (depth > 1) { SP.stack.pop(); render("back"); } else closeNow();
      }
    }, 350);
  }

  window.addEventListener("popstate", () => {
    if (!SP.open) return;
    const target = (history.state && history.state.sp) || 0;
    if (target === 0) return closeNow();
    while (SP.stack.length > target) SP.stack.pop();
    render("back");
  });

  window.openSettings = function (view) {
    closeSheet();
    if (!SP.page) build();
    if (SP.open) return;
    SP.open = true;
    SP.stack = ["main"];
    try { history.pushState({ sp: 1 }, ""); } catch {}
    render(null);
    if (view && view !== "main") navigate(view);
    document.body.classList.add("no-scroll");
    SP.page.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => SP.page.classList.add("open"));
  };

  /* ==========================================================
     Funções do app: velocidade, timer, retomar, fade, vibração...
     ========================================================== */
  // ----- velocidade -----
  function applySpeed() {
    const v = settings.speed || 1;
    audio.defaultPlaybackRate = v;
    audio.playbackRate = v;
  }
  ["loadstart", "playing"].forEach(ev => audio.addEventListener(ev, applySpeed));
  applySpeed();

  // ----- fade -----
  let rampTimer = null;
  function rampTo(target, ms) {
    clearInterval(rampTimer);
    const from = audio.volume;
    const t0 = performance.now();
    rampTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = from + (target - from) * k;
      if (k >= 1) clearInterval(rampTimer);
    }, 40);
  }
  function applyFadeSetting() {
    if (!settings.fade) {
      clearInterval(rampTimer);
      audio.volume = 1;
    }
  }
  audio.addEventListener("loadstart", () => {
    if (settings.fade) audio.volume = 0;
  });
  audio.addEventListener("playing", () => {
    if (settings.fade && audio.volume < 1) rampTo(1, 900);
  });
  audio.addEventListener("timeupdate", () => {
    if (!settings.fade || !isFinite(audio.duration) || audio.duration < 8) return;
    const rem = audio.duration - audio.currentTime;
    if (rem < 2.5 && rem > 0) {
      clearInterval(rampTimer);
      audio.volume = Math.max(0, rem / 2.5);
    }
  });

  // ----- temporizador de sono -----
  const sleep = { mode: null, end: 0, timer: null };
  function sleepStatus() {
    if (sleep.mode === "end") return "Para quando a música atual terminar";
    if (sleep.mode === "time") {
      const m = Math.max(1, Math.ceil((sleep.end - Date.now()) / 60000));
      return "Pausa em " + m + (m === 1 ? " minuto" : " minutos");
    }
    return "";
  }
  function clearSleep() {
    clearTimeout(sleep.timer);
    sleep.mode = null;
    sleep.end = 0;
  }
  function fireSleep() {
    clearSleep();
    if (settings.fade && !audio.paused) {
      rampTo(0, 1500);
      setTimeout(() => {
        audio.pause();
        audio.volume = 1;
      }, 1600);
    } else audio.pause();
    showToast("Temporizador: música pausada");
  }
  function setSleep(v) {
    clearSleep();
    if (v === "off") return showToast("Temporizador desligado");
    if (v === "end") {
      sleep.mode = "end";
      return showToast("Vai pausar quando esta música terminar");
    }
    sleep.mode = "time";
    sleep.end = Date.now() + v * 60000;
    sleep.timer = setTimeout(fireSleep, v * 60000);
    showToast("Vai pausar em " + v + " minutos");
  }
  window.openSleepSheet = function (after) {
    const opts = [
      { value: "off", label: "Desligado" },
      ...[10, 15, 30, 45, 60].map(m => ({ value: m, label: m + " minutos" })),
      { value: "end", label: "Quando a música terminar" }
    ];
    const cur = sleep.mode === "end" ? "end" : sleep.mode === "time" ? Math.round((sleep.end - Date.now()) / 60000) : "off";
    openSheet(
      "Temporizador de sono" + (sleepStatus() ? " — " + sleepStatus().toLowerCase() : ""),
      opts.map(o => ({
        label: o.label,
        icon: o.value === "off" ? (sleep.mode ? "close" : "check") : "timer",
        run: () => {
          setSleep(o.value);
          if (after) after();
        }
      }))
    );
  };
  // "ao fim da música": impede a próxima faixa de começar
  const origPickNext = window.pickNext;
  window.pickNext = function (auto) {
    if (auto && sleep.mode === "end") {
      clearSleep();
      showToast("Temporizador: música pausada");
      return null;
    }
    return origPickNext(auto);
  };

  // botão do temporizador no player completo
  (function addPlayerTimer() {
    const actions = document.querySelector(".fp-top-actions");
    if (!actions) return;
    const b = el("button", "icon-btn");
    b.id = "fpTimer";
    b.setAttribute("aria-label", "Temporizador de sono");
    b.appendChild(el("span", "material-symbols-rounded", "timer"));
    b.onclick = () => openSleepSheet();
    actions.insertBefore(b, actions.firstChild);
  })();

  // ----- retomar de onde parou -----
  let lastSave = 0;
  function saveLast(force) {
    const now = Date.now();
    if (!force && now - lastSave < 3000) return;
    lastSave = now;
    if (currentId === null || !settings.resume) return;
    lsSet("lastPlayback", { id: currentId, t: audio.currentTime || 0 });
  }
  audio.addEventListener("timeupdate", () => saveLast(false));
  audio.addEventListener("pause", () => saveLast(true));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) saveLast(true);
  });
  window.addEventListener("pagehide", () => saveLast(true));

  function restoreLast() {
    if (!settings.resume || currentId !== null) return;
    const last = lsGet("lastPlayback", null);
    if (!last) return;
    const song = getSong(last.id);
    if (!song) return;
    queue = allIds();
    currentId = song.id;
    audio.src = song.url;
    const t = last.t || 0;
    if (t > 1) {
      const seek = () => {
        try { audio.currentTime = t; } catch {}
      };
      audio.addEventListener("loadedmetadata", seek, { once: true });
    }
    onSongChanged();
  }
  window.onLibraryLoaded = restoreLast;
  if (window.__libLoaded) restoreLast();

  // ----- vibração -----
  function buzz(ms) {
    if (settings.haptics && navigator.vibrate) navigator.vibrate(ms || 8);
  }
  document.addEventListener(
    "click",
    e => {
      if (settings.haptics && e.target.closest && e.target.closest("button, .nav-item, .song-item")) buzz(8);
    },
    true
  );

  // ----- toque duplo na capa para favoritar -----
  (function dblTap() {
    const cover = $("fpCover");
    let lastT = 0, lastX = 0, lastY = 0;
    cover.addEventListener("click", e => {
      if (!settings.dblFav || lyricsView) return;
      const now = Date.now();
      const close = Math.abs(e.clientX - lastX) < 50 && Math.abs(e.clientY - lastY) < 50;
      if (now - lastT < 330 && close) {
        lastT = 0;
        const song = current();
        if (!song) return;
        if (!song.favorite) toggleFavorite(song);
        const h = el("div", "big-heart");
        h.appendChild(el("span", "material-symbols-rounded", "favorite"));
        $("fpStage").appendChild(h);
        buzz(18);
        setTimeout(() => h.remove(), 750);
      } else {
        lastT = now;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });
  })();

  // ----- tela sempre ligada -----
  let wakeLock = null;
  async function syncWake() {
    const want = !!(settings.wake && fpOpen && !document.hidden && "wakeLock" in navigator);
    try {
      if (want && !wakeLock) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => (wakeLock = null));
      } else if (!want && wakeLock) {
        const l = wakeLock;
        wakeLock = null;
        await l.release();
      }
    } catch {
      wakeLock = null;
    }
  }
  window.syncWake = syncWake;
  setInterval(syncWake, 2000);
  document.addEventListener("visibilitychange", syncWake);

  // ----- equalizador: liga ao tocar -----
  audio.addEventListener("play", () => {
    if (settings.eq.on) applyEq();
    else if (eqCtx) applyEq();
  });

  applyFadeSetting();
})();
