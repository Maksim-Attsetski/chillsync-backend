import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth';
import { SettingsController } from './settings.controller';
import { Setting, SettingSchema } from './settings.entity';
import { SettingsService } from './settings.service';

export const settingsModel = MongooseModule.forFeature([
  { name: Setting.name, schema: SettingSchema },
]);

@Module({
  imports: [settingsModel, AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [settingsModel, SettingsService],
})
export class SettingsModule {}
