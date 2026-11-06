"use strict";

/* ==========================================================
   Onboarding da primeira abertura (tela cheia, passo a passo)
   Só adiciona uma tela nova: não muda nenhuma função existente.
   Reaproveita importFolder, openFilePicker, addDirectory e
   MN.requestNotifications. Dá para refazer em Ajustes.
   ========================================================== */
const OB_KEY = "onboardingDone";

const OB_PATHS = {
  arrow: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  battery: "M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z",
  folderOff: "M20 6h-8l-2-2H6.83L20 17.17V8c0-1.1-.9-2-2-2zM2.81 2.81L1.39 4.22 2 4.83V18c0 1.1.9 2 2 2h13.17l2.61 2.61 1.41-1.41L2.81 2.81z",
  file: "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"
};

function obIcon(name) {
  const d = OB_PATHS[name];
  if (d) return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  return iconSvg(name);
}

function obHasNative() {
  return !!(MN && typeof MN.pickFolder === "function");
}

// Passos: cada um diz o que mostra e o que o botão principal faz.
function obSteps() {
  const native = obHasNative();
  const steps = [
    {
      key: "welcome", title: "Bem-vindo ao Nyx", app: true,
      text: "Vamos deixar tudo pronto para você. Leva menos de um minuto.",
      primary: "Vamos lá"
    },
    {
      key: "musicas", title: "Suas músicas", icon: "library_music",
      text: native
        ? "Escolha uma pasta do celular e o Nyx importa todas as músicas dela. Você também pode escolher arquivos soltos."
        : "Escolha arquivos de áudio ou uma pasta para montar sua biblioteca. O app só recebe o que você selecionar.",
      primary: native ? "Escolher pasta" : "Escolher arquivos",
      secondary: native ? "Escolher arquivos" : "",
      run: () => (native ? importFolder() : openFilePicker()),
      runSecondary: () => openFilePicker(),
      orbit: ["folder", "music_note", "playlist_add"]
    }
  ];
  if (native) {
    steps.push(
      {
        key: "avisos", title: "Notificações", icon: "notifications",
        text: "Ative as notificações para controlar a música pela tela de bloqueio e pela barra de notificações.",
        primary: "Ativar notificações",
        run: async () => {
          try {
            const r = await MN.requestNotifications();
            if (r && r.granted === false) showToast("Sem a permissão, os controles na tela de bloqueio ficam escondidos.");
            else showToast("Notificações ativadas");
          } catch (e) { logErr("onboarding:avisos", e); }
        },
        orbit: ["skip_next", "pause", "skip_previous"]
      },
      {
        key: "ignoradas", title: "Pastas ignoradas", icon: "folderOff",
        text: "Alguma pasta tem sons que não são música, como toques ou áudios de apps? Escolha para o Nyx ignorar.",
        primary: "Escolher pasta para ignorar",
        run: () => addDirectory("ignored"),
        orbit: ["music_note", "folder", "delete"],
        skippable: true
      }
    );
    if (typeof MN.requestBatteryExemption === "function") {
      steps.push({
        key: "bateria", title: "Bateria", icon: "battery",
        text: "Alguns Androids encerram apps em segundo plano. Desative a otimização de bateria para a música não parar do nada.",
        primary: "Desativar otimização",
        run: async () => {
          try { await MN.requestBatteryExemption(); } catch (e) { logErr("onboarding:bateria", e); }
        },
        orbit: ["play_arrow", "check_circle", "repeat"],
        skippable: true
      });
    }
  }
  return steps;
}

let obRoot = null;
let obIndex = 0;
let obList = [];

function obFinish() {
  lsSet(OB_KEY, true);
  lsSet("permsAsked", true); // a folha antiga de importação não precisa aparecer depois
  if (!obRoot) return;
  const root = obRoot;
  obRoot = null;
  root.classList.remove("show");
  setTimeout(() => root.remove(), 260);
  const back = $("homeSettings");
  if (back) back.focus();
}

let obDir = 1;
let obBusy = false;

// Troca de passo com saída suave e entrada na direção certa.
function obGo(delta) {
  if (obBusy || !obRoot) return;
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  obDir = delta > 0 ? 1 : -1;
  if (reduced) { obIndex += delta; obRender(); return; }
  obBusy = true;
  const stage = obRoot.querySelector(".ob-stage");
  const foot = obRoot.querySelector(".ob-foot");
  stage.classList.add(obDir > 0 ? "ob-out-l" : "ob-out-r");
  foot.classList.add("ob-foot-out");
  setTimeout(() => {
    obBusy = false;
    if (!obRoot) return;
    obIndex += delta;
    obRender();
  }, 240);
}

