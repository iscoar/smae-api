import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReminderEntity } from './reminder.entity';
import { PatientModule } from 'src/patient/patient.module';
import { FoodModule } from 'src/food/food.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReminderEntity]),
    PatientModule,
    FoodModule
  ],
  providers: [ReminderService],
  controllers: [ReminderController]
})
export class ReminderModule {}
