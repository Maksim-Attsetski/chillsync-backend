// app.controller.ts
import { Controller, Get } from '@nestjs/common';

import { PingService } from './ping.service';

@Controller()
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Get('ping')
  ping(): string {
    console.log('PONG');
    return 'pong';
  }
}
