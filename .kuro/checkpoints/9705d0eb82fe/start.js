const { spawn, exec } = require("child_process");

const URL = "http://localhost:3000";

function abrirNavegador(url) {
  if (process.platform === "win32") exec(`start "" "${url}"`);
  else if (process.platform === "darwin") exec(`open "${url}"`);
  else exec(`xdg-open "${url}"`);
}

async function esperarServidor() {
  for (let i = 0; i < 24; i++) {
    try {
      const r = await fetch(URL + "/api/receita");
      if (r.ok) return true;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

(async () => {
  const filho = spawn(process.execPath, ["server.js"], {
    stdio: "ignore",
    detached: true,
  });
  filho.unref();

  console.log("Iniciando servidor BoloMania...");
  const ok = await esperarServidor();

  if (ok) {
    abrirNavegador(URL);
    console.log("SITE NO AR: " + URL + " — navegador aberto!");
  } else {
    console.error("O servidor nao respondeu em " + URL + ". Verifique se a porta 3000 esta livre.");
    process.exit(1);
  }
})();