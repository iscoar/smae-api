import { BadRequestException, Controller, Get, HttpException, HttpStatus, Logger, Query } from '@nestjs/common';
import { PatientService } from './patient.service';

@Controller('patient')
export class PatientController {
  private readonly logger = new Logger(PatientController.name);

  constructor(private readonly patientService: PatientService) {}

  @Get()
  async findAll(@Query('name') name?: string) {
    const startTime = Date.now();
    try {
      let result: any;
      if (!name) {
        result = await this.patientService.findAll();
        return {
          success: true,
          data: result,
          count: result.length,
        };
      }

      if (name) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          throw new BadRequestException('El nombre no puede estar vacío');
        }

        if (name.trim().length > 100) {
          throw new BadRequestException('El nombre es demasiado largo');
        }

        result = await this.patientService.findByQueryName(name);
      }

      const responseTime = Date.now() - startTime;
      if (responseTime > 10) {
        // Solo log si tarda más de 10ms (inusual)
        this.logger.warn(
          `Búsqueda lenta: ${responseTime}ms para ${name}`,
        );
      }

      return {
        success: true,
        data: result,
        count: result.length,
        responseTime: `${responseTime}ms`,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.logger.error(`Error en búsqueda (${responseTime}ms):`, {
        error: error.message,
        query: { name },
      });

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.message.includes('no está listo')) {
        throw new HttpException(
          'Servicio inicializando, intenta de nuevo en unos segundos',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        error.message || 'Error interno del servidor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
