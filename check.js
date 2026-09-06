const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");
const c = fs.readFileSync("style.css", "utf8");
const a = fs.readFileSync("app.js", "utf8");
const checks = {
  olPreparo: h.includes('<ol id="recipe-instructions"'),
  cssSwapping: c.includes(".recipe-card.swapping") && c.includes("transition: opacity 0.3s"),
  cincoTemas: [1, 2, 3, 4, 5].every((n) => c.includes(".theme-" + n)),
  steamEBake: c.includes("steamRise") && c.includes("cakeBake"),
  jsModoBake: a.includes("Bolo Assando") && a.includes('"bake"'),
  jsSwapClass: a.includes('classList.add("swapping")') && a.includes('classList.remove("swapping")'),
  jsFetchBackend: a.includes('"/api/receita"'),
  botao: h.includes('id="btn-another"'),
};
console.log(JSON.stringify(checks, null, 1));
const fail = Object.entries(checks).filter(([, v]) => !v);
if (fail.length) {
  console.error("FALHOU: " + fail.map((f) => f[0]).join(", "));
  process.exit(1);
}
console.log("TAREFA 5 OK");