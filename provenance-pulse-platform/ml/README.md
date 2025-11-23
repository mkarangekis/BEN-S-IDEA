# Provenance Pulse ML Service

FastAPI-based machine learning service providing prediction and analysis endpoints.

## Endpoints

- `POST /predict/hammer-price` - Predict auction hammer price
- `POST /predict/sell-through` - Predict sell-through probability
- `POST /predict/pricing` - Predict luxury item pricing
- `POST /provenance/score` - Score provenance and authenticity
- `POST /catalog/generate-description` - Generate catalog description
- `POST /catalog/grade-condition` - Grade item condition

## Running Locally

```bash
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8001
```

## Note

These are mock implementations with deterministic rules and randomization.
Replace with actual ML models for production use.
