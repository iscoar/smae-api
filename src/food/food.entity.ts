import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity('food')
export class FoodEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: 512 })
    name: string

    @Column({ type: 'varchar', length: 512 })
    category: string

    @Column({ type: 'decimal' })
    suggested_quantity: number

    @Column({ type: 'varchar', length: 512 })
    unit: string

    @Column({ type: 'int' })
    gross_weight: number

    @Column({ type: 'int' })
    net_weight: number

    @Column({ type: 'int' })
    energy: number

    @Column({ type: 'decimal' })
    proteins: number

    @Column({ type: 'decimal' })
    lipids: number

    @Column({ type: 'decimal' })
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

    @Column({ type: 'decimal' })
    fiber: number

    @Column({ type: 'decimal' })
    vitamin_a: number

    @Column({ type: 'decimal' })
    ascorbic_acid: number

    @Column({ type: 'decimal' })
    folic_acid: number

    @Column({ type: 'decimal' })
    calcium: number

    @Column({ type: 'decimal' })
    iron: number

    @Column({ type: 'varchar', length: 512 })
    potassium: string

    @Column({ type: 'decimal' })
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
