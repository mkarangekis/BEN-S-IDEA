from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import random

app = FastAPI(title="Provenance Pulse ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models

class HammerPriceRequest(BaseModel):
    estimateLow: float
    estimateHigh: float
    category: str
    historicalVolatilityIndex: float = 0.15

class HammerPriceResponse(BaseModel):
    predictedHammerPrice: float
    confidenceLower: float
    confidenceUpper: float
    explanation: str

class SellThroughRequest(BaseModel):
    category: str
    estimateLow: float
    estimateHigh: float
    reservePrice: Optional[float] = None

class SellThroughResponse(BaseModel):
    sellThroughProbability: float
    upliftScenarios: List[dict]

class PricingRequest(BaseModel):
    brand: str
    model: str
    category: str
    askingPrice: float
    conditionScore: float

class PricingResponse(BaseModel):
    predictedPrice: float
    recommendedPrice: float
    marginProjection: float
    confidenceBand: dict

class ProvenanceRequest(BaseModel):
    lotId: str
    category: str
    hasDocumentation: bool
    chainOfCustodyLength: int

class ProvenanceResponse(BaseModel):
    provenanceScore: float
    authenticityScore: float
    flags: List[str]
    chainOfCustody: List[dict]

class DescriptionRequest(BaseModel):
    title: str
    category: str
    artist: Optional[str] = None
    year: Optional[int] = None
    medium: Optional[str] = None
    dimensions: Optional[str] = None

class DescriptionResponse(BaseModel):
    description: str
    keywords: List[str]
    suggestedTags: List[str]

class ConditionRequest(BaseModel):
    category: str
    brand: Optional[str] = None
    imageUrls: List[str] = []

class ConditionResponse(BaseModel):
    conditionScore: float
    narrative: str
    details: dict

# Endpoints

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ml"}

@app.post("/predict/hammer-price", response_model=HammerPriceResponse)
async def predict_hammer_price(request: HammerPriceRequest):
    """Predict hammer price for an auction lot."""
    mid_estimate = (request.estimateLow + request.estimateHigh) / 2

    # Simulate model prediction with some randomness
    volatility_factor = 1 + (random.random() - 0.5) * request.historicalVolatilityIndex * 2

    # Category adjustments
    category_multipliers = {
        "Contemporary Art": 1.15,
        "Impressionist": 1.10,
        "Old Masters": 1.05,
        "Jewelry": 1.08,
        "Watches": 1.12,
        "Wine": 0.95,
    }
    category_mult = category_multipliers.get(request.category, 1.0)

    predicted = mid_estimate * volatility_factor * category_mult
    confidence_range = predicted * 0.15

    return HammerPriceResponse(
        predictedHammerPrice=round(predicted, 2),
        confidenceLower=round(predicted - confidence_range, 2),
        confidenceUpper=round(predicted + confidence_range, 2),
        explanation=f"Based on {request.category} market trends and historical volatility of {request.historicalVolatilityIndex:.2%}"
    )

@app.post("/predict/sell-through", response_model=SellThroughResponse)
async def predict_sell_through(request: SellThroughRequest):
    """Predict probability of sale."""
    base_prob = 0.65 + random.random() * 0.15

    # Reserve price impact
    if request.reservePrice:
        reserve_ratio = request.reservePrice / request.estimateLow
        if reserve_ratio > 0.9:
            base_prob -= 0.1
        elif reserve_ratio < 0.7:
            base_prob += 0.05

    return SellThroughResponse(
        sellThroughProbability=round(min(base_prob, 0.95), 3),
        upliftScenarios=[
            {"action": "Lower reserve by 10%", "uplift": 0.08},
            {"action": "Improve catalog description", "uplift": 0.05},
            {"action": "Add provenance documentation", "uplift": 0.07},
        ]
    )

@app.post("/predict/pricing", response_model=PricingResponse)
async def predict_pricing(request: PricingRequest):
    """Predict optimal pricing for luxury item."""
    # Condition multiplier
    condition_mult = 0.6 + (request.conditionScore / 5) * 0.4

    # Brand premium
    premium_brands = ["Hermès", "Chanel", "Louis Vuitton", "Rolex", "Patek Philippe"]
    brand_mult = 1.1 if request.brand in premium_brands else 1.0

    predicted = request.askingPrice * condition_mult * brand_mult
    recommended = predicted * 0.95  # Slight discount for faster sale
    margin = (recommended - predicted * 0.65) / recommended

    return PricingResponse(
        predictedPrice=round(predicted, 2),
        recommendedPrice=round(recommended, 2),
        marginProjection=round(margin, 3),
        confidenceBand={
            "lower": round(predicted * 0.9, 2),
            "upper": round(predicted * 1.1, 2)
        }
    )

@app.post("/provenance/score", response_model=ProvenanceResponse)
async def score_provenance(request: ProvenanceRequest):
    """Score provenance and authenticity."""
    base_score = 0.5

    if request.hasDocumentation:
        base_score += 0.25

    base_score += min(request.chainOfCustodyLength * 0.05, 0.2)
    base_score += random.random() * 0.05

    provenance_score = min(base_score, 1.0)
    authenticity_score = provenance_score * 0.9 + random.random() * 0.1

    chain = []
    periods = ["1920-1950", "1950-1980", "1980-2000", "2000-2015", "2015-Present"]
    owners = ["Original Artist Estate", "Private Collection", "Gallery", "Collector", "Current Owner"]
    for i in range(min(request.chainOfCustodyLength, len(periods))):
        chain.append({"owner": owners[i], "period": periods[i]})

    return ProvenanceResponse(
        provenanceScore=round(provenance_score, 3),
        authenticityScore=round(min(authenticity_score, 1.0), 3),
        flags=[],
        chainOfCustody=chain
    )

@app.post("/catalog/generate-description", response_model=DescriptionResponse)
async def generate_description(request: DescriptionRequest):
    """Generate catalog description."""
    desc_parts = [request.title]

    if request.artist:
        desc_parts.append(f"by {request.artist}")
    if request.year:
        desc_parts.append(f"({request.year})")

    description = " ".join(desc_parts) + ". "

    if request.medium:
        description += f"{request.medium}. "
    if request.dimensions:
        description += f"Dimensions: {request.dimensions}. "

    description += f"This exceptional {request.category.lower()} work demonstrates remarkable craftsmanship and artistic vision, representing a significant addition to any discerning collection."

    keywords = [request.category]
    if request.artist:
        keywords.append(request.artist)
    if request.medium:
        keywords.append(request.medium)

    return DescriptionResponse(
        description=description,
        keywords=keywords,
        suggestedTags=["fine-art", "collectible", "investment-grade", request.category.lower().replace(" ", "-")]
    )

@app.post("/catalog/grade-condition", response_model=ConditionResponse)
async def grade_condition(request: ConditionRequest):
    """Grade item condition."""
    # Simulate condition grading
    score = 3.0 + random.random() * 1.5
    rounded_score = round(score, 1)

    narratives = {
        5: "Pristine condition. No visible wear or defects. As new.",
        4: "Excellent condition. Minimal signs of use. Well preserved.",
        3: "Good condition. Normal wear consistent with age. Minor imperfections.",
        2: "Fair condition. Noticeable wear and some damage.",
        1: "Poor condition. Significant damage. Restoration required.",
    }

    return ConditionResponse(
        conditionScore=rounded_score,
        narrative=narratives.get(round(rounded_score), narratives[3]),
        details={
            "surface": "Good" if rounded_score > 3 else "Fair",
            "structure": "Intact",
            "functionality": "Full" if rounded_score > 2 else "Partial",
            "originalParts": "100%" if rounded_score > 4 else "95%+"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
