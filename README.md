# Email Marketing Platform (Mailchimp Alternative)

A complete, production-ready full-stack Email Marketing application built with **Next.js**, **Express**, **Prisma (PostgreSQL)**, **Redis (BullMQ)**, and **Brevo Webhooks**.

---

##  Quick Links & Live Deployment

- **Live Web App**: as mentioned in mail
---

## 🛠️ Architecture & Technology Stack

| Layer | Technology | Key Usage |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand | Reactive dashboard UI, client validation, state management, auto-polling analytics |
| **Backend API** | Express.js, Node.js (ES Modules), TypeScript, Zod | Layered architecture (`routes → controllers → service → repository`), input validation middleware |
| **Database & ORM** | PostgreSQL, Prisma ORM | Multi-tenant schema, strict DB unique constraints, relational queries |
| **Queue & Worker** | Redis, BullMQ | Asynchronous email job queueing, scheduled campaign delivery via native Redis delay |
| **Email Service & Webhooks** | Brevo API, Express Webhook Handler | Transactional email dispatch, status tracking (Delivered, Opened, Bounced) |

---


## End-to-End User Flow & Usage Guide

When a user visits the application, they follow this complete end-to-end workflow:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ 1. Auth &       │ ──> │ 2. Contact       │ ──> │ 3. Audience     │
│    Workspace    │     │    Import & CRUD │     │    Segmentation │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
┌─────────────────┐     ┌──────────────────┐              │
│ 5. Analytics &  │ <── │ 4. Campaign      │ <────────────┘
│    Live Tracking│     │    Dispatch      │
└─────────────────┘     └──────────────────┘
```

### Step 1: Account Registration & Workspace Setup
1. **Sign Up / Login**: User creates an account with Company Name, User Name, Email, and Password.
2. **Automatic Isolation**: A dedicated `Workspace` is automatically created for the user. All contacts, audiences, and campaigns are completely isolated to this workspace on the backend.

### Step 2: Adding & Importing Contacts
1. **Add Single Contact**: Manually create contacts with Name, Email, Phone, City, Custom Tags, and Key-Value Custom Fields.
2. **Bulk CSV Import**: Upload a CSV file (e.g. `mock-data/contacts.csv`).
3. **Duplicate Prevention**: The backend inspects incoming contacts against existing records by `email` and `phone`. Duplicates are automatically skipped.
4. **Import Summary**: Displays a toast notification and summary breakdown (`Added: X, Skipped Duplicates: Y, Failed: Z`).

### Step 3: Audience Building & Segmentation
1. **Create Audience**: Define named target segments based on filter rules (e.g. City = "New York" or Tags = "VIP").
2. **Live Member Count**: The system dynamically calculates how many saved contacts match the criteria.

### Step 4: Campaign Creation & Delivery
1. **Draft Campaign**: Enter Campaign Name, Email Subject, and HTML/Text Body.
2. **Recipient Selection**:
   - **Audience / Tags**: Choose a saved Audience or specific Tag filter.
   - **Direct Selection**: Paste emails or phone numbers (matched against saved contacts in real-time).
3. **Scheduling Options**:
   - **Send Now**: Immediately pushes jobs to the **BullMQ** Redis queue for fast worker processing.
   - **Schedule for Later**: Select a future date and time. The job is queued with a native Redis delay.

### Step 5: Real-Time Analytics & Webhook Tracking
1. **Live Performance Dashboard**: Navigate to the Campaign Analytics view.
2. **Metric KPI Cards**: View Total Recipients, Sent, Delivered, Opened, and Failed counts.
3. **Auto-Polling UI**: The analytics page auto-refreshes every 3 seconds (with a pause/resume toggle).
4. **Webhook Updates**: As Brevo dispatches webhook events (`delivered`, `opened`), recipient statuses update dynamically without forcing a full page reload.

---


## 🚀 How to Run Locally

### Prerequisites
- **Node.js**: `v20.x` or later
- **PostgreSQL**: Local instance or hosted connection string
- **Redis**: Local `redis-server` (port 6379) or hosted Redis instance

---

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/email-marketing.git
cd email-marketing

# Install root & workspace dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

### Step 2: Configure Environment Variables




#### Frontend Environment Setup
Create `frontend/.env` (see `frontend/.env.example`):
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

---

### Step 3: Database Migration & Setup

```bash
cd backend
# Generate Prisma Client & apply database migrations
npx prisma migrate dev --name init
```

---

### Step 4: Run the Application Locally

Open 3 terminal windows to run all necessary services:

#### Terminal 1: Backend API Server
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

#### Terminal 2: BullMQ Campaign Worker
```bash
cd backend
npm run worker
# Listens to campaignQueue on Redis
```

#### Terminal 3: Frontend Next.js Client
```bash
cd frontend
npm run dev
# Running on http://localhost:3000
```

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (Prisma) |
| `JWT_ACCESS_SECRET` | Yes | Secret key for signing short-lived access JWTs |
| `JWT_REFRESH_SECRET` | Yes | Secret key for signing refresh tokens |
| `NODE_ENV` | Yes | Environment mode (`development` / `production`) |
| `BREVO_API_KEY` | Yes | Brevo API key for transactional emails |
| `MAIL_FROM` | Yes | Sender email address verified in Brevo |
| `REDIS_URL` | Yes | Connection URL for Redis server (BullMQ) |
| `PORT` | Optional | Backend API port (default `5000`) |
| `FRONTEND_URL` | Optional | Frontend origin for CORS configuration |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | Full base URL of the backend API |

---

##  Key Features & Architectural Highlights

### 1. Workspace & Account Isolation
- Multi-tenancy is enforced on the server for all data layers.
- `Workspace` is the root boundary entity (`Contact`, `Audience`, `Campaign` all have `@relation(workspaceId)`).
- Every repository call explicitly filters by `where: { workspaceId }` derived from `req.user.workspaceId` populated by `authMiddleware`.

### 2. Contact Management & CSV Import
- Manual contact creation & bulk CSV import (`mock-data/contacts.csv`).
- **Duplicate Prevention**: Multi-column DB unique constraints `@@unique([workspaceId, email])` and `@@unique([workspaceId, phone])`.
- Pre-insert sanitization trims whitespace and converts empty strings to `null` to avoid false unique index collisions.
- Detailed post-import summary report returning count of added, skipped, duplicates, and failed rows.
- Dynamic custom fields stored securely as structured JSON (`customFields Json?`).

### 3. Audiences & Contact Filtering
- Create dynamic audience groups based on criteria (e.g. city, custom tags).
- Live calculation of contact counts matching filter criteria.

### 4. Real Queue-Based Campaign Delivery
- Uses **BullMQ** backed by **Redis** for asynchronous processing.
- Immediate sending enqueues jobs with 0 delay.
- Scheduled sending calculates `delay = scheduledAt - Date.now()` natively in BullMQ.
- Survives API server crashes/restarts as jobs persist in Redis and are picked up by independent worker processes.

### 5. Webhook Integration & Live Analytics Auto-Refresh
- Implemented Brevo HTTP webhook endpoint (`POST /api/webhooks/brevo`).
- Tracks recipient delivery lifecycle: `PENDING` → `SENT` → `DELIVERED` → `OPENED` / `FAILED`.
- Stores `providerMessageId` to correlate webhooks idempotently without status downgrade risks.
- Analytics page updates metrics in real-time using continuous 3-second auto-polling with pause/resume capability.

### 6. Full-Stack Form Validation
- Client-side validation using custom form hooks with inline error messaging.
- Server-side strict Zod validation middleware (`validateBody`, `validateParams`) on all endpoints.

---

##  Trade-offs & Intentionally Omitted Features

1. **Campaign Editing Disabled Post-Creation**:
   - *Decision*: Once a campaign is created, editing is intentionally disabled.
   - *Rationale*: Modifying recipients or email body while a job is enqueued in Redis or actively processing introduces race conditions and recipient state inconsistencies. Campaigns follow an immutable log pattern (Draft/Scheduled → Sending → Sent).

2. **Single-Node Queue Deployment**:
   - *Decision*: BullMQ worker runs alongside API or as a single worker process.
   - *Trade-off*: Sufficient for high concurrency under standard workloads. Scaling to multi-region worker pools can be achieved by launching additional worker instances consuming from the same Redis queue.

3. **Optional Extra Credit Features (PDF Attachments)**:
   - Skipped attachment handling to focus 100% on bulletproof queue delivery, webhook tracking, schema isolation, and validation layer completeness.

---

## Deployment Architecture

- **Database**: PostgreSQL hosted on Render / Supabase.
- **Redis**: Hosted Redis instance (Render / Upstash).
- **Backend API**: Render Web Service (`npm run start`).
- **Worker Process**: Render Background Worker (`npm run worker`).
- **Frontend**: Render / Vercel Web Service (`npm run build && npm run start`).
