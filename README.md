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

Los cambios locales en los repositorios de las APIs no se incorporan a estas imágenes. Para probarlos se puede usar la [construcción local de las APIs](#construcción-local-de-las-apis) o ejecutarlas desde sus propios repositorios. El frontend se sirve como una compilación de producción con Nginx; para trabajar con recarga automática, usar la opción de desarrollo con Vite.

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

Para inicializar la agencia de ejemplo en una base sin agencias, definir una contraseña
para ese entorno en `TUSVIAJES_BOOTSTRAP_AGENCY_PASSWORD` dentro de `.env` antes de
levantar el backend. La carga automática de los paquetes de ejemplo requiere una agencia
en la base. La variable se usa sólo al crear la cuenta, por lo que una instancia que
ya tenía la contraseña anterior necesita cambiarla por separado.

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

### Observabilidad con Prometheus y Grafana

El perfil opcional `observability` agrega Prometheus, Grafana, Loki, Alloy y Tempo al stack. Prometheus consulta las métricas de ambas APIs cada 15 segundos; Alloy recoge sus logs y los envía a Loki. Las APIs instrumentadas pueden enviar trazas a Tempo. Grafana inicia con las tres fuentes configuradas automáticamente.

Para activar la exportación de trazas al usar este perfil, configurar `TRACING_EXPORT_ENABLED=true` en `.env`, como se explica en [Trazas distribuidas](#trazas-distribuidas).

Este perfil requiere imágenes de las APIs que incluyan la instrumentación con Actuator y Micrometer. Mientras esos cambios no estén publicados en Docker Hub, usar la construcción local que se describe a continuación.

#### Construcción local de las APIs

Para probar cambios antes de mergearlos, clonar los tres repositorios en carpetas hermanas y seleccionar las ramas que se quieran probar:

```text
proyecto/
  tusViajes-frontend/
  tusViajes-web-app/
  flights-backend/
```

Desde `tusViajes-frontend`, ejecutar:

```bash
docker compose -f compose.yaml -f compose.local.yaml --profile observability up -d --build --wait --wait-timeout 240
```

El archivo `compose.local.yaml` construye las imágenes de las APIs con sus Dockerfiles. Los requisitos siguen siendo Git y Docker: Java, Maven y Node se ejecutan dentro de los contenedores. Conservar las opciones `-f` y `--profile observability` al consultar el estado o administrar este entorno.

Este modo utiliza la misma base persistente del stack. Para una prueba aislada, agregar `-p tusviajes-observability`, indicar otro archivo de variables con `--env-file` y elegir puertos libres mediante `FRONTEND_PORT`, `BACKEND_PORT`, `FLIGHTS_PORT`, `POSTGRES_PORT`, `PROMETHEUS_PORT` y `GRAFANA_PORT`.

#### Arranque con imágenes publicadas

Cuando las imágenes publicadas de ambas APIs incluyan la instrumentación, basta con clonar este repositorio y ejecutar:

```bash
docker compose pull backend flights-api
docker compose --profile observability up -d --build --wait --wait-timeout 240
```

El comando habitual sin `--profile observability` levanta los cuatro servicios originales. El perfil agrega cinco servicios de observabilidad, nueve en total:

| Servicio | Dirección predeterminada |
|---|---|
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Loki | Interno: `loki:3100`; se consulta desde Grafana. |
| Alloy | Interno: `alloy:12345`; recoge los logs de las APIs. |
| Tempo | Interno: `tempo:3200` para consultas y `tempo:4318` para recibir trazas OTLP HTTP. |

Grafana inicia con las credenciales locales `admin` / `admin`. Se pueden cambiar mediante `GRAFANA_ADMIN_USER` y `GRAFANA_ADMIN_PASSWORD` en `.env`; estas variables inicializan la cuenta al crear su volumen por primera vez. Los puertos se pueden configurar con `GRAFANA_PORT` y `PROMETHEUS_PORT`.

Prometheus conserva hasta siete días de métricas en un volumen persistente. Grafana utiliza otro volumen para sus datos. La conexión a Prometheus se mantiene en `docker/observability/grafana/provisioning/datasources/prometheus.yaml` y se carga automáticamente al iniciar.

Las APIs exponen sus métricas en los puertos internos de gestión `backend:9091` y `flights-api:9092`. Esos puertos no se publican en el host ni se reenvían mediante el proxy del frontend. La configuración de Prometheus utiliza los nombres de servicio de la red Docker.

#### Comprobar la recolección de métricas

1. Ejecutar `docker compose --profile observability ps` y verificar que los nueve servicios estén en ejecución y los que incluyen healthcheck estén saludables. Loki y Tempo utilizan imágenes sin shell. La disponibilidad HTTP de Loki se comprueba desde el healthcheck de Alloy; la de Tempo se puede comprobar con **Save & test** en su fuente de Grafana. Si se usa la construcción local, conservar también las dos opciones `-f`.
2. En Prometheus, abrir `/targets` y comprobar que `backend` y `flights-api` estén `UP`.
3. En Grafana, abrir **Explore**, elegir la fuente **Prometheus** y consultar `up{job=~"backend|flights-api"}`. Debe aparecer un valor `1` por cada API.
4. Navegar por la aplicación y consultar `http_server_requests_seconds_count` para observar las peticiones registradas. Para consultar memoria de Java, usar `jvm_memory_used_bytes`.

`UP` significa que Prometheus pudo consultar el endpoint de métricas del servicio. Los controles de salud del Compose también generan tráfico de API. La primera recolección puede tardar hasta 15 segundos.

#### Dashboard de las APIs

El dashboard **TusViajes - Métricas de las APIs** se carga automáticamente en la carpeta **TusViajes** de Grafana y se utiliza como página de inicio predeterminada. También se puede abrir directamente en http://localhost:3000/d/tusviajes-overview, adaptando el puerto si se cambió `GRAFANA_PORT`.

El filtro **Servicio** permite elegir `backend`, `flights-api` o ambos. El período inicial muestra los últimos 15 minutos y los datos se actualizan cada 15 segundos.

| Panel | Qué muestra |
|---|---|
| Estado de métricas | Resultado de la consulta de métricas de Prometheus: `UP` o `DOWN` por API. |
| Peticiones por segundo | Tasa de peticiones HTTP de cada API. |
| Errores HTTP 5xx | Porcentaje de respuestas 5xx respecto del tráfico de cada API. |
| Latencia p95 por endpoint | Tiempo de respuesta aproximado del percentil 95, separado por servicio, método y ruta. |
| Tráfico por estado HTTP | Peticiones por segundo agrupadas por código de respuesta, incluidos los 4xx. |
| Memoria heap de Java | Memoria usada y máximo informado por los pools de heap. |
| CPU del proceso Java | Uso de CPU del proceso de cada API. |
| Conexiones a PostgreSQL | Conexiones activas, libres, pendientes y límite de cada pool Hikari. |
| Hilos de Java | Cantidad de hilos vivos de cada JVM. |

Las tasas y el p95 excluyen las rutas de Actuator y `/error`. Los controles de salud del Compose siguen generando tráfico de API. Las consultas de tasas utilizan `$__rate_interval` para adaptar la ventana al intervalo de recolección y al período mostrado; esperar al menos un minuto después del arranque para reunir muestras. El p95 muestra los endpoints que tuvieron tráfico en la ventana de cada consulta; sin solicitudes recientes puede mostrar `No data`. Cero conexiones activas es normal cuando la API está en reposo.

La definición del dashboard está en `docker/observability/grafana/dashboards/tusviajes.json`; su carga automática se configura en `docker/observability/grafana/provisioning/dashboards/tusviajes.yaml`. Los cambios permanentes se realizan en esos archivos y se versionan en Git. Grafana vuelve a revisar el JSON cada 30 segundos y no permite guardar modificaciones de este tablero desde la interfaz.

Para aplicar este cambio a un entorno que ya estaba levantado, ejecutar de nuevo el comando de arranque con el perfil `observability`. Compose recreará Grafana para incorporar la nueva configuración y el montaje del dashboard. Conservar las opciones `-f`, `-p` y `--env-file` si se usaron al crear el entorno.

#### Alertas de las APIs

Prometheus evalúa las reglas de `docker/observability/rules/alerts.yml` cada 15 segundos. Se pueden consultar en http://localhost:9090/alerts, adaptando el puerto si se cambió `PROMETHEUS_PORT`.

| Alerta | Condición | Tiempo sostenido | Severidad |
|---|---|---|---|
| `ApiMetricsUnavailable` | Prometheus no puede recolectar las métricas de una API (`up = 0`). | 1 minuto | `critical` |
| `ApiHighServerErrorRate` | Más del 5 % de respuestas 5xx por API en una ventana de 5 minutos, con al menos 20 solicitudes estimadas en esa ventana. | 2 minutos | `warning` |
| `ApiHighLatency` | p95 superior a 1 segundo por servicio, método y ruta en una ventana de 5 minutos, con al menos 20 solicitudes estimadas para ese endpoint en esa ventana. | 5 minutos | `warning` |

Los umbrales son valores iniciales para este proyecto y se ajustan editando las reglas después de observar el comportamiento normal y las pruebas de carga. Las alertas HTTP excluyen Actuator y `/error`, igual que el dashboard. Los 4xx no cuentan como errores del servidor, aunque forman parte del total de peticiones. `increase` estima la cantidad de solicitudes a partir de las muestras de Prometheus; el mínimo de tráfico evita alertas por unas pocas solicitudes aisladas.

Las reglas usan los estados `inactive` (condición no cumplida), `pending` (condición cumplida, esperando el tiempo sostenido) y `firing` (alerta activa). Cuando la condición deja de cumplirse, la alerta se resuelve en la siguiente evaluación. La pérdida de métricas indica un problema de recolección: puede deberse a una API detenida, a su endpoint de métricas o a la conectividad.

Este bloque muestra las alertas en Prometheus. Para recibir notificaciones por correo u otros canales hace falta configurar Alertmanager y sus destinatarios.

Para incorporar el montaje de reglas a un entorno existente, ejecutar de nuevo el comando de arranque con el perfil `observability`, conservando las opciones `-f`, `-p` y `--env-file` usadas al crearlo. Si sólo cambia el contenido de una regla, reiniciar Prometheus con `docker compose --profile observability restart prometheus`, conservando también esas opciones. Comprobar en `/rules` que las tres reglas tengan estado de salud `ok`.

##### Pruebas de las alertas

Los casos de `docker/observability/tests/alerts.test.yml` se ejecutan con `promtool`, incluido en la misma imagen de Prometheus que usa Compose. Simulan el paso del tiempo y las métricas para comprobar la activación, las esperas, la recuperación y la ausencia de falsos avisos por poco tráfico, respuestas 4xx o rutas excluidas.

Desde la raíz del repositorio, con Docker disponible, ejecutar los siguientes comandos. Funcionan en Bash y PowerShell y no requieren levantar la aplicación:

```bash
docker run --rm --entrypoint promtool -v "${PWD}/docker/observability:/etc/prometheus:ro" -w /etc/prometheus prom/prometheus:v3.13.5 check config prometheus.yml
docker run --rm --entrypoint promtool -v "${PWD}/docker/observability:/etc/prometheus:ro" -w /etc/prometheus/tests prom/prometheus:v3.13.5 test rules alerts.test.yml
```

El workflow **Observabilidad** ejecuta estas verificaciones cuando cambian los archivos de observabilidad en un push o un pull request hacia `main`. También se puede ejecutar manualmente desde GitHub Actions.

#### Logs y correlación de solicitudes

Con las versiones instrumentadas de ambas APIs, los logs se escriben en JSON en la salida estándar de los contenedores. Cada registro incluye fecha, nivel y nombre del servicio; cada solicitud HTTP de negocio agrega un registro final con `requestId`, `httpMethod`, `httpRoute`, `httpStatus` y `durationMs`.

El encabezado `X-Request-ID` permite relacionar una respuesta con sus logs. Las APIs reutilizan los UUID canónicos válidos recibidos, normalizándolos a minúsculas, y generan uno nuevo si falta o es inválido. El backend transmite ese mismo ID cuando llama a la API de vuelos. La duración de cada registro corresponde al procesamiento de ese servicio. El contexto de correlación se limita al procesamiento síncrono de cada solicitud.

Para consultar los logs desde este repositorio:

```bash
docker compose -f compose.yaml -f compose.local.yaml --profile observability logs --tail=50 backend flights-api
```

Conservar también las opciones `-p` y `--env-file` si se utilizaron al crear el entorno. Este comando funciona aunque no se haya activado el perfil de monitoreo, porque los logs los producen las propias APIs.

Para probar la correlación a través del proxy del frontend:

```bash
curl -i -H "X-Request-ID: 09c409d2-cf9b-4a33-a5f5-388dcf4de99e" http://localhost:5173/api/countries
```

En PowerShell, usar `curl.exe`. Adaptar el puerto si se cambió `FRONTEND_PORT`. La respuesta debe contener el encabezado `X-Request-ID` enviado y en los logs del backend debe aparecer ese `requestId`. Para seguir una llamada entre las dos APIs, consultar `/api/flights` con un usuario autorizado y buscar el ID de esa respuesta en los logs de ambos servicios.

Los registros HTTP usan la plantilla de la ruta, sin parámetros de consulta, cuerpos ni encabezados de autenticación. Si no se resolvió un controlador, por ejemplo ante un rechazo de seguridad, `httpRoute` aparece como `UNMAPPED`. Las rutas de Actuator quedan excluidas del registro de solicitudes. Las pruebas de estos comportamientos y de la propagación del ID se mantienen en los repositorios de las APIs.

#### Consultar los logs desde Grafana

Alloy descubre los contenedores de Docker cada cinco segundos y recoge únicamente los servicios `backend` y `flights-api` del mismo proyecto Compose. Recibe automáticamente el nombre real del proyecto, incluso si se cambió con `-p`, para mantener separados los entornos. Accede al motor mediante el socket `/var/run/docker.sock`, montado en el contenedor; este perfil requiere Docker con contenedores Linux y acceso a ese socket, como el entorno de Docker Desktop utilizado para este proyecto.

Loki conserva los logs en un volumen persistente con una política de retención de siete días. La eliminación la realiza el compactor de forma asíncrona, por lo que puede demorarse después de cumplido ese período. Alloy conserva sus posiciones de lectura en otro volumen para continuar después de reiniciarse. Loki y Alloy utilizan la red interna de Docker, sin publicar puertos adicionales en la computadora.

Para buscar una solicitud:

1. Abrir Grafana y entrar a **Explore**.
2. Seleccionar la fuente **Loki**, cambiar el editor a **Code** y elegir un período reciente, por ejemplo los últimos 15 minutos.
3. Ejecutar alguna de estas consultas LogQL:

```logql
# Logs de las dos APIs.
{service_name=~"backend|flights-api"}

# Logs del backend.
{service_name="backend"}

# Seguir el ID de una solicitud en ambas APIs.
{service_name=~"backend|flights-api"} | json | requestId="09c409d2-cf9b-4a33-a5f5-388dcf4de99e"

# Respuestas HTTP con error del servidor.
{service_name=~"backend|flights-api"} | json | httpStatus >= 500 | __error__=""
```

Reemplazar el ID del ejemplo por el recibido en `X-Request-ID`. Se puede generar con el comando `curl` de la sección anterior. La primera recolección puede tardar algunos segundos. `service_name` identifica al servicio de Compose; el JSON original conserva además el nombre de la aplicación (`tusViajes` o `flights`). El ID se filtra al consultar el contenido JSON, sin convertir cada solicitud en una etiqueta indexada de Loki.

Para aplicar este bloque, repetir el comando de arranque con el perfil `observability`, conservando las opciones de archivos, proyecto y variables del entorno existente. Compose incorporará Loki y Alloy. Si Grafana ya estaba levantado, reiniciarlo para que lea el nuevo archivo de la fuente:

```bash
docker compose --profile observability restart --no-deps grafana
```

Conservar también las opciones `-f`, `-p` y `--env-file` del entorno al reiniciar. Si sólo se modifican los archivos de configuración de Loki o Alloy, reiniciar el servicio afectado para recargarlo.

Las configuraciones están en `docker/observability/loki/config.yml`, `docker/observability/alloy/config.alloy` y `docker/observability/grafana/provisioning/datasources/loki.yaml`. El workflow **Observabilidad** valida Compose y ambos archivos con las imágenes usadas por el entorno. Esas validaciones también se pueden ejecutar localmente:

```bash
docker compose --profile observability config --quiet
docker run --rm --network none -v "${PWD}/docker/observability/loki:/etc/loki:ro" grafana/loki:3.7.9 '-config.file=/etc/loki/config.yml' '-verify-config=true'
docker run --rm --network none -e COMPOSE_PROJECT_NAME=tusviajes -v "${PWD}/docker/observability/alloy:/etc/alloy:ro" grafana/alloy:v1.21.3 validate /etc/alloy/config.alloy
```

#### Trazas distribuidas

Las APIs utilizan la instrumentación HTTP de Spring Boot con OpenTelemetry. Una consulta del backend a vuelos crea spans relacionados: recepción en el backend, llamada HTTP saliente y procesamiento en vuelos. Comparten un `traceId` y cada operación tiene su propio `spanId`, inicio y duración. Este bloque instrumenta HTTP; las consultas a PostgreSQL y las operaciones internas requieren instrumentación adicional.

Para exportar las trazas a Tempo, configurar en `.env` antes de repetir el comando de arranque con el perfil `observability`:

```env
TRACING_EXPORT_ENABLED=true
TRACING_SAMPLING_PROBABILITY=1.0
```

El muestreo `1.0` permite observar todas las solicitudes de las pruebas locales. Se puede reducir después de medir el volumen necesario. La exportación está desactivada por defecto y debe dejarse en `false` cuando se ejecute la aplicación sin Tempo. Las APIs siguen generando su contexto de correlación aunque la exportación esté desactivada. El endpoint OTLP del Compose se comunica por la red interna y no publica puertos adicionales.

El arranque recrea las APIs para incorporar las variables nuevas. Antes de publicar sus imágenes, usar el comando con `compose.local.yaml` y `--build`. Reiniciar Grafana con las mismas opciones de proyecto, archivos y variables para que cargue la fuente Tempo y los enlaces entre logs y trazas:

```bash
docker compose --profile observability restart --no-deps grafana
```

Para probar una traza:

1. Consultar `/api/countries` a través del frontend y copiar el encabezado `X-Trace-ID` de la respuesta. En PowerShell se puede usar `curl.exe -i http://localhost:5173/api/countries`, adaptando el puerto. `X-Request-ID` continúa disponible para la correlación anterior.
2. En Grafana, abrir **Explore**, seleccionar **Tempo**, elegir una consulta por **TraceID** y pegar ese identificador. La exportación es por lotes y puede tardar unos segundos.
3. Para observar el recorrido entre servicios, consultar `/api/flights` con un usuario autorizado y abrir su `X-Trace-ID`. La vista muestra la relación entre los spans del backend y de vuelos.
4. En **Explore → Loki**, buscar los logs por `traceId`. Al expandir una línea JSON aparece **Ver traza**. Desde un span en Tempo también se pueden consultar los logs de esa traza.

```logql
{job="api-logs"} | json | traceId="REEMPLAZAR_POR_EL_TRACE_ID"
```

Un ID presente en los logs puede no estar almacenado en Tempo si la exportación estaba desactivada o la traza no fue muestreada. Para las pruebas del entorno local se utilizan exportación activa y muestreo `1.0`.

Tempo se ejecuta en modo monolítico, con datos y WAL en un volumen persistente y retención configurada de siete días. La eliminación se procesa mediante sus tareas de compactación. La configuración está en `docker/observability/tempo/config.yml` y su fuente de Grafana en `docker/observability/grafana/provisioning/datasources/tempo.yaml`. Las pruebas de las APIs cubren los encabezados W3C, los IDs en logs y la propagación a vuelos; el workflow **Observabilidad** valida también la configuración de Tempo:

```bash
docker run --rm --network none -v "${PWD}/docker/observability/tempo:/etc/tempo:ro" grafana/tempo:3.1.1 '-config.file=/etc/tempo/config.yml' '-config.verify=true'
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
