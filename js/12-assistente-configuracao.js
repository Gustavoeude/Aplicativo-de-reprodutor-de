"use strict";

/* ==========================================================
   Assistente de configuração inicial Nyx
   ========================================================== */
const CONFIG_ASSISTANT_DONE_KEY = "nyxConfigAssistantCompleted";
let configAssistantOverlay = null;
let configAssistantKeyHandler = null;

applyNavigationStyle(settings.navigationStyle);

function buildNavigationStyleOptions() {
  const group = el("div", "navigation-style-options");
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", "Estilo da navegação");
  const choices = [
    { id: "floating", title: "Expressiva", description: "Botões flutuantes", icon: "library_music" },
    { id: "bar", title: "Barra", description: "Navegação tradicional", icon: "storage" }
  ];
  choices.forEach(choice => {
    const button = el("button", "navigation-style-choice");
    button.type = "button";
    button.setAttribute("role", "radio");
    const selected = (settings.navigationStyle || "floating") === choice.id;
    button.setAttribute("aria-checked", String(selected));
    button.classList.toggle("selected", selected);
    const icon = el("span", "material-symbols-rounded navigation-style-icon", choice.icon);
    const title = el("strong", "", choice.title);
    const description = el("small", "", choice.description);
    const check = el("span", "material-symbols-rounded navigation-style-check", selected ? "check_circle" : "add");
    button.append(icon, title, description, check);
    button.onclick = () => {
      settings.navigationStyle = choice.id;
      applyNavigationStyle(choice.id);
      saveSettings();
      group.querySelectorAll(".navigation-style-choice").forEach((node, index) => {
        const on = choices[index].id === choice.id;
        node.classList.toggle("selected", on);
        node.setAttribute("aria-checked", String(on));
        const indicator = node.querySelector(".navigation-style-check");
        if (indicator) setIcon(indicator, on ? "check_circle" : "add");
      });
    };
    group.appendChild(button);
  });
  return group;
}