function obRender() {
  const step = obList[obIndex];
  const last = obIndex === obList.length - 1;
  const stage = obRoot.querySelector(".ob-stage");
  stage.innerHTML = "";
  stage.classList.remove("ob-in", "ob-out-l", "ob-out-r", "ob-from-l", "ob-from-r");
  stage.classList.add(obDir > 0 ? "ob-from-r" : "ob-from-l");
  obRoot.querySelector(".ob-foot").classList.remove("ob-foot-out");

  // progresso
  const dots = obRoot.querySelector(".ob-dots");
  dots.innerHTML = "";
  obList.forEach((_, i) => dots.appendChild(el("span", i === obIndex ? "on" : i < obIndex ? "done" : "")));
  obRoot.querySelector(".ob-count").textContent = (obIndex + 1) + " de " + obList.length;

  // título e texto
  const h = el("h1", "ob-title");
  h.textContent = step.title;
  const p = el("p", "ob-text", step.text);

  // ilustração
  const art = el("div", "ob-art");
  art.setAttribute("aria-hidden", "true");
  const back2 = el("i", "ob-card ob-card-b");
  const back1 = el("i", "ob-card ob-card-a");
  const main = el("div", "ob-main");
  if (step.app) {
    const img = document.createElement("img");
    img.src = "icon-192.png";
    img.alt = "";
    img.draggable = false;
    main.appendChild(img);
    main.classList.add("ob-app");
  } else {
    main.innerHTML = obIcon(step.icon);
  }
  art.append(back2, back1, main);
  (step.orbit || []).forEach((name, i) => {
    const c = el("span", "ob-chip ob-chip-" + (i + 1));
    c.innerHTML = obIcon(name);
    art.appendChild(c);
  });

  stage.append(h, p, art);
  void stage.offsetWidth;
  stage.classList.add("ob-in");

  // botões
  const foot = obRoot.querySelector(".ob-foot");
  foot.innerHTML = "";
  const advance = () => {
    if (last) obFinish();
    else obGo(1);
  };

  if (step.secondary) {
    const sec = el("button", "ob-link", step.secondary);
    sec.onclick = async () => { try { await step.runSecondary(); } catch (e) { logErr("onboarding:sec", e); } };
    foot.appendChild(sec);
  }
  if (step.skippable) {
    const skip = el("button", "ob-link", "Pular");
    skip.onclick = advance;
    foot.appendChild(skip);
  }

  const row = el("div", "ob-row");
  if (obIndex > 0) {
    const back = el("button", "ob-back");
    back.innerHTML = obIcon("back");
    back.setAttribute("aria-label", "Voltar");
    back.onclick = () => obGo(-1);
    row.appendChild(back);
  }
  const main2 = el("button", "ob-primary");
  const label = el("span", "", step.primary);
  main2.appendChild(label);
  main2.insertAdjacentHTML("beforeend", obIcon("arrow"));
  main2.onclick = async () => {
    if (step.run) {
      main2.disabled = true;
      try { await step.run(); } catch (e) { logErr("onboarding:" + step.key, e); }
      main2.disabled = false;
      // o seletor do Android pode demorar: só avança depois de voltar para o app
      if (!obRoot) return;
    }
    advance();
  };
  row.appendChild(main2);
  foot.appendChild(row);
}

function startOnboarding() {
  if (obRoot) return;
  obList = obSteps();
  obIndex = 0;
  obDir = 1;
  obBusy = false;

  const root = el("div", "ob");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-label", "Configuração inicial do Nyx");

  const top = el("div", "ob-top");
  const dots = el("div", "ob-dots");
  const count = el("span", "ob-count");
  const skipAll = el("button", "ob-skipall", "Pular tudo");
  skipAll.onclick = obFinish;
  top.append(dots, count, skipAll);

  root.append(top, el("div", "ob-stage"), el("div", "ob-foot"));
  document.body.appendChild(root);
  obRoot = root;
  obRender();
  requestAnimationFrame(() => root.classList.add("show"));
}

// Primeira abertura: onboarding no lugar da folha simples de importação.
function maybeStartOnboarding() {
  if (lsGet(OB_KEY, false)) return false;
  // quem já tem músicas (atualizou o app) não precisa repetir
  if (typeof songs !== "undefined" && songs.length) { lsSet(OB_KEY, true); return false; }
  setTimeout(startOnboarding, 600);
  return true;
}
