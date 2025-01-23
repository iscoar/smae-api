import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FoodEntity } from './food.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class FoodService {
    constructor(
        @InjectRepository(FoodEntity)
        private readonly foodRepository: Repository<FoodEntity>,
    ) {}

    async findById(id: number): Promise<FoodEntity> {
        const food = await this.foodRepository.findOne({ where: { id } });
        if (!food) {
            throw new Error(`Food with id ${id} not found`);
        }
        return food;
    }

    async findByName(name: string): Promise<FoodEntity[]> {
        return await this.foodRepository.find({ 
            select: ['id', 'name'],
            where: { name: Like(`%${name}%`) },
            take: 5,
        });
    }
}
