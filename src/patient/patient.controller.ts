import { Controller, Get } from '@nestjs/common';
import { PatientService } from './patient.service';

@Controller('patient')
export class PatientController {
    constructor(
        private readonly patientService: PatientService,
    ) { }

    @Get()
    async findAll() {
        return this.patientService.findAll();
    }
}
