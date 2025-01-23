import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('food')
export class FoodEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 512 })
    name: string

    @Column({ type: 'varchar', length: 512 })
    category: string

    @Column({ type: 'double' })
    suggested_quantity: number

    @Column({ type: 'varchar', length: 512 })
    unit: string

    @Column({ type: 'int' })
    gross_weight: number

    @Column({ type: 'int' })
    net_weight: number

    @Column({ type: 'int' })
    energy: number

    @Column({ type: 'double' })
    proteins: number

    @Column({ type: 'double' })
    lipids: number

    @Column({ type: 'double' })
    carbohydrates: number

    @Column({ type: 'varchar', length: 512 })
    saturated_fa: string

    @Column({ type: 'varchar', length: 512 })
    monounsaturated_fa: string

    @Column({ type: 'varchar', length: 512 })
    polyunsaturated_fa: string

    @Column({ type: 'varchar', length: 512 })
    cholesterol: string

    @Column({ type: 'varchar', length: 512 })
    sugar: string

    @Column({ type: 'double' })
    fiber: number

    @Column({ type: 'double' })
    vitamin_a: number

    @Column({ type: 'double' })
    ascorbic_acid: number

    @Column({ type: 'double' })
    folic_acid: number

    @Column({ type: 'double' })
    calcium: number

    @Column({ type: 'double' })
    iron: number

    @Column({ type: 'varchar', length: 512 })
    potassium: string

    @Column({ type: 'double' })
    sodium: number

    @Column({ type: 'varchar', length: 512 })
    phosphorus: string

    @Column({ type: 'varchar', length: 512 })
    ethanol: string

    @Column({ type: 'varchar', length: 512 })
    ig: string

    @Column({ type: 'varchar', length: 512 })
    glycemic_load: string
}
