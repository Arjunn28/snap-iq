import json
import os
import re
import base64
import httpx
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="SnapIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.environ["OPENROUTER_API_KEY"]
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

EXTRACTION_PROMPT = """You are a document extraction engine. Analyze this receipt or invoice image.
Return ONLY a valid JSON object — no markdown, no backticks, no explanation.

Required fields:
{
  "vendor": "business name as shown on document",
  "date": "date string as shown, or null",
  "currency": "currency code e.g. INR, USD, GBP",
  "line_items": [
    {
      "description": "item name",
      "quantity": null or number,
      "unit_price": null or number,
      "amount": number
    }
  ],
  "subtotal": null or number,
  "tax": null or number,
  "total": number,
  "summary": "1-2 sentence plain English summary of this document"
}

Return only the JSON. Nothing else."""


class AnalysisResult(BaseModel):
    vendor: Optional[str] = None
    date: Optional[str] = None
    currency: Optional[str] = None
    line_items: list = []
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    total: float = 0
    summary: Optional[str] = None


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_document(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported.")

    image_data = await file.read()
    b64 = base64.b64encode(image_data).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{b64}"

    payload = {
        # "model": "meta-llama/llama-4-maverick:free",
        "model": "openrouter/auto",
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": EXTRACTION_PROMPT},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5175",
        "X-Title": "SnapIQ"
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(OPENROUTER_URL, json=payload, headers=headers)
        if response.status_code != 200:
            print("OpenRouter error:", response.text)
            raise HTTPException(status_code=502, detail=f"OpenRouter error: {response.text}")
        result = response.json()

    raw_text = result["choices"][0]["message"]["content"].strip()
    print("Model response:", raw_text)
    clean = re.sub(r"```json|```", "", raw_text).strip()

    try:
        parsed = json.loads(clean)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Could not parse model response as JSON.")

    return parsed


@app.get("/health")
def health():
    return {"status": "ok"}
