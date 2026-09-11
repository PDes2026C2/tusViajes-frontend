---
trigger: model_decision
---

---
name: project-context
description: "Provides the general context, architecture, MVP scope, and future vision of the study platform project (TTIP). It must be used (triggered) whenever you are asked to design new views in the web-app, add endpoints in the web-api, configure models in core-ai, or make architectural decisions. It helps to remember what each module does and what the product boundaries are."
---

# Project Context: Study Platform (MVP and Vision)

## The Main Idea
The project is a **e-commerce travel packages platform** (with a visual and usability style similar to Despegar). The main objective is to eliminate the friction of looking for a travel for holidays.

## Architecture
Two services: `web-app` (React/Vite frontend), `web-api` (Java/Spring Boot, runs via Docker).

**`web-app` folder responsibilities:**
| Layer | Responsibility |
|---|---|
| `pages/` | Orchestrators only. Call hooks, distribute state/callbacks to components. No UI markup. |
| `components/` | Presentational ("dumb"). Props in, callbacks out. No hooks, stores, or network calls. |
| `stores/` | Single source of truth. Holds state, calls datasources, maps LocalModel↔DTO, manages `isLoading`. |
| `hooks/` | Thin layer: form state (react-hook-form + Zod), error surfacing, calls store actions with local models only. |
| `datasources/` | HTTP only via `api-client.ts` (Axios with auth interceptors + 401 refresh). Returns raw DTOs, no logic. |
| `models/*.ts` | Local domain models + API DTOs + mapper functions. |
| `models/*.schema.ts` | Zod schemas for form validation (used only in hooks). Error messages in English. |
| `utils/` | Generic helpers (e.g., `cn()`). |
| `routes/` | React Router config. |
| `contexts/` | React contexts for deep component trees (e.g., editor toolbar). |

## Domain Model: Travel Packages, Flights and Hotels
The highest level of organization are the **Travel Packages**. These are the union of:
- Outbound Flight: The flight with the first date.
- Arrival Flight: The flight that gives you back to your city.
- A Hotel: where the user is going to live during that time.
- And other properties like price. 

## Golden Rules during development
- **Hooks are thin**: Hooks may only manage form state, surface errors, and call store actions. They must receive and pass local models (never DTOs) to stores.
- **Datasources are dumb**: Datasources only make HTTP requests and return raw DTOs — no business logic, no mapping.
- **Schemas live separately**: Zod validation schemas (`*.schema.ts`) are separated from domain models (`*.ts`) to keep validation logic reusable and decoupled from data contracts.
- **Prefer composite state in hooks**: Hooks should prioritize using composite objects (a single state object with multiple attributes) instead of multiple individual `useState` calls to maintain better state cohesion and synchronization.