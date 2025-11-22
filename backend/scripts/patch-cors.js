const fs = require('fs');
const p = 'src/server.js';
let s = fs.readFileSync(p, 'utf8');

// A) Asegurar trust proxy tras la creación de app (si no existe)
if (!s.includes("app.set('trust proxy', 1)")) {
  s = s.replace(/const app = express\(\);/, "const app = express();\napp.set('trust proxy', 1);");
}

// B) Cambiar app.options('*', cors(corsOpts)); a Express 5 compatible
//    Usa el matcher '(.*)' y responde 204
const rx = /app\.options\(['"]\*['"]\s*,\s*cors\(corsOpts\)\s*\)\s*;?/;
if (rx.test(s)) {
  s = s.replace(rx, "app.options('(.*)', cors(corsOpts), (req, res) => res.sendStatus(204));");
}

fs.writeFileSync(p, s);
console.log('✅ Patched src/server.js (trust proxy + Express 5 preflight)');
