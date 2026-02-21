# Startup in a Box

Turn a business idea into a full startup blueprint in seconds. Describe your concept and get a structured plan: name, tagline, target persona, core features, pricing model, tech stack, launch roadmap, and investor pitch — plus confidence and evaluation scores.

---

## Screenshots

<img width="480" alt="Image" src="https://github.com/user-attachments/assets/415acfbc-7b3e-4021-ba6c-9f62887402b4" />

<img width="480" alt="Image" src="https://github.com/user-attachments/assets/4429ee2c-86e8-4c99-9d48-15327e6c1ca8" />

<img width="480" alt="Image" src="https://github.com/user-attachments/assets/1058743a-21f8-4892-99a3-57463b1e8b49" />

---

## Features

- **Generator** — Enter an idea and generate a complete startup blueprint (name, features, pricing, tech stack, roadmap, pitch).
- **Startup detail** — View any saved blueprint at `/startup/:id` with full breakdown and optional PDF export.
- **History** — Browse past generations, search, filter, mark favorites, and delete entries.
- **Compare** — Side-by-side comparison of up to 3 blueprints (features, pricing, tech stack, scores).
- **Scoreboard** — Leaderboard of top blueprints by confidence score.
- **Dashboard** — Metrics (generation time, tokens, output length) and leaderboard for admins.

---

## Prerequisites

- **Node.js** (v18 or later recommended) and **npm**  
  Install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) if needed.
- **Supabase** (optional for full features) — Used for storing generation history, metrics, and favorites. The app can run without it for generation-only use if the backend supports it.

---

## Getting started

### 1. Clone and install

```sh
git clone <YOUR_GIT_URL>
cd startup-in-a-box
npm i
```

### 2. Environment variables

Create a `.env` or `.env.local` in the project root with your Supabase credentials (do not commit real keys):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

