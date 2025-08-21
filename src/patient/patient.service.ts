import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PatientEntity } from './patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PatientService implements OnModuleInit {
  private readonly logger = new Logger(PatientService.name);
  private patientsInMemory: PatientEntity[] = [];
  private isDataLoaded = false;

  constructor(
    @InjectRepository(PatientEntity)
    private readonly patientRepository: Repository<PatientEntity>,
  ) {}

  async onModuleInit() {
    await this.loadDataIntoMemory();
  }

  private async loadDataIntoMemory(): Promise<void> {
    try {
      this.logger.log('Cargando pacientes en memoria...');
      const startTime = Date.now();

      // Cargar todos los pacientes de la BD
      const patients = await this.patientRepository.find({
        select: ['id', 'name'],
        order: { name: 'ASC' },
      });

      this.patientsInMemory = patients;

      const loadTime = Date.now() - startTime;
      this.isDataLoaded = true;

      this.logger.log(
        `✅ ${patients.length} pacientes cargados en memoria en ${loadTime}ms`,
      );
    } catch (error) {
      this.logger.error('❌ Error cargando datos en memoria:', error);
      throw new Error('Error inicializando servicio de pacientes');
    }
  }

  async findAll(): Promise<PatientEntity[]> {
    return this.patientRepository.find({
      order: {
        name: 'ASC',
      },
      take: 3,
    });
  }

  async findByQueryName(name: string): Promise<PatientEntity[]> {
    // Verificar que los datos estén cargados
    if (!this.isDataLoaded) {
      throw new Error(
        'Servicio aún no está listo. Intenta de nuevo en unos segundos.',
      );
    }

    // Validación de entrada
    if (!name || typeof name !== 'string') {
      return [];
    }

    const searchTerm = name
      .normalize('NFD')
      .replace(
        /([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,
        '$1',
      )
      .normalize()
      .toLowerCase()
      .trim();

    // No buscar si es muy corto para evitar demasiados resultados
    if (searchTerm.length < 2) {
      return [];
    }

    // Búsqueda en memoria - muy rápida
    const results = this.patientsInMemory.filter((patient) => {
      const patientName = patient.name
        .normalize('NFD')
        .replace(
          /([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,
          '$1',
        )
        .normalize()
        .toLowerCase();
      return patientName.includes(searchTerm);
    });

    // Ordenar por relevancia: primero los que empiecen con el término
    const sortedResults = results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aStartsWith = aName.startsWith(searchTerm);
      const bStartsWith = bName.startsWith(searchTerm);

      // Priorizar los que empiecen con el término de búsqueda
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Si ambos empiezan igual, ordenar alfabéticamente
      return aName.localeCompare(bName);
    });

    // Limitar resultados para mejor performance en frontend
    return sortedResults.slice(0, 5);
  }

  async findByName(name: string): Promise<PatientEntity | null> {
    const patient = await this.patientRepository.findOneBy({ name });

    return patient;
  }

  async create(patient: PatientEntity): Promise<PatientEntity> {
    const saved =  await this.patientRepository.save(patient);
    this.patientsInMemory.push(saved);
    return saved;
  }

  async reloadData(): Promise<void> {
    this.logger.log('Recargando datos...');
    this.isDataLoaded = false;
    await this.loadDataIntoMemory();
  }
}
