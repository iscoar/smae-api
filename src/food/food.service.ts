import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodEntity } from './food.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FoodService implements OnModuleInit {
  private readonly logger = new Logger(FoodService.name);
  private foodsInMemory: FoodEntity[] = [];
  private foodsById: Map<number, FoodEntity> = new Map();
  private isDataLoaded = false;

  constructor(
    @InjectRepository(FoodEntity)
    private readonly foodRepository: Repository<FoodEntity>,
  ) {}

  async onModuleInit() {
    await this.loadDataIntoMemory();
  }

  private async loadDataIntoMemory(): Promise<void> {
    try {
      this.logger.log('Cargando alimentos en memoria...');
      const startTime = Date.now();

      // Cargar todos los alimentos de la BD
      const foods = await this.foodRepository.find({
        select: ['id', 'name'],
        order: { name: 'ASC' },
      });

      this.foodsInMemory = foods;

      this.foodsById.clear();
      foods.forEach((food) => {
        this.foodsById.set(food.id, food);
      });

      const loadTime = Date.now() - startTime;
      this.isDataLoaded = true;

      this.logger.log(
        `✅ ${foods.length} alimentos cargados en memoria en ${loadTime}ms`,
      );
    } catch (error) {
      this.logger.error('❌ Error cargando datos en memoria:', error);
      throw new Error('Error inicializando servicio de alimentos');
    }
  }

  async findById(id: number): Promise<FoodEntity> {
    const food = await this.foodRepository.findOne({ where: { id } });
    if (!food) {
      throw new Error(`Food with id ${id} not found`);
    }
    return food;
  }

  async findByName(name: string): Promise<FoodEntity[]> {
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
    const results = this.foodsInMemory.filter((food) => {
      const foodName = food.name
        .normalize('NFD')
        .replace(
          /([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi,
          '$1',
        )
        .normalize()
        .toLowerCase();
      return foodName.includes(searchTerm);
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
    return sortedResults.slice(0, 20);
  }

  // Método para obtener estadísticas del servicio
  getServiceStats(): {
    isLoaded: boolean;
    totalFoods: number;
    memoryUsage: string;
  } {
    return {
      isLoaded: this.isDataLoaded,
      totalFoods: this.foodsInMemory.length,
      memoryUsage: `${this.foodsInMemory.length} alimentos en memoria`,
    };
  }

  // Método para recargar datos (útil para debugging o futuras actualizaciones)
  async reloadData(): Promise<void> {
    this.logger.log('Recargando datos...');
    this.isDataLoaded = false;
    await this.loadDataIntoMemory();
  }

  // Método para búsqueda exacta (si necesitas en el futuro)
  async findExactByName(name: string): Promise<FoodEntity | null> {
    if (!this.isDataLoaded) {
      return null;
    }

    const exactMatch = this.foodsInMemory.find(
      (food) => food.name.toLowerCase() === name.toLowerCase().trim(),
    );

    return exactMatch || null;
  }

  // Método para obtener alimentos aleatorios (útil para sugerencias)
  getRandomFoods(count: number = 5): FoodEntity[] {
    if (!this.isDataLoaded || this.foodsInMemory.length === 0) {
      return [];
    }

    const shuffled = [...this.foodsInMemory].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
