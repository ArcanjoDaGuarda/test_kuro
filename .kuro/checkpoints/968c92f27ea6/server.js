const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

/* ---------- Fallback local (usado se a TheMealDB falhar) ---------- */
const LOCAL_RECIPES = [
  {
    nome: "Bolo de Chocolate Fofinho",
    origem: "Brasil",
    categoria: "Sobremesa",
    ingredientes: [
      { nome: "Farinha de trigo", medida: "2 xícaras" },
      { nome: "Açúcar", medida: "1 1/2 xícara" },
      { nome: "Chocolate em pó", medida: "1 xícara" },
      { nome: "Ovos", medida: "3 unidades" },
      { nome: "Leite", medida: "1 xícara" },
      { nome: "Óleo", medida: "1/2 xícara" },
      { nome: "Fermento em pó", medida: "1 colher (sopa)" }
    ],
    preparo: [
      "Bata no liquidificador os ovos, o leite, o óleo e o açúcar.",
      "Adicione o chocolate em pó e a farinha, batendo até homogeneizar.",
      "Por último, misture o fermento delicadamente.",
      "Despeje em forma untada e asse a 180°C por cerca de 40 minutos."
    ]
  },
  {
    nome: "Bolo de Cenoura com Cobertura",
    origem: "Brasil",
    categoria: "Sobremesa",
    ingredientes: [
      { nome: "Cenoura picada", medida: "3 unidades médias" },
      { nome: "Açúcar", medida: "2 xícaras" },
      { nome: "Óleo", medida: "1 xícara" },
      { nome: "Ovos", medida: "4 unidades" },
      { nome: "Farinha de trigo", medida: "2 xícaras" },
      { nome: "Fermento em pó", medida: "1 colher (sopa)" },
      { nome: "Chocolate em pó para cobertura", medida: "4 colheres (sopa)" },
      { nome: "Manteiga para cobertura", medida: "2 colheres (sopa)" }
    ],
    preparo: [
      "Bata no liquidificador a cenoura, os ovos, o óleo e o açúcar.",
      "Transfira para uma tigela e misture a farinha e o fermento.",
      "Asse em forma untada a 180°C por 40 minutos.",
      "Para a cobertura, aqueça o chocolate em pó, a manteiga e meio copo de leite até engrossar e despeje sobre o bolo."
    ]
  },
  {
    nome: "Bolo de Laranja Molhadinho",
    origem: "Brasil",
    categoria: "Sobremesa",
    ingredientes: [
      { nome: "Laranjas com casca", medida: "2 unidades" },
      { nome: "Ovos", medida: "3 unidades" },
      { nome: "Açúcar", medida: "2 xícaras" },
      { nome: "Óleo", medida: "1/2 xícara" },
      { nome: "Farinha de trigo", medida: "2 xícaras" },
      { nome: "Fermento em pó", medida: "1 colher (sopa)" },
      { nome: "Suco de laranja para calda", medida: "1 xícara" }
    ],
    preparo: [
      "Bata no liquidificador as laranjas picadas (sem sementes), os ovos, o óleo e o açúcar.",
      "Misture a farinha e o fermento em uma tigela.",
      "Asse a 180°C por 35 minutos.",
      "Ao sair do forno, regue com o suco de laranja misturado com açúcar para deixar molhadinho."
    ]
  },
  {
    nome: "Bolo de Fubá Cremoso",
    origem: "Brasil",
    categoria: "Sobremesa",
    ingredientes: [
      { nome: "Fubá", medida: "2 xícaras" },
      { nome: "Leite", medida: "3 xícaras" },
      { nome: "Açúcar", medida: "2 xícaras" },
      { nome: "Ovos", medida: "3 unidades" },
      { nome: "Óleo", medida: "1/2 xícara" },
      { nome: "Queijo parmesão ralado", medida: "1/2 xícara" },
      { nome: "Fermento em pó", medida: "1 colher (sopa)" }
    ],
    preparo: [
      "Bata todos os ingredientes no liquidificador, exceto o fermento.",
      "Acrescente o fermento e bata rapidamente apenas para misturar.",
      "Despeje em forma untada e enfarinhada.",
      "Asse a 180°C por aproximadamente 45 minutos, até dourar."
    ]
  },
  {
    nome: "Bolo de Banana com Canela",
    origem: "Brasil",
    categoria: "Sobremesa",
    ingredientes: [
      { nome: "Bananas maduras", medida: "4 unidades" },
      { nome: "Açúcar", medida: "2 xícaras" },
      { nome: "Ovos", medida: "3 unidades" },
      { nome: "Óleo", medida: "1/2 xícara" },
      { nome: "Farinha de trigo", medida: "2 xícaras" },
      { nome: "Canela em pó", medida: "1 colher (sopa)" },
      { nome: "Fermento em pó", medida: "1 colher (sopa)" }
    ],
    preparo: [
      "Amasse as bananas e misture com os ovos, o óleo e o açúcar.",
      "Adicione a farinha, a canela e por fim o fermento.",
      "Despeje em forma untada e polvilhe canela com açúcar por cima.",
      "Asse a 180°C por 40 minutos."
    ]
  }
];

/* ---------- Integração TheMealDB ---------- */
const API_BASE = "https://www.themealdb.com/api/json/v1/1";

async function fetchComTimeout(url, ms = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

let cacheBolos = null;

async function getListaBolos() {
  if (cacheBolos) return cacheBolos;
  const data = await fetchComTimeout(API_BASE + "/search.php?s=cake");
  const meals = (data && data.meals) || [];
  if (!meals.length) throw new Error("A API nao retornou bolos");
  cacheBolos = meals;
  return meals;
}

function parseMeal(meal) {
  const ingredientes = [];
  for (let i = 1; i <= 20; i++) {
    const nome = (meal["strIngredient" + i] || "").trim();
    const medida = (meal["strMeasure" + i] || "").trim();
    if (nome) ingredientes.push({ nome, medida: medida || "a gosto" });
  }
  const preparo = (meal.strInstructions || "")
    .split(/\r?\n+/)
    .map((s) => s.replace(/^\s*\d+[.)]?\s*/, "").replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 3);

  return {
    fonte: "themealdb",
    id: meal.idMeal,
    nome: meal.strMeal,
    categoria: meal.strCategory || "Sobremesa",
    origem: meal.strArea || "Internacional",
    imagem: meal.strMealThumb || null,
    ingredientes,
    preparo
  };
}

app.get("/api/receita", async (req, res) => {
  try {
    const meals = await getListaBolos();
    const meal = meals[Math.floor(Math.random() * meals.length)];
    res.json(parseMeal(meal));
  } catch (e) {
    const local = LOCAL_RECIPES[Math.floor(Math.random() * LOCAL_RECIPES.length)];
    res.json({ ...local, fonte: "local" });
  }
});

app.listen(PORT, () => {
  console.log("BoloMania rodando em http://localhost:" + PORT);
});