const API_BASE = "https://www.themealdb.com/api/json/v1/1";

const els = {
  themeLayer: document.getElementById("theme-layer"),
  stage: document.getElementById("animation-stage"),
  img: document.getElementById("recipe-img"),
  name: document.getElementById("recipe-name"),
  ingredients: document.getElementById("recipe-ingredients"),
  instructions: document.getElementById("recipe-instructions"),
  btn: document.getElementById("btn-another"),
};

async function fetchRandomDessert() {
  const res = await fetch(`${API_BASE}/filter.php?c=Dessert`);
  const data = await res.json();
  const meals = data.meals || [];
  if (!meals.length) throw new Error("Nenhuma receita encontrada");
  const pick = meals[Math.floor(Math.random() * meals.length)];
  const detail = await fetch(`${API_BASE}/lookup.php?i=${pick.idMeal}`);
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
  try {
    els.btn.disabled = true;
    els.btn.textContent = "Buscando... ⏳";
    const meal = await fetchRandomDessert();
    renderRecipe(meal);
  } catch (err) {
    els.name.textContent = "Ops! Nao foi possivel carregar a receita.";
    console.error(err);
  } finally {
    els.btn.disabled = false;
    els.btn.textContent = "Outra Receita 🎂";
  }
}

els.btn.addEventListener("click", loadRecipe);

loadRecipe();