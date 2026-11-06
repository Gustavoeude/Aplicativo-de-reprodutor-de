"use strict";

/* Assistente de primeira configuração do Nyx. Cada etapa aciona a função real correspondente. */
(function () {
  const KEY = "nyxSetupCompleted";
  const steps = [
    { title: "Bem-vindo ao Nyx", desc: "Vamos preparar sua biblioteca e deixar o aplicativo pronto para ouvir música.", icon: "🌙" },
    { title: "Adicionar músicas", desc: "Escolha uma pasta ou selecione arquivos. O Android só concede acesso ao que você escolher.", icon: "🎵" },
    { title: "Notificações", desc: "Ative as notificações para acompanhar a reprodução quando o Android solicitar essa permissão.", icon: "🔔" },
    { title: "Pastas ignoradas", desc: "Escolha pastas que o Nyx deve ignorar quando procurar músicas em diretórios monitorados.", icon: "📁" },
    { title: "Navegação", desc: "Escolha se deseja manter os gestos de deslizar entre Início, Buscar e Biblioteca.", icon: "✦" },
    { title: "Bateria", desc: "As restrições de bateria podem limitar a reprodução em segundo plano. Você pode revisar as opções do Android.", icon: "🔋" }
  ];
  let root, step = 0;

  function button(label, cls, fn) {
    const b = document.createElement("button");
    b.type = "button"; b.className = cls; b.textContent = label;
    b.addEventListener("click", fn);
    return b;
  }
  function finish() {
    lsSet(KEY, true);
    if (root) root.remove();
    showToast("Configuração concluída. Aproveite o Nyx!");
  }
  function render() {
    if (!root) return;
    const item = steps[step];
    root.querySelector(".nyx-setup-step").textContent = "ETAPA " + (step + 1) + " DE " + steps.length;
    root.querySelector(".nyx-setup-progress i").style.width = ((step + 1) / steps.length * 100) + "%";
    root.querySelector(".nyx-setup-icon").textContent = item.icon;
    root.querySelector("h1").textContent = item.title;
    root.querySelector(".nyx-setup-desc").textContent = item.desc;
    const actions = root.querySelector(".nyx-setup-actions");
    actions.replaceChildren();

    if (step === 1) {
      actions.append(
        button("Escolher pasta de músicas", "nyx-setup-primary", () => { importFolder(); }),
        button("Selecionar arquivos", "nyx-setup-secondary", () => { openFilePicker(); })
      );
    } else if (step === 2) {
      actions.append(button("Solicitar notificações", "nyx-setup-primary", async () => {
        try {
          if (MN && typeof MN.requestNotifications === "function") {
            const result = await MN.requestNotifications();
            showToast(result && result.granted ? "Permissão de notificações concedida." : "Permissão não concedida. Você pode ativá-la depois nos Ajustes do Android.");
          } else showToast("A permissão de notificações só é solicitada na versão Android.");
        } catch (e) { logErr("setup:notifications", e); showToast("Não foi possível solicitar a permissão."); }
        next();
      }));
      actions.append(button("Agora não", "nyx-setup-text", next));
    } else if (step === 3) {
      actions.append(button("Escolher pasta para ignorar", "nyx-setup-primary", async () => {
        const ok = await addDirectory("ignored");
        if (ok) showToast("Pasta adicionada à lista de ignorados.");
        render();
      }));
      const ignored = typeof getIgnoredFolders === "function" ? getIgnoredFolders() : [];
      const list = document.createElement("p");
      list.className = "nyx-setup-note";
      list.textContent = ignored.length ? "Pastas ignoradas: " + ignored.map(x => x.name).join(", ") : "Nenhuma pasta ignorada ainda.";
      actions.append(list);
    } else if (step === 4) {
      actions.append(
        button("Manter gestos de deslizar: " + (settings.swipe ? "ativados" : "desativados"), "nyx-setup-primary", () => {
          settings.swipe = !settings.swipe; saveSettings(); render();
        }),
        button("Continuar com essa escolha", "nyx-setup-secondary", next)
      );
    } else if (step === 5) {
      actions.append(button("Abrir configurações de bateria", "nyx-setup-primary", async () => {
        try {
          if (MN && typeof MN.openBatterySettings === "function") await MN.openBatterySettings();
          else showToast("Essa opção está disponível na versão Android.");
        } catch (e) { logErr("setup:battery", e); showToast("Não foi possível abrir as configurações de bateria."); }
      }));
    }

    if (step !== 0) actions.append(button("Voltar", "nyx-setup-text", () => { step--; render(); }));
    if (step === 0) actions.append(button("Começar", "nyx-setup-primary", next));
    else if (step === 1 || step === 3 || step === 5) actions.append(button("Pular esta etapa", "nyx-setup-text", next));
    if (step === steps.length - 1) actions.append(button("Concluir", "nyx-setup-primary", finish));
  }
  function next() { if (step < steps.length - 1) { step++; render(); } else finish(); }

  function start() {
    if (lsGet(KEY, false) || root) return;
    root = document.createElement("section");
    root.className = "nyx-setup";
    root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    root.innerHTML = '<div class="nyx-setup-card"><div class="nyx-setup-brand">NYX <span>✦</span></div><div class="nyx-setup-step"></div><div class="nyx-setup-progress"><i></i></div><div class="nyx-setup-icon"></div><h1></h1><p class="nyx-setup-desc"></p><div class="nyx-setup-actions"></div></div>';
    document.body.appendChild(root);
    render();
  }
  window.startNyxSetup = () => { lsSet(KEY, false); step=0; if (root) root.remove(); root=null; start(); };
  window.maybeAskPermissionsFirstRun = start;
  if (!document.getElementById("nyx-setup-style")) {
    const style = document.createElement("style"); style.id="nyx-setup-style";
    style.textContent = `
      .nyx-setup{position:fixed;inset:0;z-index:200;background:var(--md-surface);display:grid;place-items:center;padding:24px;overflow:auto}
      .nyx-setup-card{width:min(100%,440px);padding:28px 22px;border-radius:30px;background:var(--md-surface-container);border:1px solid var(--md-outline-variant);box-shadow:0 24px 80px #0008}
      .nyx-setup-brand{font-weight:900;letter-spacing:.22em;color:var(--md-on-surface);font-size:18px}.nyx-setup-brand span{color:var(--md-primary)}
      .nyx-setup-step{margin-top:34px;font-size:11px;letter-spacing:.16em;color:var(--md-on-surface-variant)}
      .nyx-setup-progress{height:5px;background:var(--md-surface-container-highest);border-radius:9px;margin:12px 0 34px;overflow:hidden}.nyx-setup-progress i{display:block;height:100%;width:16%;background:var(--md-primary);border-radius:9px;transition:width .25s}
      .nyx-setup-icon{font-size:42px;margin-bottom:18px}.nyx-setup-card h1{font-size:27px;line-height:1.15;margin:0 0 12px;color:var(--md-on-surface)}.nyx-setup-desc,.nyx-setup-note{font-size:14px;line-height:1.55;color:var(--md-on-surface-variant)}
      .nyx-setup-actions{display:grid;gap:10px;margin-top:28px}.nyx-setup-actions button{min-height:48px;padding:12px 18px;border:0;border-radius:18px;font:inherit;font-size:14px;font-weight:600}
      .nyx-setup-primary{background:var(--md-primary);color:var(--md-on-primary)}.nyx-setup-secondary{background:var(--md-secondary-container);color:var(--md-on-secondary-container)}.nyx-setup-text{background:transparent;color:var(--md-primary)}
    `;
    document.head.appendChild(style);
  }
})();