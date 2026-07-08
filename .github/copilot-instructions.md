# Agent Instructions – Здравословен Живот

## Project Context

Bulgarian-language health, nutrition and fitness portal (capstone project).
Stack: **HTML + CSS + JavaScript + Bootstrap 5** frontend, **Supabase** backend, **Vite** build tool.

**Do NOT use React, Vue, Angular, or TypeScript.**

## Architecture Guidelines

- **Multi-page app (MPA):** Each screen is a separate `.html` file at project root.
- **Modular JS:** Page logic in `src/js/pages/`, shared services in `src/js/services/`.
- **Supabase client:** Single instance in `src/js/supabaseClient.js`.
- **Auth:** Supabase Auth with JWT. Roles in `user_roles` table (`user` | `admin`).
- **RLS:** All tables use Row-Level Security. Never bypass RLS from frontend.
- **Storage:** Recipe images in `recipe-images` bucket via `src/js/services/storage.js`.

## Database Tables

1. `profiles` – user goals, linked to `auth.users`
2. `user_roles` – RBAC
3. `recipes` – community recipes with JSONB ingredients/steps
4. `favorites` – bookmarked recipes/workouts

Migrations live in `supabase/migrations/`. Always add new schema changes as migration SQL files.

## UI Conventions

- Use **Bootstrap 5** components (navbar, cards, forms, grid, badges).
- Use **Bootstrap Icons** (`bi bi-*`).
- All user-facing text in **Bulgarian**.
- Green/emerald theme via Bootstrap `success` utilities and custom CSS in `src/css/main.css`.
- Responsive: mobile-first, collapsible navbar.

## Page → JS Mapping

| HTML | Page JS |
|------|---------|
| index.html | src/js/pages/home.js |
| login.html | src/js/pages/login.js |
| recepti.html | src/js/pages/recepti.js |
| admin.html | src/js/pages/admin.js |

Each page imports `layout.js` → `initPage()` renders navbar/footer.

## Coding Rules

- ES modules only (`import`/`export`).
- No inline business logic in HTML – keep JS in separate files.
- Use `showToast()` for user feedback.
- Protect admin routes with `requireAdmin()` from `auth.js`.
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (prefix `VITE_` for Vite).

## Git & Commits

- Commit incrementally (target: 15+ commits over 3+ days).
- Include migration SQL in commits when schema changes.
- Never commit `.env` with real keys.

## Testing Checklist

- [ ] Register / login / logout via Supabase Auth
- [ ] CRUD recipes with image upload to Storage
- [ ] Favorites persist in DB
- [ ] Admin can delete any recipe and change user roles
- [ ] RLS blocks unauthorized access
- [ ] All 10 pages load and are responsive
