import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PingService {
  constructor(private readonly httpService: HttpService) {}
  async selfPing() {
    try {
      const url = process.env.API_URL + 'ping';
      await firstValueFrom(this.httpService.get(url));
    } catch (err) {
      console.error('Self ping failed', err);
    }
  }
}
