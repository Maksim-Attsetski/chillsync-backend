import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class PingService {
  private readonly intervalMs = 7000; // каждые 10 секунд

  constructor(private readonly httpService: HttpService) {}

  // async onModuleInit() {
  //   // Первый вызов при инициализации
  //   await this.sendPing();

  //   // Последующие вызовы
  //   setInterval(() => {
  //     this.sendPing();
  //   }, this.intervalMs);
  // }

  async receivePing() {
    try {
      console.log('PING');
      return true;
    } catch (error) {
      console.error('Ошибка при запросе:', error.message);
    }
  }
}
