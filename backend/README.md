# News Explorer – Backend

API en Node/Express + MongoDB para autenticación y gestión de artículos guardados.

## Configuración

Coloca las variables en un archivo .env (ver .env.example):

- PORT (por defecto 8080)
- MONGODB_URI (cadena de conexión Mongo)
- JWT_SECRET (firma de tokens)
- CORS_ORIGIN (lista separada por comas; por ejemplo, URL del frontend en Render y localhost)
- NODE_ENV (development o production)

## Scripts

- npm run dev (modo desarrollo con watch)
- npm start (modo producción)

## Endpoints

- GET /healthz (salud)
- POST /auth/signup (registro)
- POST /auth/signin (login)
- GET /auth/me (perfil; requiere Authorization: Bearer token)
- GET /articles (listar; auth)
- POST /articles (crear; auth)
- DELETE /articles/:id (eliminar; auth)
