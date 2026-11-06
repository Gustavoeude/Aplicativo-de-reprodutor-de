"use strict";

/* ==========================================================
   Assistente inicial Nyx — fluxo visual baseado na referência
   ========================================================== */
const CONFIG_ASSISTANT_DONE_KEY = "nyxConfigAssistantCompleted";
let configAssistantOverlay = null;
let configAssistantKeyHandler = null;
let configAssistantReturnFocus = null;
let onboardingDirectoryChoices = [];
let onboardingDirectoryLoadedKey = "";
let onboardingDirectoryFailedKey = "";
let onboardingDirectoryLoadingKey = "";

applyNavigationStyle(settings.navigationStyle);

function applyOnboardingNavigationStyle(style) {
  settings.navigationStyle = style === "bar" ? "bar" : "floating";
  applyNavigationStyle(settings.navigationStyle);
  saveSettings();
}

// Seletor completo para Ajustes > Comportamento.
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
    button.append(
      el("span", "material-symbols-rounded navigation-style-icon", choice.icon),
      el("strong", "", choice.title),
      el("small", "", choice.description),
      el("span", "material-symbols-rounded navigation-style-check", selected ? "check_circle" : "add")
    );
    button.onclick = () => {
      applyOnboardingNavigationStyle(choice.id);
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

function onboardingArt(iconName, className) {
  const art = el("div", "onboarding-art" + (className ? " " + className : ""));
  const blob = el("span", "onboarding-art-blob");
  const glint = el("span", "onboarding-art-glint");
  const smallLeft = el("span", "onboarding-art-orbit orbit-left");
  const smallRight = el("span", "onboarding-art-orbit orbit-right");
  const center = el("span", "onboarding-art-center");
  center.appendChild(el("span", "material-symbols-rounded", iconName));
  art.append(blob, glint, smallLeft, smallRight, center);
  return art;
}

function onboardingNavigationSwitch() {
  const row = el("div", "onboarding-navigation-setting");
  const text = el("div", "onboarding-navigation-setting-text");
  const isFloating = (settings.navigationStyle || "floating") === "floating";
  text.append(
    el("strong", "", "Estilo padrão"),
    el("span", "", isFloating ? "Pílula flutuante" : "Barra tradicional")
  );
  const toggle = el("button", "onboarding-switch" + (isFloating ? " on" : ""));
  toggle.type = "button";
  toggle.setAttribute("role", "switch");
  toggle.setAttribute("aria-label", "Usar pílula flutuante na navegação");
  toggle.setAttribute("aria-checked", String(isFloating));
  toggle.appendChild(el("span", "onboarding-switch-thumb"));
  toggle.onclick = () => {
    const next = settings.navigationStyle !== "floating";
    applyOnboardingNavigationStyle(next ? "floating" : "bar");
    toggle.classList.toggle("on", next);
    toggle.setAttribute("aria-checked", String(next));
    text.querySelector("span").textContent = next ? "Pílula flutuante" : "Barra tradicional";
  };
  row.append(text, toggle);
  return row;
}

function currentAssistantStep() {
  const state = lsGet("nyxConfigAssistant", { step: 0 });
  return Math.max(0, Math.min(5, Number(state && state.step) || 0));
}

function setIgnoredDirectory(uri, name, checked) {
  const current = getIgnoredFolders();
  const next = checked
    ? (current.some(folder => folder.uri === uri) ? current : current.concat([{ uri, name }]))
    : current.filter(folder => folder.uri !== uri);
  setDirectories("ignored", next);
  syncWatchedFolder(false);
}

function ensureOnboardingDirectoryChoices() {
  if (!MN || typeof MN.listFolderDirectories !== "function" || typeof getWatchedFolders !== "function") return;
  const roots = getWatchedFolders();
  if (!roots.length) return;
  const key = roots.map(folder => folder.uri).sort().join("|");
  if (key === onboardingDirectoryLoadedKey || key === onboardingDirectoryFailedKey || key === onboardingDirectoryLoadingKey) return;
  onboardingDirectoryLoadingKey = key;
  Promise.all(roots.map(folder => MN.listFolderDirectories({ uri: folder.uri })))
    .then(results => {
      const seen = new Set();
      onboardingDirectoryChoices = results.flatMap(result => result && Array.isArray(result.folders) ? result.folders : [])
        .filter(folder => folder && folder.uri && !seen.has(folder.uri) && seen.add(folder.uri))
        .sort((a, b) => String(a.relativePath || a.name).localeCompare(String(b.relativePath || b.name), "pt-BR"));
      onboardingDirectoryLoadedKey = key;
    })
    .catch(error => {
      logErr("onboarding:list-directories", error);
      onboardingDirectoryFailedKey = key;
    })
    .finally(() => {
      onboardingDirectoryLoadingKey = "";
      if (configAssistantOverlay && currentAssistantStep() === 3) renderConfigurationAssistant();
    });
}

function ignoredFoldersContent() {
  const content = el("div", "onboarding-ignored-content");
  const roots = typeof getWatchedFolders === "function" ? getWatchedFolders() : [];
  if (!roots.length) {
    const empty = el("div", "onboarding-empty-folder-list", "Adicione primeiro uma pasta de músicas para ver as pastas que podem ser ignoradas.");
    content.appendChild(empty);
  } else if (onboardingDirectoryLoadingKey) {
    content.appendChild(el("div", "onboarding-empty-folder-list", "Procurando pastas…"));
  } else if (onboardingDirectoryChoices.length) {
    const ignored = getIgnoredFolders();
    const list = el("div", "onboarding-folder-options");
    onboardingDirectoryChoices.forEach(folder => {
      const row = el("label", "onboarding-folder-option");
      const icon = el("span", "material-symbols-rounded onboarding-folder-icon", "folder");
      const info = el("span", "onboarding-folder-info");
      info.append(el("strong", "", folder.name), el("small", "", (Number(folder.audioCount) || 0) + ((Number(folder.audioCount) || 0) === 1 ? " música" : " músicas")));
      const checkbox = el("input", "onboarding-folder-checkbox");
      checkbox.type = "checkbox";
      checkbox.checked = ignored.some(item => item.uri === folder.uri);
      checkbox.setAttribute("aria-label", "Ignorar pasta " + folder.name);
      checkbox.onchange = () => setIgnoredDirectory(folder.uri, folder.name, checkbox.checked);
      row.append(icon, info, checkbox);
      list.appendChild(row);
    });
    content.appendChild(list);
  } else {
    content.appendChild(el("div", "onboarding-empty-folder-list", onboardingDirectoryFailedKey
      ? "Não consegui listar as subpastas. Você ainda pode escolher uma pasta manualmente."
      : "Não encontrei subpastas dentro da biblioteca."));
  }

  if (MN && typeof addDirectory === "function") {
    const add = el("button", "onboarding-add-folder");
    add.type = "button";
    add.append(el("span", "material-symbols-rounded", "add"), el("span", "", "Adicionar pasta"));
    add.onclick = async () => {
      add.disabled = true;
      await addDirectory("ignored");
      onboardingDirectoryLoadedKey = "";
      onboardingDirectoryFailedKey = "";
      ensureOnboardingDirectoryChoices();
      if (configAssistantOverlay) renderConfigurationAssistant();
    };
    content.appendChild(add);
  }
  return content;
}

function configurationAssistantStepContent(step) {
  const content = el("main", "onboarding-screen onboarding-screen-" + step);
  const titles = [
    "Bem-vindo ao Nyx",
    "Permissão de mídia.",
    "Notificações",
    "Pastas excluídas",
    "Navegação",
    "Bateria"
  ];
  const title = el("h1", "onboarding-title", titles[step]);
  title.id = "configuration-assistant-title";
  content.appendChild(title);

  if (step === 0) {
    content.appendChild(el("span", "onboarding-beta", "β Beta"));
    content.appendChild(onboardingArt("music_note", "music-art"));
    content.appendChild(el("p", "onboarding-description", "Vamos deixar tudo pronto para você."));
  }

  if (step === 1) {
    content.appendChild(el("p", "onboarding-description", "O Nyx precisa acessar seus áudios para montar a biblioteca."));
    content.appendChild(onboardingArt("library_music", "media-art"));
    const action = el("button", "onboarding-pill-action");
    action.type = "button";
    action.append(el("span", "material-symbols-rounded", "folder"), el("span", "", MN && typeof addDirectory === "function" ? "Permitir acesso" : "Selecionar arquivos"));
    action.onclick = async () => {
      if (MN && typeof addDirectory === "function") await addDirectory("watched");
      else if (typeof openFilePicker === "function") openFilePicker();
    };
    content.appendChild(action);
    content.appendChild(el("p", "onboarding-footnote", "O Android abre o seletor seguro de pastas. O acesso fica limitado ao que você escolher."));
  }

  if (step === 2) {
    content.appendChild(el("p", "onboarding-description", "Controle a música pela tela de bloqueio e pela barra de notificações."));
    content.appendChild(onboardingArt("notifications", "notification-art"));
    if (MN && typeof MN.requestNotifications === "function") {
      const action = el("button", "onboarding-pill-action");
      action.type = "button";
      action.append(el("span", "material-symbols-rounded", "notifications"), el("span", "", "Ativar notificações"));
      action.onclick = async () => {
        action.disabled = true;
        try {
          const result = await MN.requestNotifications();
          showToast(result && result.granted ? "Notificações ativadas." : "Você pode continuar sem essa permissão.");
        } catch (error) {
          logErr("onboarding:notifications", error);
          showToast("Não foi possível solicitar a permissão agora.");
        } finally {
          action.disabled = false;
        }
      };
      content.appendChild(action);
    } else {
      content.appendChild(el("p", "onboarding-footnote", "No navegador, os controles usam os recursos de mídia disponíveis no próprio navegador."));
    }
  }

  if (step === 3) {
    content.appendChild(el("p", "onboarding-description", "Toque para ignorar uma pasta na busca."));
    content.appendChild(ignoredFoldersContent());
  }

  if (step === 4) {
    content.appendChild(el("p", "onboarding-description", "Escolha o estilo da barra inferior."));
    const preview = el("div", "onboarding-navigation-preview");
    const skeleton = el("div", "onboarding-preview-skeleton");
    skeleton.append(el("span", ""), el("span", ""));
    const nav = el("div", "onboarding-preview-nav");
    ["person", "search", "library_music", "more_vert"].forEach((name, index) => {
      const item = el("span", "onboarding-preview-item" + (index === 0 ? " active" : ""));
      item.appendChild(el("span", "material-symbols-rounded", name));
      nav.appendChild(item);
    });
    preview.append(skeleton, nav);
    content.append(preview, onboardingNavigationSwitch());
  }

  if (step === 5) {
    content.appendChild(el("p", "onboarding-description", "Alguns aparelhos encerram apps em segundo plano. Desative a otimização."));
    content.appendChild(onboardingArt("storage", "battery-art"));
    if (MN && typeof MN.openBatterySettings === "function") {
      const action = el("button", "onboarding-pill-action");
      action.type = "button";
      action.append(el("span", "material-symbols-rounded", "storage"), el("span", "", "Desativar otimização"));
      action.onclick = async () => {
        try {
          await MN.openBatterySettings();
        } catch (error) {
          logErr("onboarding:battery-settings", error);
          showToast("Não foi possível abrir as configurações do app.");
        }
      };
      content.appendChild(action);
      content.appendChild(el("p", "onboarding-footnote", "Nas informações do Nyx, abra Bateria para ajustar o uso em segundo plano."));
    } else {
      content.appendChild(el("p", "onboarding-footnote", "Esta opção fica disponível nas configurações do app Android."));
    }
  }
  return content;
}

function renderOnboardingProgress(step) {
  const progress = el("div", "onboarding-progress");
  progress.setAttribute("role", "group");
  progress.setAttribute("aria-label", "Etapas da configuração");
  for (let i = 0; i < 6; i++) {
    const dot = el("button", "onboarding-progress-dot" + (i === step ? " active" : i < step ? " complete" : ""));
    dot.type = "button";
    dot.setAttribute("aria-label", "Etapa " + (i + 1) + " de 6");
    dot.setAttribute("aria-current", i === step ? "step" : "false");
    dot.disabled = i > step;
    dot.onclick = () => setConfigurationAssistantStep(i);
    progress.appendChild(dot);
  }
  return progress;
}

function renderConfigurationAssistant() {
  if (!configAssistantOverlay) return;
  const saved = lsGet("nyxConfigAssistant", { step: 0 });
  const state = saved && typeof saved === "object" ? saved : { step: 0 };
  const step = Math.max(0, Math.min(5, Number(state.step) || 0));
  state.step = step;
  lsSet("nyxConfigAssistant", state);

  const panel = configAssistantOverlay.querySelector(".configuration-assistant");
  panel.replaceChildren();
  const screen = configurationAssistantStepContent(step);
  const footer = el("footer", "onboarding-footer");
  if (step === 0) {
    const start = el("button", "onboarding-pill-action onboarding-start");
    start.type = "button";
    start.append(el("span", "", "Vamos lá!"), el("span", "material-symbols-rounded", "arrow_back"));
    start.querySelector(".material-symbols-rounded").classList.add("arrow-forward");
    start.onclick = advanceConfigurationAssistant;
    footer.appendChild(start);
  } else {
    if (step === 3 || step === 5) {
      const skip = el("button", "onboarding-skip", "Pular");
      skip.type = "button";
      skip.onclick = finishConfigurationAssistant;
      footer.appendChild(skip);
    } else {
      footer.appendChild(renderOnboardingProgress(step));
    }
    const next = el("button", "onboarding-next-arrow" + (step === 3 || step === 5 ? " labeled" : ""));
    next.type = "button";
    next.setAttribute("aria-label", step === 3 ? "Concluir esta etapa" : step === 5 ? "Concluir configuração" : "Próxima etapa");
    if (step === 3 || step === 5) {
      next.append(el("span", "", step === 3 ? "Concluir" : "Concluir"), el("span", "material-symbols-rounded", "check"));
    } else {
      next.appendChild(el("span", "material-symbols-rounded", "arrow_back"));
      next.querySelector(".material-symbols-rounded").classList.add("arrow-forward");
    }
    next.onclick = step === 5 ? finishConfigurationAssistant : advanceConfigurationAssistant;
    footer.appendChild(next);
  }
  panel.append(screen, footer);
  panel.setAttribute("aria-labelledby", "configuration-assistant-title");
  if (!panel.dataset.focusedOnce) {
    panel.dataset.focusedOnce = "true";
    panel.focus();
  } else if (footer.querySelector(".onboarding-next-arrow")) {
    footer.querySelector(".onboarding-next-arrow").focus();
  } else if (footer.querySelector(".onboarding-start")) {
    footer.querySelector(".onboarding-start").focus();
  }
  if (step === 3) ensureOnboardingDirectoryChoices();
}

function setConfigurationAssistantStep(step) {
  const next = Math.max(0, Math.min(5, Number(step) || 0));
  lsSet("nyxConfigAssistant", { step: next });
  renderConfigurationAssistant();
}

function advanceConfigurationAssistant() {
  const state = lsGet("nyxConfigAssistant", { step: 0 });
  const step = Math.max(0, Number(state && state.step) || 0);
  if (step >= 5) return finishConfigurationAssistant();
  setConfigurationAssistantStep(step + 1);
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
  if (configAssistantReturnFocus && document.contains(configAssistantReturnFocus)) {
    configAssistantReturnFocus.focus();
  }
  configAssistantReturnFocus = null;
}

function maybeStartConfigurationAssistant() {
  if (lsGet(CONFIG_ASSISTANT_DONE_KEY, false) || lsGet("permsAsked", false) || configAssistantOverlay) return;
  configAssistantReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  configAssistantOverlay = el("div", "configuration-assistant-scrim");
  configAssistantOverlay.setAttribute("role", "presentation");
  const panel = el("section", "configuration-assistant");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.tabIndex = -1;
  configAssistantOverlay.appendChild(panel);
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
