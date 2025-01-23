import { Injectable } from '@nestjs/common';
import { PatientEntity } from './patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PatientService {
    constructor(
        @InjectRepository(PatientEntity)
        private readonly patientRepository: Repository<PatientEntity>,
    ) { }

    async findAll(): Promise<PatientEntity[]> {
        return this.patientRepository.find({
            order: {
                name: 'ASC',
            },
            take: 3,
        });
    }

    async findByName(name: string): Promise<PatientEntity | null> {
        const patient = await this.patientRepository.findOneBy({ name });

        return patient;
    }

    async create(patient: PatientEntity): Promise<PatientEntity> {
        return this.patientRepository.save(patient);
    }
}
