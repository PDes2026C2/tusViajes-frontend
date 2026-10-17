# TusViajes - Frontend Web Application

Frontend SPA de la plataforma **TusViajes**, desarrollado con React 19, TypeScript, Vite y Tailwind CSS.

---

## 🛠 Tecnologías

- **Lenguaje y Entorno:** [TypeScript 6](https://www.typescriptlang.org/) & [Node.js](https://nodejs.org/) (v20+ LTS / v22)
- **Framework Principal:** [React 19](https://react.dev/) (`react` 19.2.8, `react-dom`)
- **Herramienta de Build & Bundler:** [Vite 8](https://vite.dev/) (`@vitejs/plugin-react`)
- **Estilos y Componentes UI:**
  - [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
  - [Base UI](https://base-ui.com/) (`@base-ui/react`)
  - Iconos: [Lucide React](https://lucide.dev/) (`lucide-react`)
  - Utilidades CSS: `clsx`, `tailwind-merge`, `class-variance-authority`
  - Componentes complementarios: `react-day-picker`, `react-toastify`, `react-country-flag`
- **Manejo de Estado Global:** [Zustand](https://zustand.docs.pmnd.rs/) (stores centralizados y modulares)
- **Enrutamiento:** [React Router DOM v7](https://reactrouter.com/) (soporte de rutas públicas, protegidas y por rol)
- **Formularios y Validación:**
  - [React Hook Form](https://react-hook-form.com/) para gestión del estado de formularios
  - [Zod 4](https://zod.dev/) para esquemas de validación desacoplados
- **Cliente HTTP y Autenticación:**
  - [Axios](https://axios-http.com/) con interceptores para token JWT y flujo de refresh token (401)
- **Testing:**
  - **Unitarios & Componentes:** [Vitest 5](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + JSDOM
  - **End-to-End (E2E):** [Playwright](https://playwright.dev/)
  - **Cobertura:** `@vitest/coverage-v8`
- **Calidad de Código y Análisis:**
  - [Oxlint](https://oxc.rs/)
  - [SonarCloud](https://sonarcloud.io/)
- **Despliegue y Contenedores:**
  - Multi-stage [Dockerfile](Dockerfile) (etapa de compilación con Node y etapa de ejecución con servidor web Nginx Alpine preparado para SPA)

---

## 📋 Prerrequisitos

Para ejecutar y desarrollar en este proyecto se requiere:

1. **Node.js:** Versión 20 LTS o superior (recomendado v20.x o v22.x).
2. **NPM:** Gestor de paquetes incluido con Node.js (v10+).
3. **Git:** Para el control de versiones.
4. **Backend TusViajes en ejecución:** La aplicación consume la API backend (por defecto en `http://localhost:8080/api`).
5. **Docker:** *(Opcional)* Requerido si se desea compilar y ejecutar el frontend dentro de un contenedor Nginx.

---

## 🧪 Cómo ejecutar los tests

### 1. Tests Unitarios y de Integración (Vitest + Testing Library)

- **Modo interactivo (Watch):**
  ```bash
  npm test
  ```

- **Ejecución única (modo CI):**
  ```bash
  npm test -- --run
  ```

- **Ejecutar tests con reporte de cobertura (V8):**
  ```bash
  npm run test:coverage
  ```
  El reporte en HTML se genera automáticamente en el directorio `coverage/index.html`.

- **Ejecutar un archivo de test específico:**
  ```bash
  npm test -- useSearch.test.ts
  ```

### 2. Tests End-to-End (Playwright)

Los tests E2E se encuentran en el directorio `tests/`.

- **Instalación de navegadores de Playwright** *(solo la primera vez)*:
  ```bash
  npx playwright install --with-deps
  ```

- **Ejecutar tests E2E:**
  ```bash
  npm run test:e2e
  ```

- **Visualizar el reporte interactivo de Playwright:**
  ```bash
  npx playwright show-report
  ```

### 3. Linter (Oxlint)

Para analizar el código y detectar problemas de sintaxis o malas prácticas:
```bash
npm run lint
```

---

## 🚀 Cómo levantar la app

### Opción 1: Modo Desarrollo Local con Vite

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno (Opcional):**
   Por defecto, las peticiones HTTP apuntan a `http://localhost:8080/api`. Si tu backend corre en otro host o puerto, crea un archivo `.env` o `.env.local` en la raíz del proyecto:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación se iniciará en [http://localhost:5173](http://localhost:5173) con Hot Module Replacement (HMR).

---

### Opción 2: Build de Producción y Preview Local

1. **Compilar la aplicación:**
   ```bash
   npm run build
   ```
   Esto ejecuta la validación de tipos de TypeScript (`tsc -b`) y genera los archivos estáticos optimizados en la carpeta `dist/`.

2. **Previsualizar la compilación de producción:**
   ```bash
   npm run preview
   ```
   Inicia un servidor local para verificar el comportamiento exacto de los archivos en `dist/`.

---

### Opción 3: Ejecución con Docker (Nginx)

El proyecto cuenta con un `Dockerfile` multi-stage que compila la aplicación y la sirve a través de Nginx con configuración para Single Page Application (SPA):

1. **Construir la imagen de Docker:**
   ```bash
   docker build -t tusviajes-frontend .
   ```
   *Si necesitas cambiar la URL de la API durante la compilación:*
   ```bash
   docker build --build-arg VITE_API_URL=http://localhost:8080/api -t tusviajes-frontend .
   ```

2. **Iniciar el contenedor:**
   ```bash
   docker run -p 80:80 --name tusviajes-frontend-app tusviajes-frontend
   ```
   La aplicación estará accesible en [http://localhost:80](http://localhost:80).
