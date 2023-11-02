// product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, VersionColumn, OneToMany } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { ProductImage } from 'src/product-image/entities/product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', default: 0, precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', default: 0, precision: 10, scale: 2 })
  buying_price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: "string", nullable: true })
  category_id: string;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: true,
    cascade: true
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  product_code: string;

  @Column({ type: 'varchar', length: 255})
  size: string;

  @Column({type: 'varchar'})
  color: string;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @VersionColumn()
  version: number;

}
