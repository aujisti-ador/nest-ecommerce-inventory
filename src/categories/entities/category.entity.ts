// category.entity.ts
import { Product } from 'src/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, OneToMany, JoinColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @VersionColumn()
  version: number;

}