function configurationAssistantStepContent(step) {
  const content = el("div", "onboarding-content");
  const iconNames = ["music_note", "folder", "notifications", "speaker_notes_off", "settings", "storage"];
  const illustration = el("div", "onboarding-illustration");
  illustration.appendChild(el("span", "material-symbols-rounded", iconNames[step] || "music_note"));
  content.appendChild(illustration);

  const title = el("h1", "onboarding-title", [
    "Seu Nyx, do seu jeito",
    "Dê acesso à sua música",
    "Notificações de reprodução",
    "Ignore pastas específicas",
    "Escolha sua navegação",
    "Reprodução em segundo plano"
  ][step]);
  content.appendChild(title);

  if (step === 0) {
    content.appendChild(el("p", "onboarding-description", "Vamos deixar o app pronto para sua biblioteca e suas preferências. Você pode pular qualquer etapa e mudar as escolhas depois nos Ajustes."));
    const note = el("div", "onboarding-note");
    note.append(el("span", "material-symbols-rounded", "check_circle"), el("span", "", "Suas músicas ficam no dispositivo. O Nyx só acessa arquivos e pastas que você escolher."));
    content.appendChild(note);
  }

  if (step === 1) {
    content.appendChild(el("p", "onboarding-description", "Escolha uma pasta para o Nyx procurar músicas novas. No Android, a seleção segura do sistema guarda o acesso à pasta sem pedir acesso amplo ao armazenamento."));
    if (typeof getWatchedFolders === "function" && getWatchedFolders().length) {
      const list = el("div", "onboarding-folder-list");
      getWatchedFolders().forEach(folder => list.appendChild(el("div", "onboarding-folder-chip", folder.name)));
      content.appendChild(list);
    }
    const choose = el("button", "onboarding-action secondary");
    choose.type = "button";
    choose.append(el("span", "material-symbols-rounded", "folder"), el("span", "", MN && typeof addDirectory === "function" ? "Escolher pasta de músicas" : "Selecionar arquivos de música"));
    choose.onclick = async () => {
      if (MN && typeof addDirectory === "function") {
        choose.disabled = true;
        await addDirectory("watched");
        if (configAssistantOverlay) renderConfigurationAssistant();
      } else {
        if (typeof openFilePicker === "function") openFilePicker();
      }
    };
    content.appendChild(choose);
    content.appendChild(el("p", "onboarding-caption", "Você também pode adicionar ou remover pastas em Ajustes › Biblioteca."));
  }

  if (step === 2) {
    const isAndroid = !!(MN && typeof MN.requestNotifications === "function");
    content.appendChild(el("p", "onboarding-description", isAndroid
      ? "No Android 13 ou mais recente, a permissão permite exibir os controles e a notificação de mídia. Ela é opcional e você pode continuar sem concedê-la."
      : "No navegador, os controles de mídia dependem do suporte do próprio navegador. Não é necessário conceder uma permissão de notificação ao Nyx."));
    if (isAndroid) {
      const status = el("p", "onboarding-status", "A permissão só será solicitada quando você tocar no botão abaixo.");
      const request = el("button", "onboarding-action secondary");
      request.type = "button";
      request.append(el("span", "material-symbols-rounded", "notifications"), el("span", "", "Permitir notificações"));
      request.onclick = async () => {
        request.disabled = true;
        try {
          const result = await MN.requestNotifications();
          status.textContent = result && result.granted
            ? "Permissão concedida. Os controles de reprodução poderão aparecer na notificação."
            : "Permissão não concedida. Tudo bem: você ainda pode ouvir música e continuar.";
        } catch (error) {
          logErr("onboarding:notifications", error);
          status.textContent = "Não foi possível solicitar agora. Você pode revisar isso nas configurações do Android.";
        } finally {
          request.disabled = false;
        }
      };
      content.append(request, status);
    } else {
      content.appendChild(el("div", "onboarding-note", "As telas bloqueadas e os controles de mídia usam os recursos do navegador; esta etapa não solicita permissões."));
    }
  }

  if (step === 3) {
    const isAndroid = !!(MN && typeof addDirectory === "function");
    content.appendChild(el("p", "onboarding-description", isAndroid
      ? "Se uma pasta dentro da sua biblioteca tiver arquivos que não devem ser importados, adicione-a à lista de ignorados. O conteúdo já importado não será apagado."
      : "A lista de pastas ignoradas está disponível no app Android em Ajustes › Biblioteca."));
    if (isAndroid) {
      const ignored = typeof getIgnoredFolders === "function" ? getIgnoredFolders() : [];
      if (ignored.length) {
        const list = el("div", "onboarding-folder-list");
        ignored.forEach(folder => {
          const row = el("div", "onboarding-folder-row");
          row.appendChild(el("span", "material-symbols-rounded", "folder"));
          row.appendChild(el("span", "", folder.name));
          const remove = el("button", "onboarding-remove", "Remover");
          remove.type = "button";
          remove.onclick = async () => {
            await removeDirectory("ignored", folder.uri);
            if (configAssistantOverlay) renderConfigurationAssistant();
          };
          row.appendChild(remove);
          list.appendChild(row);
        });
        content.appendChild(list);
      } else {
        content.appendChild(el("div", "onboarding-empty", "Nenhuma pasta está sendo ignorada."));
      }
      const add = el("button", "onboarding-action secondary");
      add.type = "button";
      add.append(el("span", "material-symbols-rounded", "folder"), el("span", "", "Adicionar pasta ignorada"));
      add.onclick = async () => {
        add.disabled = true;
        await addDirectory("ignored");
        if (configAssistantOverlay) renderConfigurationAssistant();
      };
      content.appendChild(add);
      content.appendChild(el("p", "onboarding-caption", "Escolha uma subpasta pertencente a um dos diretórios monitorados."));
    }
  }

  if (step === 4) {
    content.appendChild(el("p", "onboarding-description", "Escolha como quer acessar Início, Busca e Biblioteca. Você pode alterar esta preferência depois nos Ajustes."));
    content.appendChild(buildNavigationStyleOptions());
  }

  if (step === 5) {
    const isAndroid = !!(MN && typeof MN.openBatterySettings === "function");
    content.appendChild(el("p", "onboarding-description", isAndroid
      ? "Alguns fabricantes limitam apps em segundo plano. Se a reprodução for interrompida, você pode revisar as opções de bateria do Nyx no Android."
      : "Se estiver usando um Android, as opções de bateria ficam nas configurações do sistema. Esta etapa é opcional."));
    if (isAndroid) {
      const open = el("button", "onboarding-action secondary");
      open.type = "button";
      open.append(el("span", "material-symbols-rounded", "storage"), el("span", "", "Abrir informações do app"));
      open.onclick = async () => {
        try {
          await MN.openBatterySettings();
        } catch (error) {
          logErr("onboarding:battery-settings", error);
          showToast("Não foi possível abrir as opções de bateria.");
        }
      };
      content.append(open, el("p", "onboarding-caption", "Nas informações do app, abra Bateria para revisar o uso em segundo plano. O Nyx não muda essas opções automaticamente."));
    } else {
      content.appendChild(el("div", "onboarding-note", "O assistente não altera configurações do dispositivo. Você pode concluir agora."));
    }
  }
  return content;
}

