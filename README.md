# Startup in a Box

Turn a business idea into a full startup blueprint in seconds. Describe your concept and get a structured plan: name, tagline, target persona, core features, pricing model, tech stack, launch roadmap, and investor pitch — plus confidence and evaluation scores.

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

| Category               | Technologies                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| **Build & dev**        | Vite 5, TypeScript                                                      |
| **UI**                 | React 18, React Router 6, shadcn-ui (Radix), Tailwind CSS, Lucide icons |
| **Data & state**       | TanStack React Query, Supabase (backend + optional persistence)         |
| **Forms & validation** | React Hook Form, Zod, `@hookform/resolvers`                             |
| **Charts & visuals**   | Recharts                                                                |
| **Other**              | date-fns, jsPDF (export), Sonner (toasts), next-themes (theme)          |
| **Testing**            | Vitest, React Testing Library, jsdom                                    |

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

## Custom domain

Configure your domain in your hosting provider’s dashboard (e.g. **Domains** or **DNS**). Point the domain to the host that serves the built app; no extra config is needed inside this repo.

---

## Editing the code

- **Local:** Clone, set env, run `npm run dev`, and edit in your IDE; changes hot-reload.
- **GitHub:** Use the file **Edit** button or **GitHub Codespaces** (Code → Codespaces → New codespace) to edit and commit in the browser.

---
