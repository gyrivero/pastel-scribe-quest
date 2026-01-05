# Pastel Scribe Quest

## Cómo probar la app paso a paso

Sigue estos pasos desde la raíz del repositorio (`/workspace/pastel-scribe-quest` si usas este entorno):

1. Instala dependencias (solo la primera vez o cuando cambie `package.json`):

   ```sh
   npm install
   ```

2. Arranca el servidor de desarrollo con recarga en caliente:

   ```sh
   npm run dev
   ```

   El terminal te mostrará la URL local (por defecto `http://localhost:5173`). Abre esa dirección en tu navegador o emulador móvil para probar la app.

3. Compila el proyecto para producción (opcional, para validar el build):

   ```sh
   npm run build
   ```

4. Vista previa del build (opcional, tras `npm run build`):

   ```sh
   npm run preview
   ```

5. Revisa el código con el linter (opcional; hay advertencias conocidas en componentes compartidos):

   ```sh
   npm run lint
   ```

Los comandos anteriores deben ejecutarse en la carpeta raíz del proyecto. Si trabajas fuera de este entorno, sustituye la ruta raíz por la ubicación donde clonaste el repositorio.

## Tecnologías principales

Este proyecto está construido con:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Cómo editar el código

Puedes usar tu IDE local o un entorno como GitHub Codespaces. Clona el repositorio, entra en la carpeta raíz y utiliza los mismos comandos de arriba (`npm install`, `npm run dev`, etc.) para trabajar de manera interactiva.
