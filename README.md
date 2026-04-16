# SnapIQ

Upload a photo of any business document and get back clean, structured data instantly.

Vendor, date, line items, totals, currency — extracted by a vision AI and returned as JSON. No manual entry, no templates, no configuration.

![SnapIQ Demo](assets/snap-iq-overview-ss.png)

**Live demo:** https://snap-iq-kappa.vercel.app

---

## What it does

Point it at a receipt, invoice, or delivery note. It reads the image, understands the document, and returns structured output ready to plug into any downstream system — a CRM, an ERP, a Slack bot, whatever.

```
Image upload
     |
Base64 encode
     |
POST /analyze  (FastAPI)
     |
Vision LLM reads image + prompt
     |
JSON: vendor · date · line items · total · currency · summary
     |
React renders result card
```

---

## Tech stack

| Layer | Tool |
|-------|------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Vision AI | Multimodal LLM via OpenRouter |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Why I built this

Every automation pipeline has a blind spot: physical documents. Invoices arrive as photos. Receipts get scanned. Delivery notes come in on paper.

SnapIQ is the intake layer that converts those images into structured data before the rest of the workflow takes over. It pairs naturally with my other projects:

| Project | What it handles |
|---------|----------------|
| [RetailIQ Copilot](https://github.com/Arjunn28/retail-iq-copilot) | Text queries from business stakeholders |
| [Retail Agent](https://github.com/Arjunn28/retail-agent) | Automated retail workflow execution |
| [DocCypher](https://github.com/Arjunn28/doc-cypher) | Large PDF analysis and Q&A |
| SnapIQ | Image documents to structured data |

---

## Run locally

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
echo "OPENROUTER_API_KEY=your_key_here" > .env
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Open http://localhost:5173

---

## API

`POST /analyze`

![SnapIQ Demo](assets/snap-iq-output-ss.png)

Accepts a multipart image upload. Returns:

```json
{
  "vendor": "Amazon",
  "date": "08 March 2025",
  "currency": "GBP",
  "line_items": [
    { "description": "Oral-B Pro 2500 Toothbrush", "amount": 40.70 }
  ],
  "subtotal": null,
  "tax": 6.78,
  "total": 40.70,
  "summary": "Invoice from Amazon for an Oral-B electric toothbrush. Total amount due is 40.70 GBP including VAT."
}
```

`GET /health` returns `{"status": "ok"}`

---

Built by Arjun AN · 2026
