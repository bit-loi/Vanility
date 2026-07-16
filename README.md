# Vanility

Vanility is a platform that helps Indonesian vanilla farmers produce export grade vanilla and connect directly with global buyers. The goal is simple: help farmers earn more by skipping middlemen and selling premium cured vanilla at fair prices.

Garuda Hacks 7.0 July 2026

---

## Why Vanility Exists

Indonesia is the world's second largest vanilla producer, supplying roughly 30 percent of global vanilla. But Indonesia ranks only seventh in export value. Farmers sell raw beans to local middlemen at low prices while international buyers pay premium rates for Grade A cured vanilla.

The reasons are clear:

* Farmers harvest early, around 3 to 4 months instead of the ideal 8 to 9 months, because of financial pressure and theft risk.
* Curing steps like sweating, drying, and conditioning are done inconsistently because the relationship between each step and final bean quality has never been compiled into an accessible tool.
* Farmers have no direct connection to international buyers. They sell to whoever shows up at the village gate.

Vanility closes these gaps.

---

## What You Can Do With Vanility

### For Farmers and Cooperatives

**Grade Assessment**
Enter your pollination date, region, curing method, and step durations. Vanility returns your predicted grade, confidence score, estimated dry yield, and market price range. You know what your beans are worth before you sell.

**Curing Guidance**
Follow an interactive checklist aligned with SNI 01 0012 2015 export standards. The checklist walks you through blanching, sweating, sun drying, and conditioning. Complete all steps and your batch qualifies as Export Ready.

**Value Add Calculator**
Compare your income from selling dried beans versus processing them into vanilla extract. See the dollar difference and decide whether curing investment is worth it.

**Batch Management**
Save every batch you assess to your personal dashboard. Track grade distribution, wet and dry quantities, and curing status across all your batches over time.

**Seller Mode Matching**
Mark your batch as Export Ready and the matching engine will score it against every active buyer in the pool. The scoring uses four factors:

* Grade compatibility: exact match scores 40 points, adjacent grade scores 15 points
* Quantity fit: 30 points if your batch quantity falls within the buyer's range
* Origin preference: 20 points if your region matches what the buyer wants
* Industry alignment: 10 points if your grade fits the buyer's industry

The top three buyer matches are shown with their compatibility score and a plain language explanation from the LLM Export Advisor.

**Contact Requests**
When buyers want your batch, they send a purchase request through the platform. You get notified and can follow up directly.

### For Buyers and Exporters

**Product Marketplace**
Browse all Export Ready farmer batches in one grid view. See each batch's grade, quantity (wet and dry), origin region, and farmer name.

**Batch Purchase Requests**
Found a batch you want? Click Request to Purchase and the farmer receives your interest. No middlemen, no cold calls.

**Purchase History**
Track all your initiated deals from a single dashboard. See which batches you have requested and their current status.

**Buyer Mode Activation**
Set your buying criteria including required grade, quantity range, preferred origin, and industry profile. When you activate Buyer Mode, you appear in the live buyer pool and farmers can match their batches against your criteria.

---

## How the Grading Engine Works

The grading engine combines two approaches:

* SNI Rule Engine: a structured scoring system derived from SNI 01 0012 2015 and published IPB University research on vanilla curing. It evaluates harvest timing, sweating duration, sun drying duration, and conditioning duration against documented optimal ranges.
* Machine Learning Model: a scikit learn Random Forest trained on data that follows the same SNI distributions. It smooths out rigid rule boundaries and provides confidence estimates across the full parameter space.

The model was initially trained on synthetic data because real field data from Indonesian smallholder farmers is not yet available at scale. The roadmap includes replacing this with real data as partnerships with cooperatives and research institutions grow.

---

## Features List

**Core Features**

* Grade prediction with confidence score and recommendations
* Dry yield estimation and price range (USD per kg)
* Interactive curing checklist aligned with SNI standards
* Value add calculator comparing raw bean versus extract income
* Save and track multiple batches on your dashboard
* Overview dashboard with KPI cards and grade distribution chart
* LLM powered market insights on the overview page

**Matching and Marketplace**

* Seller mode: match your export ready batch with active buyers
* Buyer mode: activate with custom criteria and appear in the live buyer pool
* Product marketplace grid for buyers to browse all available batches
* Contact request system for direct buyer seller connection
* Live buyer presence with 30 second heartbeat
* LLM Export Advisor generating plain language match explanations in English or Indonesian

**Platform**

* Bilingual interface: full English and Indonesian
* Authentication via Supabase with email/password and Google OAuth
* Two user types: Individual Farmer and Cooperative
* Profile settings page with location and user type configuration
* Forgot password and reset password flow
* Retro inspired UI with custom theming

---

## Architecture

The project has two main components:

**Frontend (Next.js 16 + React 19 + Tailwind CSS 4)**

