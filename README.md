# Здравословен Живот – Capstone Project

Портал за здравословен начин на живот, хранене и фитнес на български език.

## Описание

**Здравословен Живот** позволява на потребителите да:
- Разглеждат каталог с хранителни стойности
- Избират тренировъчни програми по ниво и цел
- Качват и споделят рецепти с изображения
- Запазват любими рецепти и тренировки
- Настройват дневни калорийни и макро цели
- **Админи** управляват всички рецепти и потребителски роли

## Архитектура

| Слой | Технология |
|------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES modules), Bootstrap 5 |
| Build | Node.js, npm, Vite (multi-page app) |
| Backend | Supabase (PostgreSQL, Auth, Storage, REST API) |
| Auth | Supabase Auth (JWT), роли: `user` / `admin` |
| Security | Row-Level Security (RLS) policies |

```
Browser (HTML pages)
    ↓ Supabase JS Client
Supabase REST API
    ├── Auth (JWT)
    ├── PostgreSQL (profiles, user_roles, recipes, favorites)
    └── Storage (recipe-images bucket)
```

## База данни (4 таблици)

```
auth.users ──┬── profiles (1:1)
             ├── user_roles (1:N) – RBAC
             ├── recipes (1:N) – author_id
             └── favorites (1:N) – user_id
```

| Таблица | Описание |
|---------|----------|
| `profiles` | Потребителски профил, макро цели, аватар |
| `user_roles` | Роли: `user` или `admin` |
| `recipes` | Рецепти със съставки, стъпки, макроси, снимка |
| `favorites` | Любими рецепти и тренировки |

Миграциите са в `supabase/migrations/`.

## Локална инсталация

### 1. Клониране и зависимости

```bash
git clone <your-repo-url>
cd AI-SoftUniFinalExam
npm install
```

### 2. Supabase проект

1. Създайте проект на [supabase.com](https://supabase.com)
2. В SQL Editor изпълнете `supabase/migrations/20260708120000_initial_schema.sql`
3. Копирайте `.env.example` → `.env` и попълнете:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Admin акаунт и seed данни

1. Създайте потребител в Supabase **Authentication → Users** (с **Auto Confirm User**)
   или регистрирайте се на `/register.html`
2. Попълнете `SUPABASE_DB_PASSWORD` в `.env` (от Supabase → Project Settings → Database)
3. Пуснете seed за рецепти:

```bash
npm run db:seed
```

Скриптът:
- използва `admin@zdravosloven.bg` (или `SEED_AUTHOR_EMAIL` от `.env`)
- прави потребителя **admin**
- добавя **8 примерни рецепти** в Supabase

Алтернатива без npm: изпълнете в Supabase SQL Editor файла
`supabase/migrations/20260708130000_seed_recipes.sql`

#### Какво е къде

| Данни | Източник |
|-------|----------|
| Храни (30) | `src/js/data/foods.js` – статични във frontend |
| Тренировки (8) | `src/js/data/workouts.js` – статични във frontend |
| Съвети за деня | `src/js/data/tips.js` – статични във frontend |
| Рецепти от общността | Supabase таблица `recipes` – seed с `npm run db:seed` |
| Потребители, профили, любими | Supabase – при регистрация/вход |

4. За изпитния жури – добавете тестови данни в README (имейл/парола на admin акаунта).

### 4. Стартиране

```bash
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview build
```

## Страници

| Файл | Описание |
|------|----------|
| `index.html` | Начало / dashboard |
| `login.html` | Вход |
| `register.html` | Регистрация |
| `hrani.html` | Каталог на храните |
| `trenirovki.html` | Списък тренировки |
| `trenirovka.html` | Детайл на тренировка |
| `recepti.html` | Рецепти + качване |
| `recept.html` | Детайл на рецепта |
| `profil.html` | Профил и любими |
| `admin.html` | Админ панел |

## Ключови папки

```
├── *.html                  # Отделни HTML страници (MPA)
├── src/
│   ├── css/                # Bootstrap + custom стилове
│   └── js/
│       ├── supabaseClient.js
│       ├── auth.js
│       ├── components/     # Navbar, footer, toast
│       ├── services/       # Recipes, profiles, favorites, storage
│       ├── data/           # Статични данни (храни, тренировки)
│       └── pages/          # JS логика за всяка страница
├── supabase/migrations/    # SQL миграции (commit-нати в Git)
└── .github/copilot-instructions.md
```

## Deployment

Deploy на Netlify или Vercel:
1. Свържете GitHub repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Добавете env variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Тестови данни (за жури)

Попълнете с вашия работещ admin акаунт:

| Поле | Стойност |
|------|----------|
| Имейл | `admin@zdravosloven.bg` |
| Парола | `Admin123` |