function renderConfigurationAssistant() {
  if (!configAssistantOverlay) return;
  const savedState = lsGet("nyxConfigAssistant", { step: 0 });
  const state = savedState && typeof savedState === "object" ? savedState : { step: 0 };
  const step = Math.max(0, Math.min(5, Number(state.step) || 0));
  state.step = step;
  lsSet("nyxConfigAssistant", state);
  const panel = configAssistantOverlay.querySelector(".configuration-assistant");
  panel.replaceChildren();

  const header = el("div", "onboarding-header");
  const label = el("div", "onboarding-label", "CONFIGURAÇÃO INICIAL");
  const close = el("button", "onboarding-close");
  close.type = "button";
  close.setAttribute("aria-label", "Fechar e continuar depois");
  close.appendChild(el("span", "material-symbols-rounded", "close"));
  close.onclick = closeConfigurationAssistant;
  header.append(label, close);

  const progress = el("div", "onboarding-progress");
  progress.setAttribute("aria-label", "Etapa " + (step + 1) + " de 6");
  for (let i = 0; i < 6; i++) {
    const segment = el("span", "onboarding-progress-segment" + (i <= step ? " active" : ""));
    segment.setAttribute("aria-hidden", "true");
    progress.appendChild(segment);
  }

  const body = configurationAssistantStepContent(step);
  const footer = el("div", "onboarding-footer");
  const skip = el("button", "onboarding-skip", step === 5 ? "Pular etapa" : "Pular configuração");
  skip.type = "button";
  skip.onclick = step === 5 ? advanceConfigurationAssistant : finishConfigurationAssistant;
  const nav = el("div", "onboarding-navigation");
  if (step > 0) {
    const back = el("button", "onboarding-back", "Voltar");
    back.type = "button";
    back.onclick = () => setConfigurationAssistantStep(step - 1);
    nav.appendChild(back);
  }
  const next = el("button", "onboarding-next", step === 5 ? "Concluir" : step === 0 ? "Começar" : "Continuar");
  next.type = "button";
  next.onclick = step === 5 ? finishConfigurationAssistant : advanceConfigurationAssistant;
  nav.appendChild(next);
  footer.append(skip, nav);
  panel.append(header, progress, body, footer);
  panel.setAttribute("aria-labelledby", "configuration-assistant-title");
  const title = panel.querySelector(".onboarding-title");
  title.id = "configuration-assistant-title";
  if (title && !panel.dataset.focusedOnce) {
    panel.dataset.focusedOnce = "true";
    panel.focus();
  } else if (title) {
    next.focus();
  }
}

function setConfigurationAssistantStep(step) {
  const next = Math.max(0, Math.min(5, Number(step) || 0));
  lsSet("nyxConfigAssistant", { step: next });
  renderConfigurationAssistant();
}

function advanceConfigurationAssistant() {
  const savedState = lsGet("nyxConfigAssistant", { step: 0 });
  const state = savedState && typeof savedState === "object" ? savedState : { step: 0 };
  if (state.step >= 5) return finishConfigurationAssistant();
  setConfigurationAssistantStep((Number(state.step) || 0) + 1);
}

function finishConfigurationAssistant() {
  lsSet(CONFIG_ASSISTANT_DONE_KEY, true);
  lsSet("permsAsked", true);
  lsSet("nyxConfigAssistant", { step: 0 });
  closeConfigurationAssistant();
  showToast("Configuração inicial concluída.");
}

function closeConfigurationAssistant() {
  if (!configAssistantOverlay) return;
  const overlay = configAssistantOverlay;
  configAssistantOverlay = null;
  if (configAssistantKeyHandler) {
    document.removeEventListener("keydown", configAssistantKeyHandler);
    configAssistantKeyHandler = null;
  }
  overlay.remove();
  if (!fpOpen && !document.body.classList.contains("settings-open")) document.body.classList.remove("no-scroll");
  const returnFocus = $("homeSettings");
  if (returnFocus) returnFocus.focus();
}

function maybeStartConfigurationAssistant() {
  if (lsGet(CONFIG_ASSISTANT_DONE_KEY, false) || lsGet("permsAsked", false)) return;
  if (configAssistantOverlay) return;
  configAssistantOverlay = el("div", "configuration-assistant-scrim");
  configAssistantOverlay.setAttribute("role", "presentation");
  const panel = el("section", "configuration-assistant");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.tabIndex = -1;
  configAssistantOverlay.appendChild(panel);
  configAssistantOverlay.addEventListener("click", event => {
    if (event.target === configAssistantOverlay) closeConfigurationAssistant();
  });
  configAssistantKeyHandler = event => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeConfigurationAssistant();
    }
    if (event.key === "Tab" && configAssistantOverlay) {
      const focusable = [...configAssistantOverlay.querySelectorAll("button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const panel = configAssistantOverlay.querySelector(".configuration-assistant");
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener("keydown", configAssistantKeyHandler);
  document.body.appendChild(configAssistantOverlay);
  document.body.classList.add("no-scroll");
  renderConfigurationAssistant();
}
