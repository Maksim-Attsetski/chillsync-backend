import { Controller, Get, OnModuleInit } from '@nestjs/common';

import { PingService } from './ping.service';

@Controller('ping')
export class PingController implements OnModuleInit {
  constructor(private readonly pingService: PingService) {}

  async onModuleInit() {
    if (process.env.IS_PROD) {
      // Первый вызов при инициализации
      await this.pingService.receivePing();

      // Последующие вызовы
      setInterval(() => {
        this.pingService.receivePing();
      }, 7000);
    }
  }

  @Get()
  receive() {
    return this.pingService.receivePing();
  }
}
