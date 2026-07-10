# Agent Instructions – Здравословен Живот

## Project Context

Bulgarian-language health, nutrition and fitness portal (capstone project).

**Live:** https://zdravosloven.netlify.app/index.html  
**Stack:** HTML + CSS + JavaScript + Bootstrap 5 frontend, **Supabase** backend, **Vite** build tool.

**Do NOT use React, Vue, Angular, or TypeScript.**

## Architecture Guidelines

- **Multi-page app (MPA):** Each screen is a separate `.html` file at project root (13 pages).
- **Modular JS:** Page logic in `src/js/pages/`, shared services in `src/js/services/`.
- **Supabase client:** Single instance in `src/js/supabaseClient.js`.
- **Auth:** Supabase Auth with JWT. Roles in `user_roles` table.
- **RLS:** All tables use Row-Level Security. Never bypass RLS from frontend.
- **Storage:** Images via `src/js/services/storage.js` (recipe-images, workout-images, community-images, foods buckets).

## Roles (RBAC)

| Role | Access |
|------|--------|
| `user` | Standard member features |
| `trainer` | Staff panel – workouts only |
| `dietitian` | Staff panel – recipes + foods |
| `admin` | Full staff panel – users, roles, all content |

Use `requireStaff()` / `canAccessStaffPanel()` from `auth.js` and `data/roles.js` for staff routes.  
Admin panel tabs are scoped via `getStaffTabs(role)`.

## Database Tables

1. `profiles` – goals, contact fields, `mfa_required`
2. `user_roles` – RBAC (`user`, `admin`, `trainer`, `dietitian`)
3. `recipes` – community recipes (JSONB ingredients/steps)
4. `favorites` – bookmarked recipes/workouts
5. `user_workouts` – public/private workouts
6. `foods` – food catalog (admin/dietitian managed)
7. `community_posts` – news and questions
8. `community_comments` – post comments
9. `community_post_likes` – post likes
10. `community_chat_messages` – community chat

Migrations live in `supabase/migrations/`. Always add new schema changes as migration SQL files.

## UI Conventions

- Use **Bootstrap 5** components (navbar, cards, forms, grid, badges, modals).
- Use **Bootstrap Icons** (`bi bi-*`) or custom CSS icons when an icon is missing from the set.
- All user-facing text in **Bulgarian**.
- Green theme via Bootstrap `success` utilities and `src/css/main.css`.
- Responsive: mobile-first, collapsible navbar (`navbar-refined`).

## Page → JS Mapping

| HTML | Page JS |
|------|---------|
| index.html | src/js/pages/home.js |
| login.html | src/js/pages/login.js |
| register.html | src/js/pages/register.js |
| mfa-setup.html | src/js/pages/mfa-setup.js |
| mfa-verify.html | src/js/pages/mfa-verify.js |
| hrani.html | src/js/pages/hrani.js |
| trenirovki.html | src/js/pages/trenirovki.js |
| trenirovka.html | src/js/pages/trenirovka.js |
| recepti.html | src/js/pages/recepti.js |
| recept.html | src/js/pages/recept.js |
| obshnost.html | src/js/pages/obshnost.js |
| profil.html | src/js/pages/profil.js |
| admin.html | src/js/pages/admin.js |

Each page imports `layout.js` → `initPage()` renders navbar/footer and optional auth guards.

## Coding Rules

- ES modules only (`import`/`export`).
- No inline business logic in HTML – keep JS in separate files.
- Use `showToast()` for user feedback.
- Protect staff routes with `initPage(fn, { requireAdmin: true })` which calls `requireStaff()`.
- Protect member routes with `{ requireAuth: true }`.
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (prefix `VITE_` for Vite).

## Git & Commits

- Commit incrementally (target: 15+ commits over 3+ days).
- Include migration SQL in commits when schema changes.
- Never commit `.env` with real keys.

## Testing Checklist

- [ ] Register / login / logout via Supabase Auth
- [ ] CRUD recipes and workouts with image upload to Storage
- [ ] Favorites persist in DB
- [ ] Admin can manage users, roles, recipes, workouts, foods
- [ ] Trainer/dietitian see scoped admin tabs only
- [ ] Community chat, posts, comments work
- [ ] RLS blocks unauthorized access
- [ ] All 13 pages load and are responsive
- [ ] Live deploy: https://zdravosloven.netlify.app
