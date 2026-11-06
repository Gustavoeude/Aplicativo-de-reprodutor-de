"use strict";

/* Assistente de primeira configuração do Nyx — layout individual baseado na referência aprovada. */
(function () {
  const KEY = "nyxSetupCompleted";
  const steps = [
    { title: "Bem-vindo\nao Nyx", desc: "Vamos deixar tudo pronto para\nvocê.", icon: "music_note" },
    { title: "Permissão\nde mídia", desc: "O Nyx precisa acessar seus áudios\npara montar a biblioteca.", icon: "library_music" },
    { title: "Notificações", desc: "Controle a música pela tela de\nbloqueio e pela barra de\nnotificações.", icon: "notifications" },
    { title: "Pastas\nexcluídas", desc: "Toque para ignorar uma pasta na\nbusca.", icon: "folder" },
    { title: "Navegação", desc: "Escolha o estilo da barra inferior.", icon: "navigation" },
    { title: "Bateria", desc: "Alguns aparelhos encerram apps\nem segundo plano. Revise a\notimização de bateria.", icon: "battery_saver" }
  ];
  let root = null, step = 0;

  const $ = (selector) => root && root.querySelector(selector);
  function make(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(label, cls, fn) {
    const b = make("button", cls, label);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }
  function icon(name) {
    const el = make("span", "material-symbols-rounded", name);
    el.setAttribute("aria-hidden", "true");
    return el;
  }
  function hideForPicker() {
    if (root) root.style.visibility = "hidden";
  }
  function showAfterPicker() {
    if (root) root.style.visibility = "visible";
    render();
  }
  function progress() {
    const holder = $(".nyx-setup-progress");
    holder.replaceChildren();
    steps.forEach((_, i) => {
      const dot = make("i", i <= step ? "active" : "");
      holder.appendChild(dot);
    });
  }
  function illustration(name) {
    const wrap = make("div", "nyx-setup-illustration " + name);
    const back = make("div", "nyx-setup-blob");
    const tile = make("div", "nyx-setup-tile");
    tile.appendChild(icon(name === "welcome" ? "music_note" : name === "media" ? "library_music" : name === "notifications" ? "notifications" : name === "folders" ? "folder" : name === "navigation" ? "widgets" : "battery_saver"));
    wrap.append(back, tile);
    const sparkle1 = make("span", "nyx-setup-sparkle", "✦");
    const sparkle2 = make("span", "nyx-setup-sparkle small", "✦");
    wrap.append(sparkle1, sparkle2);
    return wrap;
  }
  function folderList() {
    const list = make("div", "nyx-setup-folder-list");
    const folders = typeof getIgnoredFolders === "function" ? getIgnoredFolders() : [];
    if (!folders.length) {
      list.appendChild(make("p", "nyx-setup-empty", "Nenhuma pasta excluída ainda."));
      return list;
    }
    folders.forEach(folder => {
      const row = make("button", "nyx-setup-folder");
      row.type = "button";
      row.append(icon("folder"), make("span", "", folder.name || "Pasta"));
      row.appendChild(icon("check_box"));
      row.addEventListener("click", async () => {
        await removeDirectory("ignored", folder.uri);
        render();
      });
      list.appendChild(row);
    });
    return list;
  }
  function render() {
    if (!root) return;
    const item = steps[step];
    $(".nyx-setup-step-title").textContent = item.title;
    $(".nyx-setup-desc").textContent = item.desc;
    $(".nyx-setup-step-count").textContent = (step + 1) + " / " + steps.length;
    progress();

    const art = $(".nyx-setup-art");
    art.replaceChildren(illustration(["welcome","media","notifications","folders","navigation","battery"][step]));
    const actions = $(".nyx-setup-actions");
    actions.replaceChildren();

    if (step === 0) {
      actions.appendChild(button("Vamos lá!", "nyx-setup-primary", next));
    } else if (step === 1) {
      actions.appendChild(button("Permitir acesso", "nyx-setup-primary", async () => {
        hideForPicker();
        try {
          const ok = await addDirectory("watched");
          if (!ok) showToast("Você pode conceder acesso escolhendo uma pasta de músicas.");
        } catch (e) {
          logErr("setup:media", e);
          showToast("Não foi possível acessar essa pasta.");
        }
        showAfterPicker();
      }));
      actions.appendChild(button("Selecionar arquivos", "nyx-setup-secondary", () => {
        hideForPicker();
        try { openFilePicker(); } catch (e) { logErr("setup:files", e); }
        showAfterPicker();
      }));
    } else if (step === 2) {
      actions.appendChild(button("Ativar notificações", "nyx-setup-primary", async () => {
        try {
          if (typeof MN !== "undefined" && MN.requestNotifications) {
            const result = await MN.requestNotifications();
            showToast(result && result.granted ? "Notificações ativadas." : "Permissão não concedida. Você pode ativá-la depois.");
          } else showToast("Disponível na versão Android.");
        } catch (e) {
          logErr("setup:notifications", e);
          showToast("Não foi possível solicitar a permissão.");
        }
        next();
      }));
    } else if (step === 3) {
      actions.appendChild(folderList());
      actions.appendChild(button("＋  Adicionar pasta", "nyx-setup-primary", async () => {
        hideForPicker();
        try { await addDirectory("ignored"); }
        catch (e) { logErr("setup:ignored", e); }
        showAfterPicker();
      }));
    } else if (step === 4) {
      const preview = make("div", "nyx-setup-nav-preview");
      preview.append(make("div", "nyx-setup-nav-lines"));
      const nav = make("div", "nyx-setup-nav-bar");
      ["home","search","library_music","more_horiz"].forEach((name, i) => {
        const item = make("span", i === 0 ? "selected" : "");
        item.appendChild(icon(name));
        nav.appendChild(item);
      });
      preview.appendChild(nav);
      actions.appendChild(preview);
      const swipe = !!(typeof settings !== "undefined" && settings.swipe);
      actions.appendChild(button("Estilo padrão\n" + (swipe ? "Gestos ativados" : "Pílula flutuante"), "nyx-setup-choice", () => {
        settings.swipe = !settings.swipe;
        saveSettings();
        render();
      }));
      actions.appendChild(button("Continuar com essa escolha", "nyx-setup-primary", next));
    } else if (step === 5) {
      actions.appendChild(button("Desativar otimização", "nyx-setup-primary", async () => {
        try {
          if (typeof MN !== "undefined" && MN.openBatterySettings) await MN.openBatterySettings();
          else showToast("Abra as configurações de bateria do Android.");
        } catch (e) {
          logErr("setup:battery", e);
          showToast("Não foi possível abrir as configurações.");
        }
      }));
    }

    const footer = $(".nyx-setup-footer");
    footer.replaceChildren();
    if (step > 0) footer.appendChild(button("Voltar", "nyx-setup-text", () => { step--; render(); }));
    if (step > 0 && step !== 4) footer.appendChild(button("Pular", "nyx-setup-text", next));
    if (step === 5) footer.appendChild(button("Concluir", "nyx-setup-primary", finish));
  }
  function next() {
    if (step < steps.length - 1) { step++; render(); }
    else finish();
  }
  function finish() {
    lsSet(KEY, true);
    if (root) root.remove();
    root = null;
    showToast("Configuração concluída. Aproveite o Nyx!");
  }
  function start(force) {
    if (!force && lsGet(KEY, false)) return;
    if (root) root.remove();
    step = 0;
    root = make("section", "nyx-setup");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.innerHTML = '<div class="nyx-setup-card"><div class="nyx-setup-top"><span class="nyx-setup-brand">Nyx</span><span class="nyx-setup-step-count"></span></div><div class="nyx-setup-progress"></div><div class="nyx-setup-content"><div class="nyx-setup-art"></div><h1 class="nyx-setup-step-title"></h1><p class="nyx-setup-desc"></p><div class="nyx-setup-actions"></div><div class="nyx-setup-footer"></div></div></div>';
    document.body.appendChild(root);
    render();
  }
  window.startNyxSetup = () => { lsSet(KEY, false); start(true); };
  window.maybeAskPermissionsFirstRun = () => start(false);

  if (!document.getElementById("nyx-setup-style")) {
    const style = make("style");
    style.id = "nyx-setup-style";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
      .nyx-setup{position:fixed;inset:0;z-index:9999;background:#0b0b0d;color:#f4f2f6;display:grid;place-items:center;padding:22px 24px calc(22px + env(safe-area-inset-bottom));overflow:auto;font-family:Roboto,system-ui,sans-serif}
      .nyx-setup-card{width:min(100%,390px);min-height:min(690px,calc(100dvh - 44px));border:1px solid #29282e;border-radius:27px;background:#0d0d10;padding:22px 18px 18px;display:flex;flex-direction:column;box-shadow:0 16px 45px #0008}
      .nyx-setup-top{display:flex;justify-content:space-between;align-items:center}
      .nyx-setup-brand{font-size:20px;font-weight:800;letter-spacing:.12em}.nyx-setup-step-count{font-size:11px;color:#8c8994}
      .nyx-setup-progress{display:flex;gap:5px;margin:20px 0 14px}
      .nyx-setup-progress i{height:5px;flex:1;border-radius:8px;background:#292830}.nyx-setup-progress i.active{background:#f0eef4}
      .nyx-setup-content{flex:1;display:flex;flex-direction:column;align-items:stretch;text-align:center;justify-content:center}
      .nyx-setup-art{height:230px;display:grid;place-items:center;margin:0 0 16px}
      .nyx-setup-illustration{position:relative;width:190px;height:175px;display:grid;place-items:center}
      .nyx-setup-blob{position:absolute;width:140px;height:125px;border-radius:30px;background:#24232a;transform:rotate(12deg)}
      .nyx-setup-tile{position:relative;width:92px;height:92px;border-radius:27px;border:1.5px solid #aaa7b3;background:#302f37;display:grid;place-items:center;box-shadow:0 8px 24px #0008;transform:rotate(-6deg)}
      .nyx-setup-tile .material-symbols-rounded{font-size:42px;color:#f4f2f6}
      .nyx-setup-sparkle{position:absolute;left:14px;top:28px;color:#777482;font-size:22px}.nyx-setup-sparkle.small{left:auto;right:10px;top:auto;bottom:25px;font-size:13px}
      .nyx-setup-step-title{white-space:pre-line;font-family:'Press Start 2P',monospace;font-size:clamp(15px,4.3vw,19px);line-height:1.65;font-weight:400;margin:0 0 13px;letter-spacing:-.04em}
      .nyx-setup-desc{white-space:pre-line;color:#aaa7b1;font-size:13px;line-height:1.55;min-height:58px;margin:0 auto 24px;max-width:280px}
      .nyx-setup-actions{display:grid;gap:10px;width:100%}
      .nyx-setup-actions button,.nyx-setup-footer button{font-family:inherit;font-size:13px;font-weight:600;border:0;min-height:48px;border-radius:24px;padding:12px 18px}
      .nyx-setup-primary{background:#f0eef4;color:#27252d}
      .nyx-setup-secondary{background:#222127;color:#f0eef4;border:1px solid #34323b!important}
      .nyx-setup-choice{white-space:pre-line;text-align:left;background:#1d1c22;color:#f0eef4;border:1px solid #393741!important;border-radius:16px!important}
      .nyx-setup-footer{display:flex;justify-content:center;gap:18px;align-items:center;margin-top:12px;min-height:28px}
      .nyx-setup-text{background:transparent;color:#aaa7b1;min-height:30px!important;padding:5px 12px!important}
      .nyx-setup-folder-list{display:grid;gap:7px;margin:0 0 8px;max-height:190px;overflow:auto}
      .nyx-setup-folder{display:flex;align-items:center;gap:12px;text-align:left;background:#19181e;color:#eee;border:1px solid #302e37!important;border-radius:14px!important;min-height:44px!important;padding:8px 12px!important}
      .nyx-setup-folder span:nth-child(2){flex:1;font-size:12px}.nyx-setup-folder .material-symbols-rounded{font-size:19px;color:#aaa7b1}
      .nyx-setup-empty{font-size:12px;color:#aaa7b1;margin:8px}
      .nyx-setup-nav-preview{height:180px;border-radius:20px;background:#19181e;padding:16px;margin:0 0 18px;display:flex;flex-direction:column;justify-content:space-between}
      .nyx-setup-nav-lines{height:38px;border-radius:8px;background:linear-gradient(#393740 0 5px,transparent 5px 13px,#302e36 13px 18px,transparent 18px)}
      .nyx-setup-nav-bar{display:flex;justify-content:space-around;align-items:center;background:#111015;border:1px solid #514e59;border-radius:30px;padding:9px 4px}
      .nyx-setup-nav-bar span{display:grid;place-items:center;color:#aaa7b1;width:36px;height:30px}.nyx-setup-nav-bar span.selected{background:#34323b;border-radius:18px;color:#fff}
      .nyx-setup-nav-bar .material-symbols-rounded{font-size:18px}
      @media(max-height:700px){.nyx-setup-card{min-height:0}.nyx-setup-art{height:160px}.nyx-setup-illustration{transform:scale(.8)}.nyx-setup-desc{margin-bottom:14px}}
    `;
    document.head.appendChild(style);
  }
})();
