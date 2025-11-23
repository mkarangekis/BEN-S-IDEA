import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PredictiveService {
  private mlServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.mlServiceUrl = this.configService.get('ML_SERVICE_URL') || 'http://localhost:8001';
  }

  async predictHammerPrice(input: {
    estimateLow: number;
    estimateHigh: number;
    category: string;
    historicalVolatilityIndex: number;
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/predict/hammer-price`, input)
      );
      return response.data;
    } catch (error) {
      // Fallback to simple calculation if ML service is unavailable
      const midEstimate = (input.estimateLow + input.estimateHigh) / 2;
      const volatilityFactor = 1 + (Math.random() - 0.5) * input.historicalVolatilityIndex;
      const predicted = midEstimate * volatilityFactor;

      return {
        predictedHammerPrice: Math.round(predicted),
        confidenceLower: Math.round(predicted * 0.85),
        confidenceUpper: Math.round(predicted * 1.15),
        explanation: 'Fallback prediction based on estimate midpoint with volatility adjustment',
      };
    }
  }

  async predictSellThrough(input: {
    category: string;
    estimateLow: number;
    estimateHigh: number;
    reservePrice?: number;
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/predict/sell-through`, input)
      );
      return response.data;
    } catch (error) {
      // Fallback
      const probability = 0.65 + Math.random() * 0.2;
      return {
        sellThroughProbability: probability,
        upliftScenarios: [
          { action: 'Lower reserve by 10%', uplift: 0.08 },
          { action: 'Improve catalog description', uplift: 0.05 },
        ],
      };
    }
  }

  async predictPricing(input: {
    brand: string;
    model: string;
    category: string;
    askingPrice: number;
    conditionScore: number;
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/predict/pricing`, input)
      );
      return response.data;
    } catch (error) {
      // Fallback
      const conditionMultiplier = 0.6 + (input.conditionScore / 5) * 0.4;
      const predicted = input.askingPrice * conditionMultiplier;
      const recommended = predicted * 0.95;
      const margin = (recommended - predicted * 0.7) / recommended;

      return {
        predictedPrice: Math.round(predicted),
        recommendedPrice: Math.round(recommended),
        marginProjection: Math.round(margin * 100) / 100,
        confidenceBand: {
          lower: Math.round(predicted * 0.9),
          upper: Math.round(predicted * 1.1),
        },
      };
    }
  }
}
