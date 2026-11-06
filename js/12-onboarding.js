"use strict";

/* ==========================================================
   Onboarding da primeira abertura (tela cheia, passo a passo)
   Reaproveita importFolder, openFilePicker, addDirectory e
   MN.requestNotifications. Dá para refazer em Ajustes.
   Cada passo com ação mostra o resultado (ex.: a pasta escolhida)
   e libera o botão "Continuar".
   ========================================================== */
const OB_KEY = "onboardingDone";

const OB_PATHS = {
  arrow: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  battery: "M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z",
  folderOff: "M20 6h-8l-2-2H6.83L20 17.17V8c0-1.1-.9-2-2-2zM2.81 2.81L1.39 4.22 2 4.83V18c0 1.1.9 2 2 2h13.17l2.61 2.61 1.41-1.41L2.81 2.81z",
  info: "M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
};

function obIcon(name) {
  const d = OB_PATHS[name];
  if (d) return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  return iconSvg(name);
}

function obHasNative() {
  return !!(MN && typeof MN.pickFolder === "function");
}

const obSleep = ms => new Promise(r => setTimeout(r, ms));

// Espera as músicas escolhidas pelo seletor de arquivos terminarem de entrar na biblioteca.
async function obWatchSongs(before) {
  let last = songs.length;
  let stable = 0;
  for (let i = 0; i < 240 && obRoot; i++) { // até ~2 min
    await obSleep(500);
    if (songs.length !== last) { last = songs.length; stable = 0; }
    else if (last > before && ++stable >= 3) break;
  }
  return songs.length - before;
}

function obPlural(n, um, varios) { return n + " " + (n === 1 ? um : varios); }

// Cada ação devolve { label, sub, warn } quando concluiu, ou null se nada aconteceu.
async function obPickMusic() {
  const before = songs.length;
  if (obHasNative()) {
    const r = await importFolder();
    if (r && r.name) {
      const added = songs.length - before;
      if (!r.count) return { label: r.name, sub: "Nenhuma música encontrada nessa pasta", warn: true, retry: true };
      return { label: r.name, sub: added > 0 ? obPlural(added, "música adicionada", "músicas adicionadas") : "Músicas dessa pasta já estavam na biblioteca" };
    }
  } else {
    openFilePicker();
  }
  const added = await obWatchSongs(before);
  return added > 0 ? { label: "Arquivos adicionados", sub: obPlural(added, "música adicionada", "músicas adicionadas") } : null;
}

