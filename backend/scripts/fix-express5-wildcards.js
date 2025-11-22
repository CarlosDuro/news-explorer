const fs = require('fs');
const path = 'src/server.js';
let s = fs.readFileSync(path, 'utf8');

// A) trust proxy tras crear app
if (!s.includes("app.set('trust proxy', 1)")) {
  s = s.replace(/const app = express\(\);/, "const app = express();\napp.set('trust proxy', 1);");
}

// B) Quitar app.options('*', ...) (cors() global maneja preflight en Express 5)
s = s.replace(/app\.options\(\s*['"]\*['"]\s*,[^)]*\)\s*;?/g, '');

// C) Cambiar otros comodines '*' a '(.*)' en use/all para Express 5
s = s.replace(/app\.(use|all)\(\s*['"]\*['"]\s*,/g, "app.$1('(.*)',");

// (Opcional) Si tuvieras router.*('*', ...) también:
s = s.replace(/router\.(use|all|options)\(\s*['"]\*['"]\s*,/g, "router.$1('(.*)',");

fs.writeFileSync(path, s);
console.log('✅ server.js parcheado (trust proxy + sin options(*) + comodines a (.*))');