Get these from your [Supabase](https://supabase.com) project: **Settings → API**.

### 3. Run the app

```sh
npm run dev
```

The app runs at **http://localhost:8080** (or the next available port). The dev server uses Vite HMR, so edits reload instantly.

---

## Available scripts

| Command              | Description                                    |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Start the Vite dev server (default port 8080). |
| `npm run build`      | Production build; output is in `dist/`.        |
| `npm run build:dev`  | Build in development mode.                     |
| `npm run preview`    | Serve the production build locally.            |
| `npm run lint`       | Run ESLint.                                    |
| `npm run test`       | Run Vitest once.                               |
| `npm run test:watch` | Run Vitest in watch mode.                      |

---

## Project structure

```
startup-in-a-box/
├── src/
│   ├── main.tsx           # Entry point
│   ├── App.tsx             # Router and global providers (React Query, Toaster)
│   ├── index.css           # Global styles (Tailwind)
│   ├── components/         # Reusable UI (NavBar, GeneratorInput, StartupResult, etc.)
│   ├── components/ui/     # shadcn-ui primitives
│   ├── pages/              # Route-level pages (Index, Dashboard, History, Compare, Scoreboard, StartupPage, NotFound)
│   ├── types/              # TypeScript types (e.g. startup blueprint)
│   └── integrations/      # Supabase client and config
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

Imports use the `@/` alias for `src/` (e.g. `@/components/NavBar`).

---

## Tech stack

| Category               | Technologies                                                          |
| ---------------------- |-----------------------------------------------------------------------|
| **Build & dev**        | Vite 5, TypeScript                                                    |
| **UI**                 | React 18, React Router 6, shadcn-ui (Radix), Tailwind CSS, Lucide icons |
| **Data & state**       | TanStack React Query, Supabase (backend + optional persistence)       |
| **AI**                 | Google Gemini API (text: `gemini-3-flash`)                            |
| **Forms & validation** | React Hook Form, Zod, `@hookform/resolvers`                           |
| **Charts & visuals**   | Recharts                                                              |
| **Other**              | date-fns, jsPDF (export), Sonner (toasts), next-themes (theme)        |
| **Testing**            | Vitest, React Testing Library, jsdom                                  |

---

## Routes

| Path           | Page                                             |
| -------------- | ------------------------------------------------ |
| `/`            | Home — idea input and generated blueprint result |
| `/startup/:id` | Startup detail view                              |
| `/history`     | Past generations (search, favorites, delete)     |
| `/compare`     | Compare up to 3 blueprints                       |
| `/scoreboard`  | Top blueprints by confidence score               |
| `/dashboard`   | Metrics and leaderboard                          |
| `*`            | 404 Not found                                    |

---

## Deployment

1. **Build**

   ```sh
   npm run build
   ```

2. **Deploy** the `dist/` folder to any static host:
   - Vercel, Netlify, GitHub Pages, Cloudflare Pages, or your own server (e.g. nginx serving `dist`).

3. **Environment**  
   Set the same `VITE_*` variables in your host’s environment so the built app can reach Supabase.

**Preview the production build locally:**

```sh
npm run preview
```

---

## Supabase Database

To create or update the database schema (tables, RLS policies) in your Supabase project, run the migrations from this repo.

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed and a Supabase project. Link the project from the project root:

  ```sh
  supabase login
  supabase link --project-ref YOUR_PROJECT_REF
  ```

  `YOUR_PROJECT_REF` is the project ID from the Supabase dashboard URL or **Settings → General**.

### Deploy migrations

From the project root, push all migrations in `supabase/migrations/` to your linked project:

```sh
supabase db push
```

This applies every `.sql` file in `supabase/migrations/` in order. For a **new project**, run it once to create the schema. When you add or change migrations later, run it again to update the remote database.

### Create a new Supabase project (optional)

If you don’t have a project yet:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and click **New project**.
2. Choose organization, name, database password, and region.
3. After the project is ready, copy the **Reference ID** (e.g. from the URL or **Settings → General**) and use it in `supabase link --project-ref YOUR_PROJECT_REF`.
4. Run `supabase db push` as above to apply the migrations.

### Reset the remote database (optional)

To reset the remote database and re-run all migrations from scratch (this **destroys existing data**):

```sh
supabase db reset --linked
```

Use only when you intentionally want a clean schema and empty tables.

---

## Supabase Edge Functions

The app uses Supabase Edge Functions (Deno) for AI generation, logo generation, competitor analysis, and admin actions. You need to deploy and run these for full functionality.

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed:
  ```sh
  npm i -g supabase
  ```
- A Supabase project. Link the repo to it (from the project root):
  ```sh
  supabase login
  supabase link --project-ref YOUR_PROJECT_REF
  ```
  `YOUR_PROJECT_REF` is the project ID from the Supabase dashboard URL or **Settings → General**.

### Functions in this project

| Function | Purpose |
| -------- | ------- |
| `generate-startup` | Generates a full startup blueprint from an idea. |
| `regenerate-section` | Regenerates a single section of a blueprint. |
| `analyze-competitors` | Analyzes competitors for a startup idea. |
| `admin-delete` | Admin: delete a generation record. |
| `admin-delete-comment` | Admin: delete a comment. |

### Secrets (environment variables)

Functions need these at runtime. Supabase automatically provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` when running in Supabase; you must set the rest as **secrets**.

**AI: Google Gemini** — All AI features (blueprint generation, section regeneration, competitor analysis) use the [Google Gemini API](https://ai.google.dev/gemini-api/docs). Get an API key from [Google AI Studio](https://aistudio.google.com/apikey) and set it as a secret.

Set secrets via the CLI (they are stored in your Supabase project):

```sh
# Required for AI (generate-startup, regenerate-section, analyze-competitors)
supabase secrets set GEMINI_API_KEY=your-google-gemini-api-key

# Optional: for admin-delete and admin-delete-comment
supabase secrets set ADMIN_PASSWORD=your-admin-password
```

List current secrets (names only, not values):

```sh
supabase secrets list
```

### Run functions locally

1. Create a `.env.local` file in `supabase/functions/` (or use `supabase/functions/.env`) with the same variables the functions expect. For local runs you must provide Supabase URL and service role key as well:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-google-gemini-api-key
   ADMIN_PASSWORD=your-admin-password
   ```

   Get the service role key from Supabase **Settings → API** (keep it secret).

2. Start the local Functions server (from the project root):

   ```sh
   supabase functions serve
   ```

   By default this serves all functions at `http://localhost:54321/functions/v1/<function-name>`. The Supabase CLI injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` when you use `supabase functions serve` with a linked project; you can still override them via the env file.

3. To test a single function (e.g. `generate-startup`) with curl:

   ```sh
   curl -i -X POST 'http://localhost:54321/functions/v1/generate-startup' \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -d '{"idea":"A meal-planning app for busy parents"}'
   ```

   Use your project’s anon key from **Settings → API** so the request is authorized like the frontend.

### Deploy functions to Supabase

From the project root, deploy all functions:

```sh
supabase functions deploy
```

Deploy a single function:

```sh
supabase functions deploy generate-startup
supabase functions deploy regenerate-section
supabase functions deploy analyze-competitors
supabase functions deploy admin-delete
supabase functions deploy admin-delete-comment
```

After deployment, the frontend calls them via `supabase.functions.invoke("function-name", { body: { ... } })`; the Supabase client uses your project’s URL and anon key, so no extra config is needed in the app if the project is linked and secrets are set.

### Troubleshooting

- **401 / Unauthorized** — Use the same anon key the frontend uses when calling from curl or another client.
- **Missing env / "is not configured"** — Ensure `GEMINI_API_KEY` is set with `supabase secrets set GEMINI_API_KEY=...` for deployed functions, or in your local `supabase/functions/.env` when using `supabase functions serve`. Get the key from [Google AI Studio](https://aistudio.google.com/apikey).
- **CORS** — Edge Functions in this project send `Access-Control-Allow-Origin: *`; for production you may want to restrict this to your app’s origin.

---

## Custom domain

Configure your domain in your hosting provider’s dashboard (e.g. **Domains** or **DNS**). Point the domain to the host that serves the built app; no extra config is needed inside this repo.

---

## Editing the code

- **Local:** Clone, set env, run `npm run dev`, and edit in your IDE; changes hot-reload.
- **GitHub:** Use the file **Edit** button or **GitHub Codespaces** (Code → Codespaces → New codespace) to edit and commit in the browser.

---
