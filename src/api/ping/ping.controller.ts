// app.controller.ts
import { Controller, Get, OnApplicationBootstrap } from '@nestjs/common';
import { PingService } from './ping.service';

@Controller()
export class PingController implements OnApplicationBootstrap {
  constructor(private readonly pingService: PingService) {}

  onApplicationBootstrap() {
    if (process.env.IS_DEV) {
      setInterval(() => {
        this.pingService.selfPing();
      }, 9_000);
    }
  }

  @Get('ping')
  async ping(): Promise<string> {
    return 'pong';
  }
}
