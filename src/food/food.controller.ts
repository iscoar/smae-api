import { Controller, Get, Param, Query } from '@nestjs/common';
import { FoodService } from './food.service';

@Controller('food')
export class FoodController {
    constructor(private readonly foodService: FoodService) {}

    @Get()
    async findAll(@Query('name') name: string, @Query('id') id: number) {
        try {
            if (id) {
                return await this.foodService.findById(id);
            }
            if (name) {
                return await this.foodService.findByName(name);
            }
            return [];
        } catch (error) {
            return error.message;
        }
    }
}
