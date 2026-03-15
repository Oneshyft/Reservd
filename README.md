# SuiteSpotter

Social listening and sales outreach tool for Detroit Lions (Ford Field) and Detroit Red Wings (Little Caesars Arena) suite packages.

SuiteSpotter monitors Reddit, Twitter/X, and supports manual logging from Facebook to find potential buyers interested in shared or full suite access for Detroit Lions and Red Wings games.

## Packages Offered

- **Shared Access**: 4 seats to 1 Lions game + 3 Red Wings games
- **Full Suite**: Entire suite for 1 Lions game + 3 Red Wings games

Target buyers: fans priced out of season tickets, corporate groups, event planners.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see Reddit API Setup below).

### 3. Initialize Database

```bash
npx prisma migrate dev
```

This creates the SQLite database and seeds it with:
- 55+ trigger phrases (High/Medium/Low intent)
- 8 outreach templates
- 20 realistic sample leads

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Reddit API Credential Setup

1. Go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
2. Click **"create another app..."** at the bottom
3. Fill in:
   - **name**: SuiteSpotter
   - **type**: Select **script**
   - **description**: Social listening tool
   - **redirect uri**: `http://localhost:3000`
4. Click **"create app"**
5. Copy the credentials:
   - **Client ID**: The string under "personal use script" (e.g., `abc123def456`)
   - **Client Secret**: The "secret" value
6. Add to your `.env`:
   ```
   REDDIT_CLIENT_ID=abc123def456
   REDDIT_CLIENT_SECRET=your_secret_here
   REDDIT_USERNAME=your_reddit_username
   REDDIT_PASSWORD=your_reddit_password
   ```

## Features

### Lead Feed
- Real-time feed of matched posts from Reddit, Twitter, and manual entries
- Posts are scored 1-10 based on intent signals, location relevance, and engagement
- Filter by platform, phrase tier, score, team, status, and date range
- Highlighted matched phrases in post content
- One-click outreach with auto-selected templates

### CRM Kanban Board
- Drag-and-drop pipeline: New Leads → Reviewing → Commented → DMed → Converted → Closed/Lost
- Visual score badges (Hot/Warm/Cold) on each card
- Click to expand full lead details

### Outreach Templates
- 8 pre-loaded templates covering season ticket cost, waitlist, suite inquiries, corporate, combo deals
- Template variables: `{{team}}`, `{{venue}}`, `{{package_type}}`
- Auto-selects best template based on matched trigger phrases
- Copy-to-clipboard for quick posting

### Trigger Phrases
- 55+ pre-seeded phrases across three tiers:
  - **High Intent** (red): Suite inquiries, season ticket complaints, waitlist mentions
  - **Medium Intent** (amber): First-time fans, corporate events, price complaints
  - **Low Intent** (gray): General suite experience questions
- Add, edit, delete, and toggle phrases via the UI

### Manual Lead Logger
- Paste posts from Facebook, Twitter, or any platform
- Auto-scores and auto-detects team mentions
- Enters the same pipeline as automated leads

### Platform-Specific Features
- **Reddit**: Automated scanning via official API (snoowrap)
- **Facebook**: Manual logging + copyable search terms for Facebook Groups
- **Twitter/X**: Live monitoring if API token configured, otherwise manual search strings provided

### Scheduling
- Every 20 min: High intent scan on primary subreddits
- Every 2 hours: Medium intent scan on secondary subreddits
- Every 6 hours: Low intent scan across all sources
- Daily 8am: Email digest (requires SMTP config)

Start the scheduler by hitting `POST /api/scheduler/start` or integrate into your deployment.

## Adding New Subreddits and Trigger Phrases

### Via the UI
1. Click the **Phrases** tab
2. Click **Add Phrase** to add new trigger phrases
3. Set the tier (High/Medium/Low) to control scan frequency

### Via the Database
Subreddits are configured in `src/lib/constants.ts`. Add new ones to `PRIMARY_SUBREDDITS` or `SECONDARY_SUBREDDITS`.

## Seasonal Monitoring Calendar

| Period | Event | Action |
|--------|-------|--------|
| **Mid-May** | NFL Schedule Release | Lions ticket demand spikes — increase scan frequency |
| **July** | Lions Training Camp | Season ticket and waitlist discussions peak |
| **October** | Red Wings Home Opener | Suite and group ticket interest spikes |
| **Nov-Dec** | Holiday Season | Corporate/group suite buying season peak |
| **Playoffs** | Lions Playoff Run | Manually increase all scan frequencies |

## Reddit Outreach Best Practices

1. **Be helpful first** — Answer the person's question or add value before mentioning your service
2. **Disclose you're promoting a product** — "Full disclosure, I work with a company that does this..."
3. **No copy-paste spam** — Vary your reply wording across different posts
4. **Match the tone** — Casual in fan subreddits, professional in business subreddits
5. **Don't over-post** — Limit outreach to 2-3 comments per subreddit per week
6. **Follow subreddit rules** — Some subs ban self-promotion entirely; respect that

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS, Lucide icons
- **Database**: SQLite via Prisma ORM
- **Reddit API**: snoowrap / direct OAuth
- **Scheduling**: node-cron
- **Email**: nodemailer
- **State**: Zustand

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── leads/          # CRUD for leads
│   │   ├── phrases/        # Trigger phrase management
│   │   ├── templates/      # Outreach template management
│   │   ├── outreach/       # Outreach event logging
│   │   ├── scan/           # Manual scan trigger
│   │   ├── stats/          # Dashboard statistics
│   │   ├── manual-lead/    # Manual lead ingestion
│   │   ├── settings/       # App settings
│   │   └── scheduler/      # Cron job management
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Main dashboard
├── components/
│   ├── ComplianceBanner.tsx
│   ├── FacebookSearchTerms.tsx
│   ├── FilterBar.tsx
│   ├── KanbanView.tsx
│   ├── LeadCard.tsx
│   ├── LeadFeed.tsx
│   ├── ManualLeadLogger.tsx
│   ├── OutreachPanel.tsx
│   ├── PhrasesManager.tsx
│   ├── ScoreBadge.tsx
│   ├── StatsBar.tsx
│   ├── TemplatesManager.tsx
│   └── TwitterSearchCard.tsx
├── lib/
│   ├── constants.ts        # Subreddits, statuses, search terms
│   ├── prisma.ts           # Prisma client singleton
│   ├── scheduler.ts        # Cron job definitions
│   ├── scoring.ts          # Lead scoring algorithm
│   └── utils.ts            # Utility functions
├── scrapers/
│   ├── reddit.ts           # Reddit scraper module
│   └── twitter.ts          # Twitter scraper module
└── store/
    └── useStore.ts         # Zustand global state
```
