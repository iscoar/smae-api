import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReminderEntity } from './reminder.entity';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ReminderService {
    private readonly logger = new Logger(ReminderService.name);

    constructor(
        @InjectRepository(ReminderEntity)
        private readonly reminderRepository: Repository<ReminderEntity>,
    ) { }

    async findAll({
        patient,
        date,
        meal_type,
    }: { patient: string, date: Date, meal_type: string }): Promise<ReminderEntity[]> {
        return this.reminderRepository.find({
            where: {
                patient: {
                    name: patient,
                },
                date,
                meal_type,
            },
            relations: ['food'],
            select: {
                id: true,
                equivalents: true,
                food: {
                    name: true,
                    category: true,
                    suggested_quantity: true,
                    unit: true,
                },
            }
        });
    }

    async findAllByDate({
        patient,
        date,
    }: { patient: string, date: Date }): Promise<ReminderEntity[]> {
        return this.reminderRepository.find({
            where: {
                patient: {
                    name: patient,
                },
                date,
            },
            relations: ['food'],
            select: {
                id: true,
                equivalents: true,
                meal_type: true,
                food: {
                    name: true,
                    category: true,
                    suggested_quantity: true,
                    unit: true,
                    energy: true,
                    proteins: true,
                    carbohydrates: true,
                    lipids: true,
                },
            }
        });
    }

    async findAllDistinctDates(pacientId: number): Promise<Date[]> {
        return this.reminderRepository.createQueryBuilder('reminder')
            .select('DISTINCT date')
            .where('reminder.patientId = :pacientId', { pacientId })
            .getRawMany()
            .then((dates) => dates.map(({ date }) => date
        ));
    }

    async create(reminder: ReminderEntity): Promise<ReminderEntity> {
        return this.reminderRepository.save(reminder);
    }

    @Cron('0 0 * * *') // Runs every day at midnight
    async handleCron(): Promise<void> {
        const reminders = await this.reminderRepository.find({
            where: {
                date: new Date(),
            },
        });
        this.logger.log(`Found ${reminders.length} reminders for today.`);
    }
}
