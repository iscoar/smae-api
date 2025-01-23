import { ReminderEntity } from "src/reminder/reminder.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('patients')
export class PatientEntity {
    @PrimaryGeneratedColumn()
    id?: number

    @Column({ type: 'varchar', length: 512 })
    name: string

    @Column({ type: 'varchar', length: 512 })
    gender: string

    @OneToMany(() => ReminderEntity, reminder => reminder.patient)
    reminders?: ReminderEntity[]
}