async function obPickFiles() {
  const before = songs.length;
  openFilePicker();
  const added = await obWatchSongs(before);
  return added > 0 ? { label: "Arquivos adicionados", sub: obPlural(added, "música adicionada", "músicas adicionadas") } : null;
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
      busy: "Importando…",
      secondary: native ? "Escolher arquivos" : "",
      again: native ? "Escolher outra pasta" : "Escolher mais arquivos",
      run: obPickMusic,
      runSecondary: obPickFiles,
      orbit: ["folder", "music_note", "playlist_add"]
    }
  ];
  if (native) {
    steps.push(
      {
        key: "avisos", title: "Notificações", icon: "notifications",
        text: "Ative as notificações para controlar a música pela tela de bloqueio e pela barra de notificações.",
        primary: "Ativar notificações",
        busy: "Aguardando…",
        run: async () => {
          const r = await MN.requestNotifications();
          if (r && r.granted === false) {
            return { label: "Permissão não concedida", sub: "Sem ela, os controles somem da tela de bloqueio. Dá para ativar depois nas configurações do Android.", warn: true };
          }
          return { label: "Notificações ativadas", sub: "Os controles aparecem na tela de bloqueio." };
        },
        orbit: ["skip_next", "pause", "skip_previous"]
      },
      {
        key: "ignoradas", title: "Pastas ignoradas", icon: "folderOff",
        text: "Alguma pasta tem sons que não são música, como toques ou áudios de apps? Escolha para o Nyx ignorar.",
        primary: "Escolher pasta para ignorar",
        busy: "Aguardando…",
        again: "Ignorar outra pasta",
        run: async () => {
          const ok = await addDirectory("ignored");
          if (!ok) return null;
          const list = getIgnoredFolders();
          const names = list.slice(-3).map(f => f.name).join(", ");
          return { label: names, sub: obPlural(list.length, "pasta será ignorada", "pastas serão ignoradas") + " nas buscas" };
        },
        orbit: ["music_note", "folder", "delete"],
        skippable: true
      }
    );
    if (typeof MN.requestBatteryExemption === "function") {
      steps.push({
        key: "bateria", title: "Bateria", icon: "battery",
        text: "Alguns Androids encerram apps em segundo plano. Desative a otimização de bateria para a música não parar do nada.",
        primary: "Desativar otimização",
        busy: "Aguardando…",
        run: async () => {
          const r = await MN.requestBatteryExemption();
          return r && r.granted
            ? { label: "Otimização já estava desativada", sub: "A música continua tocando em segundo plano." }
            : { label: "Pedido enviado", sub: "Confirme na janela do Android para valer." };
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
let obDir = 1;
let obBusy = false;
let obResults = {};

function obFinish() {
  lsSet(OB_KEY, true);
  lsSet("permsAsked", true); // a folha antiga de importação não precisa aparecer depois
  document.documentElement.classList.remove("ob-pending");
  if (!obRoot) return;
  const root = obRoot;
  obRoot = null;
  root.classList.remove("show");
  setTimeout(() => root.remove(), 260);
}

// Troca de passo com saída suave e entrada na direção certa.
function obGo(delta) {
  if (obBusy || !obRoot) return;
  const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  obDir = delta > 0 ? 1 : -1;
  if (reduced) { obIndex += delta; obRender(); return; }
  obBusy = true;
  obRoot.querySelector(".ob-stage").classList.add(obDir > 0 ? "ob-out-l" : "ob-out-r");
  obRoot.querySelector(".ob-foot").classList.add("ob-foot-out");
  setTimeout(() => {
    obBusy = false;
    if (!obRoot) return;
    obIndex += delta;
    obRender();
  }, 240);
}

function obResultCard(res) {
  const card = el("div", "ob-result" + (res.warn ? " warn" : ""));
  const ic = el("span", "ob-result-ic");
  ic.innerHTML = obIcon(res.warn ? "info" : "check_circle");
  const txt = el("div", "ob-result-tx");
  txt.append(el("strong", "", res.label), el("span", "", res.sub || ""));
  card.append(ic, txt);
  return card;
}

function obRender() {
  const step = obList[obIndex];
  const last = obIndex === obList.length - 1;
  const res = obResults[step.key];
  const done = !!(res && !res.retry);
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

  // título, texto e resultado
  const h = el("h1", "ob-title");
  h.textContent = step.title;
  const p = el("p", "ob-text", step.text);
  stage.append(h, p);
  if (res) stage.appendChild(obResultCard(res));

  // ilustração
  const art = el("div", "ob-art" + (res ? " small" : ""));
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
  stage.appendChild(art);
  void stage.offsetWidth;
  stage.classList.add("ob-in");

  // botões
  const foot = obRoot.querySelector(".ob-foot");
  foot.innerHTML = "";
  const advance = () => (last ? obFinish() : obGo(1));

  // executa uma ação, mostra "ocupado" e guarda o resultado
  const exec = async (fn, button, busyText) => {
    if (obBusy || button.classList.contains("busy")) return;
    const idle = button.querySelector("span").textContent;
    button.classList.add("busy");
    button.querySelector("span").textContent = busyText || "Aguardando…";
    let r = null;
    try { r = await fn(); } catch (e) { logErr("onboarding:" + step.key, e); }
    if (!obRoot) return;
    button.classList.remove("busy");
    button.querySelector("span").textContent = idle;
    if (r) { obResults[step.key] = r; obRender(); }
  };

  const links = el("div", "ob-links");
  if (step.run && done && step.again) {
    const again = el("button", "ob-link", step.again);
    again.onclick = () => exec(step.run, main2, step.busy);
    links.appendChild(again);
  }
  if (step.secondary && !done) {
    const sec = el("button", "ob-link", step.secondary);
    sec.onclick = () => exec(step.runSecondary, main2, step.busy);
    links.appendChild(sec);
  }
  if (step.skippable && !done) {
    const skip = el("button", "ob-link", "Pular");
    skip.onclick = advance;
    links.appendChild(skip);
  }
  if (links.childNodes.length) foot.appendChild(links);

  const row = el("div", "ob-row");
  if (obIndex > 0) {
    const back = el("button", "ob-back");
    back.innerHTML = obIcon("back");
    back.setAttribute("aria-label", "Voltar");
    back.onclick = () => obGo(-1);
    row.appendChild(back);
  }
  const main2 = el("button", "ob-primary");
  main2.appendChild(el("span", "", done ? (last ? "Concluir" : "Continuar") : step.primary));
  main2.insertAdjacentHTML("beforeend", '<i class="ob-spin" aria-hidden="true"></i>' + obIcon("arrow"));
  main2.onclick = () => {
    if (!step.run || done) advance();
    else exec(step.run, main2, step.busy);
  };
  row.appendChild(main2);
  foot.appendChild(row);
}

function startOnboarding(instant) {
  if (obRoot) return;
  obList = obSteps();
  obIndex = 0;
  obDir = 1;
  obBusy = false;
  obResults = {};

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
  if (instant) root.classList.add("show", "ob-now");
  document.body.appendChild(root);
  obRoot = root;
  obRender();
  if (!instant) requestAnimationFrame(() => root.classList.add("show"));
}

// Chamado ao terminar de carregar as músicas.
function maybeStartOnboarding() {
  if (obRoot) return true; // já está na tela (primeira abertura)
  if (lsGet(OB_KEY, false)) return false;
  // quem já tem músicas (atualizou o app) não precisa repetir
  if (songs.length) { lsSet(OB_KEY, true); return false; }
  setTimeout(startOnboarding, 300);
  return true;
}

// Primeira instalação: o onboarding é a PRIMEIRA coisa que aparece (o app fica escondido por trás).
if (document.documentElement.classList.contains("ob-pending")) startOnboarding(true);
