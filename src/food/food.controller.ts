import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FoodService } from './food.service';

@Controller('food')
export class FoodController {
  private readonly logger = new Logger(FoodController.name);

  constructor(private readonly foodService: FoodService) {}

  @Get()
  async findAll(@Query('name') name?: string, @Query('id') id?: string) {
    const startTime = Date.now();
    try {
      if (!id && !name) {
        return {
          success: true,
          data: [],
          message: 'Proporciona un ID o nombre para buscar',
        };
      }
      let result: any;

      if (id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId) || numericId <= 0) {
          throw new BadRequestException(
            'El ID debe ser un número válido mayor a 0',
          );
        }

        result = await this.foodService.findById(numericId);

        result = [result];
      } else if (name) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          throw new BadRequestException('El nombre no puede estar vacío');
        }

        if (name.trim().length > 100) {
          throw new BadRequestException('El nombre es demasiado largo');
        }

        result = await this.foodService.findByName(name);
      }

      const responseTime = Date.now() - startTime;
      if (responseTime > 10) {
        // Solo log si tarda más de 10ms (inusual)
        this.logger.warn(
          `Búsqueda lenta: ${responseTime}ms para ${name ? `"${name}"` : `ID ${id}`}`,
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
        query: { id, name },
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

  // Endpoint adicional para estadísticas del servicio
  @Get('stats')
  getStats() {
    return this.foodService.getServiceStats();
  }

  // Endpoint para alimentos aleatorios (sugerencias)
  @Get('random')
  getRandomFoods(@Query('count') count?: string) {
    const numCount = count ? parseInt(count, 10) : 5;
    const validCount = Math.min(Math.max(numCount, 1), 20); // Entre 1 y 20

    return {
      success: true,
      data: this.foodService.getRandomFoods(validCount),
    };
  }

  // Endpoint para recargar datos (solo para desarrollo/admin)
  @Get('reload')
  async reloadData() {
    try {
      await this.foodService.reloadData();
      return {
        success: true,
        message: 'Datos recargados exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        'Error recargando datos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
