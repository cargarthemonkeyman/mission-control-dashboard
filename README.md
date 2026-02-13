# Mission Control Dashboard

A real-time dashboard for tracking AI agent activities, scheduled tasks, and global search across your workspace.

## Features

- **Activity Feed**: Records every action with timestamps, metadata, and auto-refresh
- **Weekly Calendar**: Visualize scheduled tasks in a weekly grid view
- **Global Search**: Search across activities, tasks, and memory with instant results
- **Real-time**: Powered by Convex for live updates

## Tech Stack

- NextJS 14+ (App Router)
- TypeScript
- TailwindCSS
- Convex (Database & Real-time sync)
- Lucide React (Icons)
- date-fns (Date manipulation)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This will:
- Create a new Convex project (or connect to existing)
- Push the schema and functions
- Provide you with a deployment URL

### 3. Configure environment

Copy the deployment URL from the Convex output and create `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

### Convex Schema

- **activities**: Logs all actions with type, description, metadata, timestamp, agent
- **scheduledTasks**: Tasks with scheduling, status tracking, recurrence
- **searchIndex**: Searchable content index (optional, for advanced search)

### Components

- `ActivityFeed`: Displays activities grouped by date, auto-refreshes every 5s
- `CalendarView`: Weekly calendar with time slots, task blocks
- `GlobalSearch`: Debounced search with dropdown and full-page results
- `DashboardStats`: Summary cards showing activity metrics

### API Integration

To log activities from your OpenClaw agent, use the Convex mutation:

```typescript
import { api } from "@/convex/_generated/api";

// In your agent code
await fetch(`${CONVEX_URL}/api/mutate`, {
  method: "POST",
  body: JSON.stringify({
    path: "activities:create",
    args: {
      type: "task_completed",
      description: "Built Mission Control dashboard",
      agent: "Ray",
      metadata: { project: "mission-control" }
    }
  })
});
```

Or use the Convex client directly in Node.js:

```typescript
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.CONVEX_URL);

await convex.mutation(api.activities.create, {
  type: "task_completed",
  description: "Built Mission Control dashboard",
  agent: "Ray"
});
```

## Development

### Adding new activity types

Edit `convex/schema.ts` to add new union literals for the `type` field.

### Customizing the theme

Edit `tailwind.config.ts` to modify the `mission` color palette.

### Deploying to production

#### Option 1: Vercel (Recommended - Fastest)

**One-click deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**Manual deploy:**

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create mission-control --public --source=. --push
```

2. **Import in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Add environment variable:
     - `NEXT_PUBLIC_CONVEX_URL` = your Convex deployment URL
   - Deploy

3. **Done!** Vercel will auto-deploy on every push.

#### Option 2: Self-hosted

```bash
npm run build
npx convex deploy
```

## Quick Start (Vercel + Convex)

Want to see it live in 5 minutes?

```bash
# 1. Setup Convex (creates backend)
cd mission-control
npx convex dev

# 2. Copy the Convex URL shown in terminal

# 3. Deploy to Vercel
npm i -g vercel
vercel --prod
# When asked, paste your CONVEX_URL as NEXT_PUBLIC_CONVEX_URL
```

## Environment Variables

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL | Run `npx convex dev` |

## License

MIT