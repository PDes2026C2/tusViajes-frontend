# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine

# ==========================================
# 1. Builder Stage
# ==========================================
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

# Argumento opcional de build para la URL del backend (ej: inyectado en GitHub Actions)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copiar archivos de dependencias para aprovechar la caché de Docker
COPY package.json package-lock.json ./

# Instalar dependencias (incluyendo devDependencies para poder correr el build)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copiar el resto del código fuente (ignorado lo filtrado por .dockerignore)
COPY . .

# Construir la aplicación (Vite genera la carpeta /app/dist)
RUN npm run build


# ==========================================
# 2. Runner Stage (Producción con Nginx)
# ==========================================
FROM nginx:alpine AS runner

# Copiar configuración personalizada de Nginx para SPA (React Router BrowserRouter)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos compilados desde la etapa anterior al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Nginx corre por defecto como demonio, pero para contenedores debe correr en primer plano
CMD ["nginx", "-g", "daemon off;"]