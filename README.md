# Здравословен Живот – Capstone Project

Портал за здравословен начин на живот, хранене и фитнес на български език.

**GitHub:** [alekzanderventsislav-glitch/AI-SoftUniFinalExam](https://github.com/alekzanderventsislav-glitch/AI-SoftUniFinalExam)

**Live URL:** [https://zdravosloven.netlify.app](https://zdravosloven.netlify.app/index.html)

---

## Описание

**Здравословен Живот** е multi-page уеб приложение, което позволява на потребителите да:

- Разглеждат **каталог с храни** (калории и макроси на 100 г)
- Преглеждат, създават и споделят **тренировки** (публични или лични)
- Качват и споделят **рецепти** със снимки, съставки и стъпки
- Запазват **любими** рецепти и тренировки
- Проследяват **дневни калории и вода** на началната страница
- Участват в **общност** – чат, новини, въпроси и коментари
- Управляват **профил** с цели за макроси и контактни данни
- Използват **двуфакторна автентикация (2FA)** при нужда

### Роли и права

| Роля | Какво може |
|------|------------|
| **Потребител** (`user`) | Преглед, любими, собствени рецепти/тренировки, общност |
| **Треньор** (`trainer`) | Управление на тренировки в админ панела |
| **Диетолог** (`dietitian`) | Управление на рецепти и храни в админ панела |
| **Админ** (`admin`) | Пълен достъп – потребители, роли, рецепти, тренировки, храни |

Достъпът се контролира чрез таблица `user_roles` и **Row-Level Security (RLS)** политики в Supabase.

---

## Архитектура

| Слой | Технология |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES modules), Bootstrap 5, Bootstrap Icons |
| Build | Node.js, npm, Vite (multi-page app) |
| Backend | Supabase – PostgreSQL, Auth, Storage, REST API |
| Auth | Supabase Auth (JWT), RBAC чрез `user_roles` |
| Security | RLS policies на всички таблици |

```
Browser (отделни .html страници)
    ↓ @supabase/supabase-js
Supabase REST API
    ├── Auth (JWT – register, login, logout, MFA)
    ├── PostgreSQL (profiles, recipes, workouts, foods, community, …)
    └── Storage (recipe-images, workout-images, community-images, foods)
```

---

## База данни

### ER диаграма (основни таблици)

```
auth.users
    │
    ├── profiles (1:1)          – цели, контакти, MFA флаг
    ├── user_roles (1:N)        – user | admin | trainer | dietitian
    ├── recipes (1:N)           – общностни рецепти
    ├── user_workouts (1:N)     – тренировки (публични/лични)
    ├── favorites (1:N)         – любими рецепти и тренировки
    ├── community_posts (1:N)   – новини и въпроси
    │       ├── community_comments (1:N)
    │       └── community_post_likes (1:N)
    └── community_chat_messages (1:N)

foods – каталог храни (управление от admin/dietitian)
```

### Таблици

| Таблица | Описание |
|---------|----------|
| `profiles` | Профил, макро цели, телефон, адрес, професия, `mfa_required` |
| `user_roles` | RBAC – `user`, `admin`, `trainer`, `dietitian` |
| `recipes` | Рецепти – съставки/стъпки (JSONB), макроси, снимка |
| `favorites` | Любими рецепти и тренировки (`item_type`: recipe/workout) |
| `user_workouts` | Тренировки – упражнения (JSONB), ниво, цел, снимка |
| `foods` | Каталог храни – калории и макроси на 100 г |
| `community_posts` | Публикации – новини или въпроси |
| `community_comments` | Коментари към публикации |
| `community_post_likes` | Харесвания на публикации |
| `community_chat_messages` | Съобщения в общия чат |

Всички таблици имат **RLS**, индекси и връзки към `auth.users` където е нужно.

Миграциите са в `supabase/migrations/` (16 SQL файла, подредени хронологично).

### Storage buckets

| Bucket | Съдържание |
|--------|------------|
| `recipe-images` | Снимки на рецепти |
| `workout-images` | Снимки на тренировки |
| `community-images` | Снимки в общността |
| `foods` | Снимки на храни (admin) |

---

## Страници

| Файл | Описание | Достъп |
|------|----------|--------|
| `index.html` | Начало – съвети, tracker калории/вода, препоръки | Всички / членове |
| `login.html` | Вход | Гости |
| `register.html` | Регистрация | Гости |
| `mfa-setup.html` | Настройка на 2FA | Автентикирани |
| `mfa-verify.html` | Потвърждение на 2FA при вход | Автентикирани |
| `hrani.html` | Каталог на храните | Членове |
| `trenirovki.html` | Списък тренировки + CRUD | Членове |
| `trenirovka.html` | Детайл на тренировка + изтегляне | Членове |
| `recepti.html` | Рецепти + качване | Членове |
| `recept.html` | Детайл на рецепта + изтегляне | Членове |
| `obshnost.html` | Общност – чат, новини, въпроси | Членове |
| `profil.html` | Профил, цели, любими | Членове |
| `admin.html` | Админ / треньор / диетолог панел | Staff роли |

---

## Ключови папки и файлове

```
├── *.html                      # HTML страници (MPA)
├── netlify.toml                # Netlify deploy конфигурация
├── vite.config.js              # Vite MPA entry points
├── src/
│   ├── css/
│   │   ├── main.css            # Custom стилове, navbar, фон
│   │   └── styles.js           # Bootstrap + icons import
│   └── js/
│       ├── supabaseClient.js   # Supabase клиент
│       ├── auth.js             # Auth, роли, MFA redirect
│       ├── components/         # layout, toast, tracker, charts
│       ├── services/           # recipes, workouts, foods, community, storage, mfa, …
│       ├── data/               # tips, roles, статични fallback данни
│       ├── utils/              # helpers, download
│       └── pages/              # JS логика за всяка страница
├── supabase/
│   └── migrations/             # SQL миграции (commit-нати в Git)
├── scripts/                    # seed, migrate, generate helpers
└── .github/
    └── copilot-instructions.md # AI agent инструкции
```

---

## Локална инсталация

### 1. Клониране и зависимости

```bash
git clone https://github.com/alekzanderventsislav-glitch/AI-SoftUniFinalExam.git
cd AI-SoftUniFinalExam
npm install
```

### 2. Supabase проект

1. Създайте проект на [supabase.com](https://supabase.com)
2. Копирайте `.env.example` → `.env` и попълнете:

   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_DB_PASSWORD=your-database-password
   ```

3. Приложете **всички миграции** от `supabase/migrations/` в хронологичен ред  
   (Supabase Dashboard → SQL Editor, или `supabase db push` с Supabase CLI)

4. За 2FA: активирайте **TOTP** в Supabase Dashboard → Authentication → Providers → MFA

### 3. Seed данни

```bash
npm run db:seed
```

Скриптът използва `admin@zdravosloven.bg` (или `SEED_AUTHOR_EMAIL` от `.env`), задава admin роля и добавя примерни рецепти.

Допълнителни seed миграции (изпълняват се автоматично при пълно прилагане на миграциите):

| Данни | Миграция / източник |
|-------|---------------------|
| Рецепти | `20260708130000_seed_recipes.sql` |
| Тренировки | `20260709200000_seed_workouts.sql` |
| Храни (~239) | `20260709220000_seed_foods.sql` |
| Общност (примерни постове) | `20260710170000_community_module.sql` |
| Дневни съвети | `src/js/data/tips.js` – статични във frontend |
| Tracker калории/вода | `localStorage` – локално на устройството |
| Любими храни | `localStorage` – локално на устройството |

### 4. Стартиране

```bash
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview на build
```

### Полезни npm скриптове

| Команда | Описание |
|---------|----------|
| `npm run dev` | Локален dev сървър |
| `npm run build` | Production build |
| `npm run db:seed` | Seed рецепти + admin роля |
| `npm run db:migrate` | Пуска initial schema (за първоначална настройка) |

---

## Deployment

Проектът е конфигуриран за **Netlify** (`netlify.toml`):

1. Свържете GitHub repo с Netlify
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`
4. **Environment variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Скриптът `scripts/generate-supabase-env.mjs` генерира `public/supabase-env.js` при build за production fallback.

**Live URL:** https://zdravosloven.netlify.app/index.html

---

## Тестови данни (за жури)

| Поле | Стойност |
|------|----------|
| Имейл | `admin@zdravosloven.bg` |
| Парола | `Admin123` |
| Роля | `admin` |

> За жури акаунтът трябва да е създаден в Supabase Auth и да има роля `admin` в `user_roles`.  
> Ако 2FA е активирана, използвайте TOTP приложение или временно изключете `mfa_required` за тестовия профил.

---

## Функционалности по изисквания

| Изискване | Статус |
|-----------|--------|
| HTML, CSS, JS, Bootstrap (без React/Vue/TS) | ✅ |
| Supabase DB, Auth, Storage | ✅ |
| Node.js, npm, Vite | ✅ |
| Multi-page architecture | ✅ 13 страници |
| Модулен код (pages, services, components) | ✅ |
| Минимум 5 екрана | ✅ |
| Responsive design | ✅ |
| Register / Login / Logout | ✅ |
| CRUD (рецепти, тренировки, храни) | ✅ |
| Admin panel + RBAC | ✅ |
| RLS policies | ✅ |
| Минимум 4 DB таблици | ✅ 12 таблици |
| DB migrations в Git | ✅ |
| File upload (Storage) | ✅ |
| File download | ✅ `.txt` export на рецепта/тренировка |
| GitHub repo + 15+ commits | ✅ |
| Документация | ✅ |
| Agent instructions | ✅ `.github/copilot-instructions.md` |

---

## Лиценз

Учебен capstone проект – SoftUni AI програм.
