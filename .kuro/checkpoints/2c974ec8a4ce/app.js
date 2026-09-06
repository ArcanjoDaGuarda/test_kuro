const API_BASE = "https://www.themealdb.com/api/json/v1/1";
const CAKE_KEYWORDS = ["cake", "bolo"];

const CONFETTI_COLORS = [
  "#ff595e", "#ffca3a", "#8ac926", "#1982c4",
  "#6a4c93", "#ff8fab", "#ffffff",
];

const MODES = [
  { id: "bounce", label: "Bolo Quicando 🎂", theme: "theme-1" },
  { id: "spin", label: "Bolo Girando 🌀", theme: "theme-2" },
  { id: "fall", label: "Chuva de Confeitos 🎉", theme: "theme-3" },
  { id: "splash", label: "Splash de Massa 💥", theme: "theme-4" },
];

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

function randomColor() {
  return CONFETTI_COLORS[Math.floor(rand(0, CONFETTI_COLORS.length)) % CONFETTI_COLORS.length];
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

async function fetchRandomCake() {
  const res = await fetch(`${API_BASE}/filter.php?c=Dessert`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const meals = data.meals || [];
  if (!meals.length) throw new Error("Nenhuma receita encontrada");
  const cakes = meals.filter((m) =>
    CAKE_KEYWORDS.some((k) => m.strMeal.toLowerCase().includes(k))
  );
  const pool = cakes.length ? cakes : meals;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const detail = await fetch(`${API_BASE}/lookup.php?i=${pick.idMeal}`);
  if (!detail.ok) throw new Error(`HTTP ${detail.status}`);
  const detailData = await detail.json();
  return detailData.meals[0];
}

function renderRecipe(meal) {
  els.img.src = meal.strMealThumb;
  els.img.alt = meal.strMeal;
  els.name.textContent = meal.strMeal;

  els.ingredients.innerHTML = "";
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const li = document.createElement("li");
      li.textContent = `${measure || ""} ${ing}`.trim();
      els.ingredients.appendChild(li);
    }
  }

  els.instructions.textContent = meal.strInstructions || "";
}

async function loadRecipe() {
  const mode = pickRandomMode();
  applyMode(mode);

  els.card.style.animation = "none";
  void els.card.offsetWidth;

  try {
    els.btn.disabled = true;
    els.btn.textContent = "Buscando... ⏳";
    const meal = await fetchRandomCake();
    renderRecipe(meal);
    els.card.style.animation = "";
  } catch (err) {
    els.name.textContent = "Ops! Nao foi possivel carregar a receita.";
    els.instructions.textContent = "Verifique sua conexao e tente novamente.";
    console.error(err);
  } finally {
    els.btn.disabled = false;
    els.btn.textContent = "Outra Receita 🎂";
  }
}

els.btn.addEventListener("click", loadRecipe);

loadRecipe();