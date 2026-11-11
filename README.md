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

Para levantar el stack completo con [Docker Compose](#stack-completo-con-docker-compose), solo se necesitan Git y Docker Desktop / Docker Engine en ejecución, con Compose v2.17 o superior y contenedores Linux.

Para desarrollar el frontend localmente con Vite se requiere:

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

### Stack completo con Docker Compose

Desde este repositorio se pueden levantar los cuatro servicios con Docker Compose v2.17 o superior. Solo se necesitan Git y Docker con soporte para contenedores Linux; no hace falta instalar Java, Node ni clonar las APIs.

Ejecutar desde la raíz de `tusViajes-frontend`, donde está el archivo [`compose.yaml`](compose.yaml). Si todavía no se clonó el repositorio:

```bash
git clone https://github.com/PDes2026C2/tusViajes-frontend.git
cd tusViajes-frontend
```

```bash
docker compose up -d --build --wait --wait-timeout 240
```

Si los repositorios están en carpetas hermanas, también se puede ejecutar desde la raíz del backend o de la API de vuelos indicando el Compose del frontend:

```bash
docker compose --project-directory ../tusViajes-frontend -f ../tusViajes-frontend/compose.yaml up -d --build --wait --wait-timeout 240
```

El archivo global se mantiene únicamente en este repositorio. `--project-directory` establece el frontend como directorio del proyecto, incluida su configuración `.env`. Para consultar el estado, ver logs o detener el stack desde otra carpeta, conservar las mismas opciones y reemplazar `up ...` por `ps`, `logs -f` o `down`.

El frontend se compila desde este checkout. Las APIs se descargan de Docker Hub, usando las imágenes `rodribolanos/pdes-2026c2-externalservice:main` y `rodribolanos/pdes-2026c2-backend:main`, publicadas por sus workflows de `main`.

Los cambios locales en los repositorios de las APIs no se incorporan a estas imágenes: para probarlos se deben ejecutar esas APIs desde sus propios repositorios. El frontend se sirve como una compilación de producción con Nginx; para trabajar con recarga automática, usar la opción de desarrollo con Vite.

El orden de inicio es **PostgreSQL 16 → API de vuelos → Backend → Frontend**. Cada servicio espera a que el control de salud de su dependencia responda correctamente. Compose crea la red y el volumen de PostgreSQL automáticamente.

| Servicio | Dirección predeterminada |
|---|---|
| Frontend | http://localhost:5173 |
| Swagger del backend | http://localhost:8080/swagger-ui/index.html |
| API de vuelos | http://localhost:8081/flights |
| PostgreSQL | `localhost:5432` |

El navegador accede al backend mediante `/api` en el mismo origen del frontend; Nginx reenvía esas peticiones al servicio `backend:8080`. Las direcciones internas de Docker no se usan desde el navegador. La compilación del frontend recibe `VITE_API_URL=/api` desde Compose.

Para cambiar puertos, credenciales locales o imágenes, copiar `.env.example` a `.env` y editarlo antes del primer arranque. Por ejemplo, si ya están levantados los servicios de desarrollo, se pueden usar `FRONTEND_PORT=5174`, `BACKEND_PORT=18080`, `FLIGHTS_PORT=18081` y `POSTGRES_PORT=15433`. `.env` no se versiona. Los cambios de credenciales de PostgreSQL deben coincidir con los del volumen existente.

Ambas APIs usan la misma base: las migraciones de vuelos inicializan países, ciudades, vuelos y sus tablas de pasajeros; el backend reutiliza esos datos e inicializa hoteles y la cuenta administradora. Los procesos Java usan UTC.

El volumen de este Compose es independiente de las bases de prueba o demos que ya existan en la máquina. Un volumen nuevo comienza sin agencias, compradores ni paquetes comprados: se pueden registrar desde la aplicación. La cuenta administradora inicial es `admin@tusviajes.com` / `admin123`.

```bash
# Ver el estado y los logs
docker compose ps
docker compose logs -f

# Descargar versiones nuevas de las APIs y reconstruir el frontend
docker compose pull flights-api backend
docker compose up -d --build --wait --wait-timeout 240

# Detener y quitar los contenedores, conservando los datos
docker compose down

# Borrar también los datos de este Compose y empezar de cero
docker compose down --volumes
```

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
