import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

const isSiteExist = !!process.env.API_URL;
const SELF_URL = process.env.API_URL + '/ping';

@Injectable()
export class PingService {
  private readonly logger = new Logger(PingService.name);

  @Cron('*/3 * * * *')
  async handleCron() {
    if (!isSiteExist) {
      this.logger.warn('[PING] Site url is not defined.');
      return;
    }

    try {
      await fetch(SELF_URL);
      this.logger.log(`OK, ${new Date().toISOString()}`);
    } catch (e) {
      this.logger.log(`Site url `, SELF_URL);
      this.logger.error('Ошибка при пинге:', e);
    }
  }
}
