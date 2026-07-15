# Desplegar ciemsi-backend en Railway

Guía paso a paso para publicar la API y la base de datos en Railway. El código ya está preparado (SSL de Postgres, credenciales de Firebase por variable de entorno, `.env.example`).

## 1. Crear la cuenta y el proyecto

1. Entra a https://railway.app y crea una cuenta (puedes usar tu cuenta de GitHub).
2. Click en **New Project**.
3. Elige **Provision PostgreSQL** — esto crea la base de datos. Railway genera automáticamente una variable `DATABASE_URL` dentro de ese servicio.

## 2. Subir el código y crear el servicio de la API

1. Antes de continuar, avísame para revisar juntos los cambios pendientes (`git status`) y decidir qué se commitea — no voy a hacer commit/push sin que lo confirmes.
2. Una vez el repo esté actualizado en GitHub (`git push`), en el mismo proyecto de Railway click en **New** → **GitHub Repo** → selecciona `ciemsi-backend`.
3. Railway detecta que es un proyecto Node.js (por `package.json`) y usa automáticamente `npm start` (`node src/index.js`) — no hace falta Dockerfile ni Procfile.

## 3. Configurar las variables de entorno

En el servicio de la API (no en el de Postgres) ve a **Variables** y agrega, usando `.env.example` como referencia:

- `DATABASE_URL` → click en "Add Reference" y selecciona la variable `DATABASE_URL` del servicio Postgres (así quedan conectados automáticamente, sin copiar/pegar la cadena a mano).
- `JWT_SECRET`, `JWT_EXPIRES_IN` → los mismos valores que usas en tu `.env` local (o genera un `JWT_SECRET` nuevo si prefieres invalidar sesiones viejas).
- `EMAIL_USER`, `EMAIL_PASS`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_DRIVE_FOLDER_ID` → los mismos valores actuales, no cambian con el despliegue.
- `OPENAI_API_KEY`, `GEMINI_API_KEY`
- `FIREBASE_CREDENTIALS_BASE64` → genera el valor desde tu archivo local `src/infrastructure/services/firebase-credentials.json`:
  ```powershell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("src/infrastructure/services/firebase-credentials.json")) | Set-Clipboard
  ```
  y pega el contenido del portapapeles como valor de la variable.

No necesitas configurar `PORT` — Railway lo inyecta automáticamente y el código ya lo respeta (`process.env.PORT`).

## 4. Restaurar la base de datos

Ya generé un dump completo de tu base de datos local (esquema + todos los datos actuales) en:
`ciemsi_dump.sql` (te lo indico por separado, no se sube al repo).

1. En Railway, entra al servicio de Postgres → pestaña **Connect** → copia la "Connection URL" pública (`postgresql://postgres:...@....railway.app:PUERTO/railway`).
2. Desde tu máquina, restaura el dump con el mismo `psql` de PostgreSQL 18 que ya tienes instalado (`C:\Program Files\PostgreSQL\18\bin\psql.exe`), para que entienda los comandos `\restrict` que genera `pg_dump` 18:
   ```powershell
   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" "postgresql://postgres:CONTRASEÑA@HOST.railway.app:PUERTO/railway" -f "ruta\a\ciemsi_dump.sql"
   ```
3. Verifica que las tablas quedaron: en la misma sesión de `psql`, `\dt` debería listar las 32 tablas (usuarios, pacientes, citas_medicas, etc.).

## 5. Probar el despliegue

1. En el servicio de la API, pestaña **Settings** → **Networking** → **Generate Domain** te da una URL pública tipo `https://ciemsi-backend-production.up.railway.app`.
2. Abre esa URL en el navegador — debería responder `{"mensaje": "🚀 Servidor CIEMSI funcionando"}`.
3. Pásame esa URL para terminar de configurar la app Flutter apuntando a ella y generar el APK final.

## Notas

- El Google OAuth (Drive, login con Google) no necesita ningún cambio en Google Cloud Console: el Client ID sigue siendo el mismo, y el flujo actual no depende del dominio del backend.
- El almacenamiento estático de PDFs (`/public`) vive en el filesystem del contenedor de Railway, que **no es persistente entre despliegues** — si algún PDF generado necesita sobrevivir reinicios/redeploys, avísame para moverlo a Drive o a un bucket, pero no es necesario para esta primera versión.
