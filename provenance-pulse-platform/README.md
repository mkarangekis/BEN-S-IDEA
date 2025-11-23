# Provenance Pulse Platform

AI-powered intelligence platform for high-value assets, featuring two vertical products:
- **Auction Pulse** - For auction houses
- **Luxury Pulse** - For luxury resale marketplaces

## Architecture

- **Backend**: NestJS (TypeScript) with Prisma ORM
- **Frontend**: Next.js 14 (React/TypeScript) with Tailwind CSS
- **ML Service**: FastAPI (Python) with mock predictions
- **Database**: PostgreSQL
- **Cache**: Redis

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

## Quick Start with Docker

```bash
# Clone and enter directory
cd provenance-pulse-platform

# Start all services
docker-compose up --build

# Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - ML Service: http://localhost:8001
```

## Local Development

### 1. Set up environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 2. Install dependencies

```bash
# Root (monorepo)
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# ML Service
cd ../ml && pip install -r requirements.txt
```

### 3. Set up database

```bash
# Start PostgreSQL (via Docker or locally)
docker-compose up postgres redis -d

# Run migrations
cd backend
npm run db:generate
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Run services

```bash
# From root directory
npm run dev

# Or individually:
npm run dev:backend   # Port 3001
npm run dev:frontend  # Port 3000
npm run dev:ml        # Port 8001
```

## Demo Credentials

After seeding, use these accounts:

- **Auction Pulse**: admin@auctionpulse.com / password123
- **Luxury Pulse**: admin@luxurypulse.com / password123

## API Examples

### Authentication

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@auctionpulse.com", "password": "password123"}'
```

### Auction Pulse

```bash
# Get auctions
curl http://localhost:3001/api/auction/auctions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Predict hammer price
curl -X POST http://localhost:3001/api/auction/lots/LOT_ID/predict-hammer \
  -H "Authorization: Bearer YOUR_TOKEN"

# Control tower overview
curl http://localhost:3001/api/auction/control-tower/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Luxury Pulse

```bash
# Get listings
curl http://localhost:3001/api/luxury/listings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit authentication job
curl -X POST http://localhost:3001/api/luxury/authentication/submit-job \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"listingId": "LISTING_ID"}'

# Get authentication queue
curl http://localhost:3001/api/luxury/authentication/queue \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### ML Service Direct

```bash
# Predict hammer price
curl -X POST http://localhost:8001/predict/hammer-price \
  -H "Content-Type: application/json" \
  -d '{"estimateLow": 5000, "estimateHigh": 8000, "category": "Contemporary Art", "historicalVolatilityIndex": 0.15}'

# Grade condition
curl -X POST http://localhost:8001/catalog/grade-condition \
  -H "Content-Type: application/json" \
  -d '{"category": "Handbags", "brand": "Hermes", "imageUrls": []}'
```

## Project Structure

```
provenance-pulse-platform/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── auctions/       # Auction Pulse module
│   │   ├── luxury/         # Luxury Pulse module
│   │   ├── intelligence/   # AI/ML integration
│   │   ├── control-tower/  # Dashboard APIs
│   │   ├── governance/     # Audit & fraud
│   │   └── db/             # Prisma & seed
├── frontend/               # Next.js app
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── lib/               # Utilities
├── ml/                    # FastAPI ML service
│   └── api/              # Endpoints
└── infra/                # Infrastructure
    ├── docker/           # Dockerfiles
    └── k8s/              # Kubernetes manifests
```

## Key Features

### Auction Pulse
- Hammer price prediction with confidence bands
- Sell-through probability optimization
- Bidder engagement scoring & VIP identification
- Provenance & authenticity scoring
- Catalog intelligence (description generation, condition grading)
- Real-time control tower dashboard

### Luxury Pulse
- Authentication queue with risk prioritization
- Counterfeit detection risk scoring
- Dynamic pricing intelligence
- Condition grading automation
- Seller/buyer activation scoring
- Margin analysis by category

## Deployment

### Kubernetes

```bash
# Apply manifests
kubectl apply -f infra/k8s/

# Create secrets
kubectl create secret generic provenance-secrets \
  --from-literal=database-url=postgresql://... \
  --from-literal=jwt-secret=...
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

Proprietary - All rights reserved
