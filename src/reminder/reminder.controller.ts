import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { PatientService } from 'src/patient/patient.service';
import { FoodService } from 'src/food/food.service';
import { ReminderRequest } from 'src/common/requests/reminder.request';
import { ReminderEntity } from './reminder.entity';
import { PatientEntity } from 'src/patient/patient.entity';

@Controller('reminder')
export class ReminderController {
    constructor(
        private readonly reminderService: ReminderService,
        private readonly patientService: PatientService,
        private readonly foodService: FoodService,
    ) { }

    @Get()
    async findAll(
        @Query('patient') patient: string,
        @Query('date') date: Date,
        @Query('meal_type') meal_type: string,
        @Query('type') type: string,
    ): Promise<any> {
        if (patient && date && meal_type) {
            const reminders = await this.reminderService.findAll({ patient, date, meal_type });

            return reminders.map(({ food, ...data }) => ({
                ...data,
                ...food,
                quantity: data.equivalents * food.suggested_quantity,
            }));
        }

        if (patient && date && type === 'macro') {
            const reminders = await this.reminderService.findAllByDate({ patient, date });
            const nutrients = { energy: 0, proteins: 0, carbohydrates: 0, lipids: 0 };
            const meal_types = [
                { name: 'Desayuno', value: 'breakfast', nutrients: { ...nutrients } },
                { name: 'Colación 1', value: 'snack1', nutrients: { ...nutrients } },	
                { name: 'Comida', value: 'lunch', nutrients: { ...nutrients } },
                { name: 'Colación 2', value: 'snack2', nutrients: { ...nutrients } },
                { name: 'Cena', value: 'dinner', nutrients: { ...nutrients } },
            ]

            return reminders.reduce((acc, { food, ...data }) => {
                const { energy, proteins, carbohydrates, lipids } = food;

                const finded = acc.find((meal) => meal.name === data.meal_type);
                if (finded) {
                    finded.nutrients.energy += energy * data.equivalents;
                    finded.nutrients.proteins += proteins * data.equivalents;
                    finded.nutrients.carbohydrates += carbohydrates * data.equivalents;
                    finded.nutrients.lipids += lipids * data.equivalents;
                }

                return acc;
            }, meal_types);
        }

        if (patient && date && type === 'units') {
            const reminders = await this.reminderService.findAllByDate({ patient, date });
            const nutrients = { energy: 0, proteins: 0, carbohydrates: 0, lipids: 0 };
            const data = { grams: { ...nutrients }, energy: { ...nutrients } };

            return reminders.reduce((acc, { food, ...data }) => {
                const { energy, proteins, carbohydrates, lipids } = food;

                acc.grams.energy += this.numberForamat(energy * data.equivalents);
                acc.grams.proteins += this.numberForamat(proteins * data.equivalents);
                acc.grams.carbohydrates += this.numberForamat(carbohydrates * data.equivalents);
                acc.grams.lipids += this.numberForamat(lipids * data.equivalents);

                acc.energy.energy += this.numberForamat(energy * data.equivalents);
                acc.energy.proteins += this.numberForamat((proteins * data.equivalents) * 4);
                acc.energy.carbohydrates += this.numberForamat((carbohydrates * data.equivalents) * 4);
                acc.energy.lipids += this.numberForamat((lipids * data.equivalents) * 9);

                return acc;
            }, data);
        }

        return [];
    }

    @Get('dates')
    async findAllDistinctDates(
        @Query('patientId') patientId: number,
    ): Promise<Date[]> {
        return this.reminderService.findAllDistinctDates(patientId);
    }

    @Post()
    async create(@Body() body: ReminderRequest): Promise<any> {
        try {
            let patient = await this.patientService.findByName(body.patient);
            if (!patient) {
                const _patient: PatientEntity = {
                    name: body.patient,
                    gender: body.gender,
                };
                patient = await this.patientService.create(_patient);
            }

            const food = await this.foodService.findById(body.food_id);
            if (!food) {
                throw new Error(`Food with id ${body.food_id} not found`);
            }

            const _reminder: ReminderEntity = {
                date: body.date,
                meal_type: body.meal_type,
                equivalents: body.equivalents,
                patient,
                food,
            };
            const reminder = await this.reminderService.create(_reminder);

            return { reminder, patient };
        } catch (error) {
            console.log("🚀 ~ ReminderController ~ create ~ error:", error)
            return error;
        }
    }

    numberForamat(value: number): number {
        return parseFloat(value.toFixed(2));
    }
}
