# SnapIQ — Business Document Intelligence

> The missing first step in every automation pipeline — turning physical documents into structured data.

Upload a photo of any business document (receipt, invoice, delivery note) and get back clean structured JSON — vendor, date, line items, totals — plus a plain-English summary.

## Part of a portfolio suite
| Project | What it does |
|---------|-------------|
| [RetailIQ Copilot](https://github.com/Arjunn28/retail-iq-copilot) | Retail insights for stakeholders |
| [Retail Agent](https://github.com/Arjunn28/retail-agent) | Automates retail workflows |
| [DocCypher](https://github.com/Arjunn28/doc-cypher) | Extract answers from large PDFs |
| **SnapIQ** | **Turn document images into structured data** |

## What it demonstrates
- Multimodal API integration (vision + language)
- Prompt engineering for structured extraction
- FastAPI image handling with base64 encoding
- Clean single-page React frontend

## Stack
- **Backend**: FastAPI + Anthropic Claude Vision API
- **Frontend**: React + Vite + Tailwind CSS
- **Hosting**: Render (backend) + Vercel (frontend)

## Run locally

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env     # add your ANTHROPIC_API_KEY
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Open http://localhost:5173

## How it works
```
Upload image
     ↓
Base64 encode in frontend
     ↓
POST /analyze to FastAPI
     ↓
Claude Vision reads image + structured prompt
     ↓
JSON: vendor · date · line items · total · summary
     ↓
Rendered as clean card UI
```
