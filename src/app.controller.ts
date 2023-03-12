import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/option-chain')
  getOptionChain() {
    return this.appService.fetchOptionChain();
  }

  @Get('/sentiment')
  getSentiment(@Query('query') instrument: string) {
    return this.appService.getSentimentAnalysis(instrument);
  }
}
