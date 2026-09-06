const MODES = [
  { id: "bounce", label: "Bolo Quicando 🎂", theme: "theme-1" },
  { id: "spin", label: "Bolo Girando 🌀", theme: "theme-2" },
  { id: "fall", label: "Chuva de Confeitos 🎉", theme: "theme-3" },
  { id: "splash", label: "Splash de Massa 💥", theme: "theme-4" },
  { id: "bake", label: "Bolo Assando 🔥", theme: "theme-5" },
];

const CONFETTI_COLORS = [
  "#ff595e", "#ffca3a", "#8ac926", "#1982c4",
  "#6a4c93", "#ff8fab", "#ffffff",
];

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="400" height="260" rx="16" fill="#ffe0ec"/><ellipse cx="200" cy="176" rx="118" ry="26" fill="#e8a3ad"/><rect x="104" y="112" width="192" height="64" rx="10" fill="#a05a2c"/><rect x="124" y="66" width="152" height="50" rx="10" fill="#c97b3d"/><path d="M124 70 q19 20 38 0 q19 20 38 0 q19 20 38 0 q19 20 38 0" stroke="#fffdf5" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="200" cy="150" r="8" fill="#ff595e"/><circle cx="160" cy="150" r="6" fill="#ffca3a"/><circle cx="240" cy="150" r="6" fill="#8ac926"/></svg>'
  );

const els = {
  themeLayer: document.getElementById("theme-layer"),
  stage: document.getElementById("animation-stage"),
  badge: document.getElementById("mode-badge"),
  card: document.getElementById("recipe-card"),
  img: document.getElementById("recipe-img"),
  name: document.getElementById("recipe-name"),
  ingredients: document.getElementById("recipe-ingredients"),
  instructions: document.getElementById("recipe-instructions"),
  btn: document.getElementById("btn-another"),
};

let lastModeIndex = -1;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pickRandomMode() {
  let i;
  do {
    i = Math.floor(Math.random() * MODES.length);
  } while (i === lastModeIndex && MODES.length > 1);
  lastModeIndex = i;
  return MODES[i];
}

function randomColor() {
  return CONFETTI_COLORS[Math.floor(rand(0, CONFETTI_COLORS.length)) % CONFETTI_COLORS.length];
}

function cakeHTML() {
  return `
    <div class="cake-wrap">
      <div class="cake">
        <div class="candle"></div>
        <div class="frosting"></div>
        <div class="layer layer-top"></div>
        <div class="layer layer-bottom"></div>
      </div>
      <div class="cake-shadow"></div>
    </div>`;
}

function buildStage(mode) {
  if (mode.id === "fall") {
    let pieces = "";
    for (let i = 0; i < 42; i++) {
      const size = rand(6, 14);
      const style =
        `left:${rand(0, 100).toFixed(1)}%;` +
        `width:${size.toFixed(1)}px;height:${(size * rand(0.6, 1.4)).toFixed(1)}px;` +
        `background:${randomColor()};` +
        `border-radius:${Math.random() > 0.5 ? "50%" : "2px"};` +
        `animation-duration:${rand(2.6, 6).toFixed(2)}s;` +
        `animation-delay:-${rand(0, 4).toFixed(2)}s;` +
        `opacity:${rand(0.6, 1).toFixed(2)}`;
      pieces += `<div class="confetti" style="${style}"></div>`;
    }
    els.stage.innerHTML = cakeHTML() + pieces;
  } else if (mode.id === "splash") {
    let blobs = "";
    for (let i = 0; i < 14; i++) {
      const size = rand(30, 90);
      const style =
        `left:${rand(2, 92).toFixed(1)}%;top:${rand(5, 80).toFixed(1)}%;` +
        `width:${size.toFixed(0)}px;height:${(size * rand(0.7, 1.2)).toFixed(0)}px;` +
        `background:${randomColor()};` +
        `animation-duration:${rand(1.6, 3).toFixed(2)}s;` +
        `animation-delay:-${rand(0, 2).toFixed(2)}s`;
      blobs += `<div class="splash-blob" style="${style}"></div>`;
    }
    els.stage.innerHTML = blobs + cakeHTML();
  } else if (mode.id === "bake") {
    let puffs = "";
    for (let i = 0; i < 10; i++) {
      const size = rand(14, 32);
      const style =
        `left:${rand(42, 58).toFixed(1)}%;` +
        `bottom:${(120 + rand(0, 50)).toFixed(0)}px;` +
        `width:${size.toFixed(0)}px;height:${size.toFixed(0)}px;` +
        `animation-duration:${rand(1.8, 3.2).toFixed(2)}s;` +
        `animation-delay:-${rand(0, 2.5).toFixed(2)}s`;
      puffs += `<div class="steam" style="${style}"></div>`;
    }
    els.stage.innerHTML = puffs + cakeHTML();
  } else {
    els.stage.innerHTML = cakeHTML();
  }
  els.stage.dataset.mode = mode.id;
}

function applyMode(mode) {
  els.themeLayer.className = mode.theme;
  buildStage(mode);
  els.badge.textContent = mode.label;
  els.badge.style.animation = "none";
  void els.badge.offsetWidth;
  els.badge.style.animation = "";
}

async function fetchRecipe() {
  const res = await fetch("/api/receita");
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

function lowerFirst(s) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function renderRecipe(r) {
  els.img.src = r.imagem || PLACEHOLDER_IMG;
  els.img.alt = r.nome;
  els.name.textContent = r.nome;

  els.ingredients.innerHTML = "";
  (r.ingredientes || []).forEach((ing) => {
    const li = document.createElement("li");
    const medida = (ing.medida || "").trim();
    li.textContent =
      medida && medida.toLowerCase() !== "a gosto"
        ? `${medida} de ${lowerFirst(ing.nome)}`
        : ing.nome;
    els.ingredients.appendChild(li);
  });

  els.instructions.innerHTML = "";
  (r.preparo || []).forEach((passo) => {
    const li = document.createElement("li");
    li.textContent = passo;
    els.instructions.appendChild(li);
  });
}

async function loadRecipe() {
  applyMode(pickRandomMode());

  els.card.style.animation = "none";
  void els.card.offsetWidth;

  try {
    els.btn.disabled = true;
    els.btn.textContent = "Buscando... ⏳";
    const recipe = await fetchRecipe();
    renderRecipe(recipe);
    els.card.style.animation = "";
  } catch (err) {
    els.name.textContent = "Ops! Nao foi possivel carregar a receita.";
    els.instructions.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = "Verifique se o servidor esta rodando e tente novamente.";
    els.instructions.appendChild(li);
    console.error(err);
  } finally {
    els.btn.disabled = false;
    els.btn.textContent = "Outra Receita 🎂";
  }
}

els.btn.addEventListener("click", loadRecipe);

loadRecipe();