# Vanility

**Decision Support System for Indonesian Vanilla Farmers**  
*Garuda Hacks 7.0 — July 2026*

---

## Pitch & Positioning

**Vanility is not an "AI that predicts your grade."** It is a **structured decision support system** that codifies the Indonesian National Standard (SNI) for vanilla grading and fragmentary academic research from IPB University into a unified, machine-trained model — accessible to farmers without a laboratory.

### Why this matters

Indonesia is the world's **second-largest vanilla producer** (~30% of global supply), yet ranks only **seventh in export value**. The core problem is not a lack of production — it is a **knowledge and transparency gap** in harvest timing and post-harvest curing.

Most farmers harvest early (3–4 months instead of the ideal 8–9 months) due to financial pressure and theft risk. Curing steps — sweating, drying, conditioning — are performed inconsistently because the relationship between each step's duration and final bean quality has never been compiled into an accessible tool.

Vanility translates these standards into a simple digital interface, allowing farmers and cooperative leaders to:

1. Estimate harvest maturity and final bean grade from basic production metadata.
2. Follow step-by-step curing guidelines aligned with SNI export standards.
3. Compare projected income from selling raw beans versus processed extracts.

---

## Methodology: How the Grading Engine Works

### Current implementation (v1.0)

The grading engine combines **two approaches**:

| Component | Description |
|-----------|-------------|
| **SNI/IPB Rule Engine** | A structured scoring system derived from SNI 01-0012-2015 and published IPB curing research. Scores harvest timing, sweating duration, drying duration, and conditioning duration against documented optimal ranges. |
| **Trained ML Model** (Random Forest) | A scikit-learn model trained on synthetically generated data that follows the same SNI distributions. This model generalizes beyond rigid rule boundaries, providing smooth confidence estimates across the parameter space. |

**→ Important: The initial model is trained on synthetic data because real field data from Indonesian smallholder farmers is not yet available at scale.** Building trust with farming communities to share harvest records takes time and on-the-ground partnerships. Our roadmap (see below) prioritizes replacing this with real field data once collaborations with BRIN (National Research and Innovation Agency) and local cooperatives are established.

### Future — Computer Vision from Bean Photos (Roadmap)

One of the strongest opportunities for genuine predictive ML lies in **visual analysis of vanilla pods**. Bean color and surface texture correlate strongly with maturity and curing stage. The plan is:

1. Collect 30–50+ public-domain vanilla pod images from academic journals and open datasets.
2. Build a simple computer vision pipeline (color histogram + texture thresholding) that outputs a maturity signal alongside the metadata-based model.
3. Eventually replace or ensemble the rule/ML engine with a CNN trained on a larger curated dataset.

**This visual component is not yet implemented** and is listed as a roadmap milestone.

---

## Core Features

### 1. Maturity & Grade Assessment
Farmers input pollination date, region, curing method, and step durations. The system returns:
- Harvest status (Too Early / Approaching Maturity / Ideal Maturity / Overmature)
- Predicted grade (Grade A / Grade B / Low Grade) with confidence score
- Actionable recommendations for improving quality
- Estimated dry yield and market price range (USD/kg)

### 2. Value Addition Calculator
Compares estimated income from selling dried beans vs. processing into vanilla extract. Visualizes the income gap to motivate curing investment.

### 3. Curing Guidance Checklist
Interactive checklist that walks through all four post-harvest stages:
- **Blanching** (63–65°C, 2–3 minutes)
- **Sweating** (10–15 days traditional, 4–8 days controlled)
- **Sun drying** (5–14 days)
- **Conditioning** (60–90 days for aroma maturation)

Aligned with SNI 01-0012-2015 export standards.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)               │
│  Landing → Login → Dashboard                       │
│    ├─ Overview Tab (batch table, KPIs, alerts)      │
│    ├─ Grade Assessment Tab (input form + results)   │
│    ├─ Value Add Calculator Tab                      │
│    └─ Curing Guidance Tab (checklist)               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (REST)
┌──────────────────────▼──────────────────────────────┐
│                Backend (FastAPI)                    │
│  routers/                                           │
│    ├─ estimate.py     → grading engine              │
│    ├─ value_add.py    → financial calculator         │
│    └─ price_reference.py → market data              │
│  logic/                                             │
│    └─ grading.py      → rule engine + ML model      │
│  repository.py        → Supabase persistence        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Database (Supabase)                    │
│  vanilla_batches table                              │
│    farmer_name, region, pollination_date,           │
│    curing_metrics, predicted_grade, confidence,     │
│    wet/dry quantity, created_at                     │
└─────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, SweetAlert2 |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| ML | scikit-learn (Random Forest), joblib, pandas |
| Database | Supabase (PostgreSQL via REST API) |
| Auth | Supabase Auth (email/password, OAuth) |

---

## Setup Instructions

### Prerequisites

- **Node.js** >= 22 (for frontend)
- **Python** >= 3.11 (for backend)
- **A Supabase account** (free tier works)

---

### 1. Clone and install frontend dependencies

```bash
git clone https://github.com/your-org/vanility.git
cd vanility/frontend
npm install
```

### 2. Clone and install backend dependencies

```bash
cd ../backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Start the backend

```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`.  
API docs (Swagger UI) at `http://127.0.0.1:8000/docs`.

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Roadmap

| Milestone | Status | Description |
|-----------|--------|-------------|
| SNI + IPB rule engine |  Done | Structured scoring from national standards |
| Trained ML model (synthetic data) |  Done | Random Forest trained on SNI-distributed synthetic data |
| Supabase database + auth |  Done | Persistent batch storage, email/password auth |
| Computer vision (pod photo analysis) | Planned | Color histogram + texture thresholding from 30–50+ public pod images |
| Real field data training |  Planned | Replace synthetic data with real records via BRIN/koperasi partnerships |
| Multi-language (ID/EN toggle) |  Done | Full Indonesian and English interface |
| Mobile-responsive UI | Planned | Optimize for low-bandwidth rural network conditions |
| Offline mode |  Planned | Local-first caching for areas with intermittent internet |

---

## Target Impact

- **Individual farmers** gain actionable harvest timing and curing guidance without lab access.
- **Cooperative leaders** standardize quality across member batches, strengthening negotiating position with buyers.
- **The broader goal** is closing the export value gap: helping Indonesia capture more of the $500M+ global vanilla market by producing higher-grade cured beans instead of raw commodity exports.

---

## License

MIT — see `LICENSE` file.

*Built with purpose for Garuda Hacks 7.0.*
