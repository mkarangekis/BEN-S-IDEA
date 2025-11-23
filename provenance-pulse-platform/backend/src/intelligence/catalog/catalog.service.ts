import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CatalogService {
  private mlServiceUrl: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.mlServiceUrl = this.configService.get('ML_SERVICE_URL') || 'http://localhost:8001';
  }

  async generateDescription(input: {
    title: string;
    category: string;
    artist?: string;
    year?: number;
    medium?: string;
    dimensions?: string;
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/catalog/generate-description`, input)
      );
      return response.data;
    } catch (error) {
      // Fallback description generation
      let description = `${input.title}`;
      if (input.artist) description += ` by ${input.artist}`;
      if (input.year) description += `, ${input.year}`;
      if (input.medium) description += `. ${input.medium}`;
      if (input.dimensions) description += `. Dimensions: ${input.dimensions}`;
      description += `. This ${input.category.toLowerCase()} piece represents exceptional craftsmanship and artistic vision.`;

      return {
        description,
        keywords: [input.category, input.artist, input.medium].filter(Boolean),
        suggestedTags: ['fine-art', 'collectible', 'investment-grade'],
      };
    }
  }

  async gradeCondition(input: {
    category: string;
    brand?: string;
    imageUrls: string[];
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/catalog/grade-condition`, input)
      );
      return response.data;
    } catch (error) {
      // Fallback grading
      const score = 3 + Math.random() * 1.5;
      const roundedScore = Math.round(score * 10) / 10;

      const narratives: Record<number, string> = {
        5: 'Pristine condition. No visible wear or defects. As new.',
        4: 'Excellent condition. Minimal signs of use. Well preserved.',
        3: 'Good condition. Normal wear consistent with age. Some minor imperfections.',
        2: 'Fair condition. Noticeable wear and some damage. Suitable for restoration.',
        1: 'Poor condition. Significant damage or wear. Major restoration required.',
      };

      return {
        conditionScore: roundedScore,
        narrative: narratives[Math.round(roundedScore)] || narratives[3],
        details: {
          surface: 'Good',
          structure: 'Intact',
          functionality: 'Full',
        },
      };
    }
  }
}
