import { FoodEntity } from "src/food/food.entity";
import { PatientEntity } from "src/patient/patient.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('reminders')
export class ReminderEntity {
    @PrimaryGeneratedColumn()
    id?: number

    @Column({ type: 'date' })
    date: Date

    @Column({ type: 'varchar', length: 512 })
    meal_type: string

    @Column({ type: 'double' })
    equivalents: number

    @ManyToOne(() => FoodEntity)
    food: FoodEntity

    @ManyToOne(() => PatientEntity, patient => patient.reminders)
    patient: PatientEntity
}