```
frontend/
  app/
    page.tsx              landing page
    login/page.tsx        authentication
    dashboard/page.tsx    main dashboard with sidebar and tabs
    profile/page.tsx      user profile settings
    forgot-password/
    reset-password/
  components/
    OverviewTab.tsx       KPI cards, batch table, grade charts
    EstimatorTab.tsx      grade assessment form and results
    CalculatorTab.tsx     value add financial calculator
    GuidanceTab.tsx       curing checklist
    MatchingTab.tsx       buyer matching and product marketplace
    Sidebar.tsx           navigation sidebar
    Header.tsx            top header bar
  lib/api.ts              API client functions
  utils/supabase/         Supabase client and server helpers
```

**Backend (Python 3.11+ FastAPI)**

```
backend/
  routers/
    estimate.py           grade estimation endpoint
    buyer_mode.py         buyer seller mode, matching, contact requests
    value_add.py          financial calculator endpoint
    price_reference.py    market price data endpoint
    buyer_match.py        legacy matching route
  logic/
    grading.py            SNI rule engine and ML model
    matching.py           buyer scoring engine
  models/schemas.py       Pydantic request and response models
  repository.py           Supabase persistence layer
  database.py             REST API client for Supabase
  auth.py                 JWT token validation
  main.py                 FastAPI application entry point
```

**Database (Supabase PostgreSQL)**

Key tables:
* batches: vanilla batch records with grade, quantity, origin, status
* profiles: user profile information
* buyer_mode_state: active buyer criteria and presence tracking
* contact_requests: buyer initiated purchase requests

---

## Setup Instructions

**Prerequisites**

* Node.js version 22 or higher
* Python version 3.11 or higher
* A Supabase account (free tier is sufficient)

**Frontend Setup**

```bash
cd frontend
npm install
```

Create a file named `.env.local` in the frontend directory:

```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Start the frontend:

```bash
npm run dev
```

The frontend runs at http://localhost:3000

**Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a file named `.env` in the backend directory:

```
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_KEY=your-service-role-key
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

The API runs at http://127.0.0.1:8000
API documentation at http://127.0.0.1:8000/docs

**Environment Variables Reference**

| Variable | Required | Location | Purpose |
|----------|----------|----------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Yes | frontend/.env.local | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | frontend/.env.local | Supabase anonymous key |
| SUPABASE_URL | Yes | backend/.env | Supabase project URL |
| SUPABASE_KEY | Yes | backend/.env | Supabase service role key |
| ALLOWED_ORIGINS | No | backend/.env | CORS allowed origins |
| OPENROUTER_API_KEY | No | backend/.env | LLM advisor (optional) |

---

## Required Database Tables

Run these SQL statements in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  location_region TEXT DEFAULT '',
  user_type TEXT DEFAULT 'individual',
  email TEXT
);

CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  grade TEXT,
  quantity_kg NUMERIC,
  origin TEXT,
  harvest_days INTEGER,
  conditioning_days INTEGER,
  export_readiness_score INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS buyer_mode_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT false,
  required_grade TEXT,
  min_quantity_kg NUMERIC,
  max_quantity_kg NUMERIC,
  preferred_origin TEXT,
  industry TEXT,
  last_heartbeat TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES profiles(id),
  batch_id UUID REFERENCES batches(id),
  status TEXT DEFAULT 'requested',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API Reference

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | /api/estimate | No | Predict vanilla grade from curing data |
| POST | /api/value-add-calculator | No | Compare raw bean vs extract income |
| GET | /api/price-reference | No | Get market prices by grade |
| POST | /api/buyer-mode/toggle | Yes | Activate or deactivate buyer mode |
| POST | /api/buyer-mode/heartbeat | Yes | Update live buyer presence timestamp |
| GET | /api/buyer-mode/active-count | No | Get count of active buyers |
| GET | /api/matches/{batch_id} | Yes | Match a batch against active buyers |
| POST | /api/batches | Yes | Save a new batch |
| GET | /api/batches | Yes | List batches with optional filters |
| POST | /api/contact-requests | Yes | Send a purchase or contact request |
| GET | /api/contact-requests | Yes | List your contact requests |

---

## Target Impact

* Individual farmers gain actionable harvest timing and curing guidance without needing a laboratory.
* Cooperative leaders standardize quality across member batches, strengthening their negotiating position with buyers.
* The broader goal is helping Indonesia capture more of the global vanilla market by producing higher grade cured beans instead of raw commodity exports.
* Buyers get direct access to verified farmer batches without中介 fees or supply chain opacity.

---

## License

MIT. See the LICENSE file for details.

Built for Garuda Hacks 7.0.

* Garuda Hacks Official Website: https://www.garudahacks.com/
* Garuda Hacks 7.0 Devpost: https://gh7.devpost.com/
